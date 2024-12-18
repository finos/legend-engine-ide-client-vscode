/**
 * Copyright (c) 2020-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  type CompletionItem,
  type DataCubeAPI,
  type DataCubeExecutionResult,
  type DataCubeInitialInput,
  type PlainObject,
  type RelationType,
  type V1_ValueSpecification,
  _elementPtr,
  _function,
  assertTrue,
  DataCubeEngine,
  DataCubeFunction,
  DataCubeQuery,
  DataCubeSource,
  guaranteeType,
  isNonNullable,
  uuid,
  V1_AppliedFunction,
  V1_deserializeRawValueSpecification,
  V1_deserializeValueSpecification,
  V1_Lambda,
  V1_PackageableElementPtr,
  V1_RawLambda,
  V1_RelationalExecutionActivities,
  V1_serializeRawValueSpecification,
  V1_serializeValueSpecification,
  V1_TDSExecutionResult,
} from '@finos/legend-vscode-extension-dependencies';
import { V1_LSPEngine } from '../graph/V1_LSPEngine';
import { type VSCodeEvent } from 'vscode-notebook-renderer/events';

class LSPDataCubeSource extends DataCubeSource {
  mapping?: string | undefined;
  runtime: string | undefined;
}

export class LSPDataCubeEngine extends DataCubeEngine {
  lspEngine: V1_LSPEngine;
  rawLambda: V1_RawLambda;
  postMessage: (message: unknown) => void;
  onDidReceiveMessage: VSCodeEvent<{
    command: string;
    messageId: string;
    result: unknown;
  }>;

  postAndWaitForMessage =
    (cellUri: string) =>
    <T>(
      requestMessage: { command: string; msg?: PlainObject },
      responseCommandId: string,
    ): Promise<T> => {
      const messageId = uuid();
      this.postMessage({
        command: requestMessage.command,
        msg: requestMessage.msg,
        cellUri,
        messageId,
      });
      return new Promise((resolve) => {
        this.onDidReceiveMessage((message) => {
          if (
            message.command === responseCommandId &&
            message.messageId === messageId
          ) {
            resolve(message.result as T);
          }
        });
      });
    };

  constructor(
    cellUri: string,
    rawLambdaJson: PlainObject<V1_RawLambda>,
    postMessage: (message: unknown) => void,
    onDidReceiveMessage: VSCodeEvent<{
      command: string;
      messageId: string;
      result: unknown;
    }>,
  ) {
    super();
    this.lspEngine = new V1_LSPEngine(this.postAndWaitForMessage(cellUri));
    this.rawLambda = V1_deserializeRawValueSpecification(
      rawLambdaJson,
    ) as V1_RawLambda;
    this.postMessage = postMessage;
    this.onDidReceiveMessage = onDidReceiveMessage;
  }

  // ------------------------------- CORE OPERATIONS -------------------------------

  override async getInitialInput(): Promise<DataCubeInitialInput | undefined> {
    const source = new LSPDataCubeSource();
    source.query = V1_deserializeValueSpecification(
      V1_serializeRawValueSpecification(this.rawLambda),
      [],
    );
    // We could do a further check here to ensure the experssion is an applied funciton
    // this is because data cube expects an expression to be able to built further upon the queery
    if (
      source.query instanceof V1_Lambda &&
      source.query.body.length === 1 &&
      source.query.body[0]
    ) {
      source.query = source.query.body[0];
    }
    const queryFunc = guaranteeType(source.query, V1_AppliedFunction);
    assertTrue(
      queryFunc.function === 'from',
      `Only functions returning TDS/graph fetch using the from() function can be opened in Data Cube`,
    );
    if (queryFunc.parameters.length === 2) {
      source.runtime = guaranteeType(
        queryFunc.parameters[1],
        V1_PackageableElementPtr,
      ).fullPath;
    } else if (queryFunc.parameters.length === 3) {
      source.mapping = guaranteeType(
        queryFunc.parameters[1],
        V1_PackageableElementPtr,
      ).fullPath;
      source.runtime = guaranteeType(
        queryFunc.parameters[2],
        V1_PackageableElementPtr,
      ).fullPath;
    } else {
      throw new Error(`Expected 'from' function to have 2 or 3 parameters`);
    }

    source.sourceColumns = (
      await this.lspEngine.getLambdaRelationTypeFromRawInput({
        lambda: this.rawLambda,
        model: {},
      })
    ).columns;

    const query = new DataCubeQuery();
    query.query = `~[${source.sourceColumns.map((e) => `'${e.name}'`)}]->select()`;

    return {
      query,
      source,
    };
  }

  override async parseValueSpecification(
    code: string,
    returnSourceInformation?: boolean | undefined,
  ): Promise<V1_ValueSpecification> {
    return V1_deserializeValueSpecification(
      await this.lspEngine.transformCodeToValueSpec(
        code,
        returnSourceInformation,
      ),
      [],
    );
  }

  override getValueSpecificationCode(
    value: V1_ValueSpecification,
    pretty?: boolean | undefined,
  ): Promise<string> {
    return this.lspEngine.transformValueSpecToCode(
      V1_serializeValueSpecification(value, []),
      Boolean(pretty),
    );
  }

  override async getQueryTypeahead(
    code: string,
    baseQuery: V1_Lambda,
    source: DataCubeSource,
  ): Promise<CompletionItem[]> {
    const response = await this.lspEngine.getQueryTypeahead(
      code,
      V1_serializeValueSpecification(baseQuery, []),
    );
    return response.completions;
  }

  override getQueryRelationType(
    query: V1_Lambda,
    source: DataCubeSource,
  ): Promise<RelationType> {
    const rawLambda = new V1_RawLambda();
    rawLambda.body = query.body;
    rawLambda.parameters = query.parameters;
    return this.lspEngine.getLambdaRelationTypeFromRawInput({
      lambda: rawLambda,
      model: {},
    });
  }

  override async getQueryCodeRelationReturnType(
    code: string,
    baseQuery: V1_ValueSpecification,
    source: DataCubeSource,
  ): Promise<RelationType> {
    // TODO: Determine if this function should ever expect to receive
    // a V1_ValueSpecification that is not a V1_Lambda as the baseQuery
    if (!(baseQuery instanceof V1_Lambda)) {
      throw new Error('Base query must be a V1_Lambda');
    }
    const queryString = await this.lspEngine.transformV1RawLambdaToCode(
      V1_serializeValueSpecification(baseQuery, []),
      false,
    );

    // If the query string is wrapped in braces, we need to append the code string
    // within the braces.
    const fullQuery =
      queryString.charAt(0) === '{' &&
      queryString.charAt(queryString.length - 1) === '}'
        ? `${queryString.substring(0, queryString.length - 1)}${code}}`
        : queryString + code;
    const fullQueryLambda =
      await this.lspEngine.transformCodeToLambda(fullQuery);

    const relationType = await this.lspEngine.getLambdaRelationTypeFromRawInput(
      {
        lambda: fullQueryLambda,
        model: {},
      },
    );
    return relationType;
  }

  private buildRawLambdaFromValueSpec(query: V1_Lambda): V1_RawLambda {
    const json = guaranteeType(
      V1_deserializeRawValueSpecification(
        V1_serializeValueSpecification(query, []),
      ),
      V1_RawLambda,
    );
    const rawLambda = new V1_RawLambda();
    rawLambda.parameters = json.parameters;
    rawLambda.body = json.body;
    return rawLambda;
  }

  override async executeQuery(
    query: V1_Lambda,
    source: DataCubeSource,
    api: DataCubeAPI,
  ): Promise<DataCubeExecutionResult> {
    const rawLambda = this.buildRawLambdaFromValueSpec(query);

    const [executionWithMetadata, queryString] = await Promise.all([
      this.lspEngine.runQuery({
        clientVersion: undefined,
        function: rawLambda,
        mapping: undefined,
        model: {},
        runtime: undefined,
        context: {
          queryTimeOutInSeconds: 3000,
          enableConstraints: true,
        },
        parameterValues: [],
      }),
      this.lspEngine.transformV1RawLambdaToCode(
        V1_serializeRawValueSpecification(rawLambda),
        true,
      ),
    ]);
    const expectedTDS = guaranteeType(
      executionWithMetadata.executionResult,
      V1_TDSExecutionResult,
      'Query returned expected to be of tabular data set',
    );
    const sql = expectedTDS.activities?.[0];
    let sqlString = '### NO SQL FOUND';
    if (sql instanceof V1_RelationalExecutionActivities) {
      sqlString = sql.sql;
    }
    return {
      result: expectedTDS,
      executedQuery: queryString,
      executedSQL: sqlString,
    };
  }

  override buildExecutionContext(
    source: DataCubeSource,
  ): V1_AppliedFunction | undefined {
    if (source instanceof LSPDataCubeSource) {
      const appendFromFunc = Boolean(source.mapping ?? source.runtime);
      return appendFromFunc
        ? _function(
            DataCubeFunction.FROM,
            [
              source.mapping ? _elementPtr(source.mapping) : undefined,
              source.runtime ? _elementPtr(source.runtime) : undefined,
            ].filter(isNonNullable),
          )
        : undefined;
    }
    return undefined;
  }
}
