/**
 * Copyright (c) 2024-present, Goldman Sachs
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
  type DataCubeExecutionResult,
  type DataCubeRelationType,
  type PlainObject,
  _elementPtr,
  _function,
  assertTrue,
  DataCubeEngine,
  DataCubeFunction,
  DataCubeQuery,
  DataCubeSource,
  guaranteeType,
  isNonNullable,
} from '@finos/legend-vscode-extension-dependencies';
import {
  type RelationTypeMetadata,
  type V1_ValueSpecification,
  RelationalExecutionActivities,
  TDSExecutionResult,
  V1_AppliedFunction,
  V1_buildExecutionResult,
  V1_deserializeRawValueSpecification,
  V1_deserializeValueSpecification,
  V1_Lambda,
  V1_PackageableElementPtr,
  V1_RawLambda,
  V1_serializeRawValueSpecification,
  V1_serializeValueSpecification,
} from '@finos/legend-graph/cjs';
import { V1_LSPEngine } from '../../graph/V1_LSPEngine';

class LSPDataCubeSource extends DataCubeSource {
  mapping?: string | undefined;
  runtime: string | undefined;
}

export class LSPDataCubeEngine extends DataCubeEngine {
  lspEngine: V1_LSPEngine;
  rawLambda: V1_RawLambda;

  constructor(
    rawLambdaJson: PlainObject<V1_RawLambda>,
    postAndWaitForMessage: <T>(
      requestMessage: { command: string; msg?: PlainObject },
      responseCommandId: string,
    ) => Promise<T>,
  ) {
    super();
    this.lspEngine = new V1_LSPEngine(postAndWaitForMessage);
    this.rawLambda = V1_deserializeRawValueSpecification(
      rawLambdaJson,
    ) as V1_RawLambda;
  }

  // ------------------------------- HELPER FUNCTIONS ------------------------------

  private getSourceFunctionExpression(): V1_ValueSpecification {
    let srcFuncExp = V1_deserializeValueSpecification(
      V1_serializeRawValueSpecification(this.rawLambda),
      [],
    );
    // We could do a further check here to ensure the experssion is an applied function.
    // This is because data cube expects an expression to be able to built further upon the queery.
    if (
      srcFuncExp instanceof V1_Lambda &&
      srcFuncExp.body.length === 1 &&
      srcFuncExp.body[0]
    ) {
      srcFuncExp = srcFuncExp.body[0];
    }
    return srcFuncExp;
  }

  private getFromFunctionMappingAndRuntime(srcFuncExp: V1_AppliedFunction): {
    mapping?: string;
    runtime: string;
  } {
    if (srcFuncExp.parameters.length === 2) {
      return {
        runtime: guaranteeType(
          srcFuncExp.parameters[1],
          V1_PackageableElementPtr,
        ).fullPath,
      };
    } else if (srcFuncExp.parameters.length === 3) {
      return {
        runtime: guaranteeType(
          srcFuncExp.parameters[2],
          V1_PackageableElementPtr,
        ).fullPath,
        mapping: guaranteeType(
          srcFuncExp.parameters[1],
          V1_PackageableElementPtr,
        ).fullPath,
      };
    } else {
      throw new Error(`Expected 'from' function to have 2 or 3 parameters`);
    }
  }

  private async getRawLambdaRelationType(
    lambda: V1_RawLambda,
  ): Promise<RelationTypeMetadata> {
    return this.lspEngine.getLambdaRelationTypeFromRawInput({
      lambda,
      model: {},
    });
  }

  private buildRawLambdaFromLambda(query: V1_Lambda): V1_RawLambda {
    return guaranteeType(
      V1_deserializeRawValueSpecification(
        V1_serializeValueSpecification(query, []),
      ),
      V1_RawLambda,
    );
  }

  async generateInitialQuery(): Promise<DataCubeQuery> {
    const query = new DataCubeQuery();
    const columns = (await this.getRawLambdaRelationType(this.rawLambda))
      .columns;
    query.query = `~[${columns.map((e) => `'${e.name}'`)}]->select()`;
    return query;
  }

  // ---------------------------------- INTERFACE ----------------------------------

  override async processQuerySource(): Promise<DataCubeSource> {
    const srcFuncExp = guaranteeType(
      this.getSourceFunctionExpression(),
      V1_AppliedFunction,
      `Only functions returning TDS/graph fetch using the from() function can be opened in Data Cube`,
    );
    assertTrue(
      srcFuncExp.function === 'from',
      `Only functions returning TDS/graph fetch using the from() function can be opened in Data Cube`,
    );
    const source = new LSPDataCubeSource();
    source.columns = (
      await this.getRawLambdaRelationType(this.rawLambda)
    ).columns;
    const { mapping, runtime } =
      this.getFromFunctionMappingAndRuntime(srcFuncExp);
    source.mapping = mapping;
    source.runtime = runtime;
    source.query = srcFuncExp;
    return source;
  }

  override async parseValueSpecification(
    code: string,
    returnSourceInformation?: boolean | undefined,
  ): Promise<V1_ValueSpecification> {
    return V1_deserializeValueSpecification(
      await this.lspEngine.transformCodeToValueSpecification(
        code,
        returnSourceInformation,
      ),
      [],
    );
  }

  override async getValueSpecificationCode(
    value: V1_ValueSpecification,
    pretty?: boolean | undefined,
  ): Promise<string> {
    return this.lspEngine.transformValueSpecificationToCode(
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

  override async getQueryRelationReturnType(
    query: V1_Lambda,
    source: DataCubeSource,
  ): Promise<DataCubeRelationType> {
    return this.getRawLambdaRelationType(this.buildRawLambdaFromLambda(query));
  }

  override async getQueryCodeRelationReturnType(
    code: string,
    baseQuery: V1_ValueSpecification,
    source: DataCubeSource,
  ): Promise<DataCubeRelationType> {
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

    return this.getRawLambdaRelationType(fullQueryLambda);
  }

  override async executeQuery(
    query: V1_Lambda,
  ): Promise<DataCubeExecutionResult> {
    const rawLambda = this.buildRawLambdaFromLambda(query);

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
      V1_buildExecutionResult(executionWithMetadata.executionResult),
      TDSExecutionResult,
      'Query returned expected to be of tabular data set',
    );

    const sql = expectedTDS.activities?.[0];
    let sqlString = '# NO SQL FOUND';
    if (sql instanceof RelationalExecutionActivities) {
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
