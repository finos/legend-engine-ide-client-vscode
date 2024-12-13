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
  CompletionItem,
  DataCubeAPI,
  DataCubeEngine,
  DataCubeExecutionResult,
  DataCubeInitialInput,
  DataCubeQuery,
  DataCubeSource,
  guaranteeType,
  LogEvent,
  PlainObject,
  RawLambda,
  RelationalExecutionActivities,
  RelationType,
  TDSExecutionResult,
  V1_AppliedFunction,
  V1_deserializeRawValueSpecification,
  V1_deserializeValueSpecification,
  V1_Lambda,
  V1_RawLambda,
  V1_serializeRawValueSpecification,
  V1_serializeValueSpecification,
  V1_ValueSpecification,
} from '@finos/legend-vscode-extension-dependencies';
import { V1_LSPEngine } from '../graph/V1_LSPEngine';
import { VSCodeEvent } from 'vscode-notebook-renderer/events';

class LSPDataCubeSource extends DataCubeSource {
  mapping?: string | undefined;
  runtime: string | undefined;
}

export class LSPDataCubeEngine extends DataCubeEngine {
  lspEngine: V1_LSPEngine;
  rawLambda: V1_RawLambda;
  postMessage: (message: unknown) => void;
  // lambda: V1_Lambda;
  // srcFuncExp: V1_ValueSpecification;
  // _parameters: object | undefined;

  constructor(
    lambdaJson: PlainObject<V1_RawLambda>,
    postMessage: (message: unknown) => void,
    onDidReceiveMessage: VSCodeEvent<any>,
  ) {
    super();
    this.lspEngine = new V1_LSPEngine();
    this.rawLambda = V1_deserializeRawValueSpecification(
      lambdaJson,
    ) as V1_RawLambda;
    this.postMessage = postMessage;
    onDidReceiveMessage((message) => {
      console.log('LSPDataCubeEngine received message:', message);
    });
    // const valueSpec = V1_deserializeValueSpecification(
    //   lambdaJson,
    //   [],
    // );
    // We could do a further check here to ensure the experssion is an applied funciton
    // this is because data cube expects an expression to be able to built further upon the queery
    // if (valueSpec instanceof V1_Lambda && valueSpec.body.length === 1 && valueSpec.body[0]) {
    //   this.lambda = valueSpec;
    //   this._parameters = valueSpec.parameters;
    //   this.srcFuncExp = valueSpec.body[0];
    // } else {
    //   throw Error('DataCube engine expects a lambda with a single expression');
    // }
  }

  async getRelationalType(query: V1_RawLambda): Promise<RelationType> {
    const relationType = await this.lspEngine.getLambdaRelationTypeFromRawInput(
      {
        lambda: query,
        model: {},
      },
    );
    return relationType;
  }

  // ------------------------------- CORE OPERATIONS -------------------------------

  override async getInitialInput(): Promise<DataCubeInitialInput | undefined> {
    this.postMessage({ command: 'testCommand', msg: 'data' });
    return undefined;
    // let srcFuncExp = this.rawLambda;
    // // We could do a further check here to ensure the experssion is an applied funciton
    // // this is because data cube expects an expression to be able to built further upon the queery
    // // if (
    // //   srcFuncExp instanceof V1_Lambda &&
    // //   srcFuncExp.body.length === 1 &&
    // //   srcFuncExp.body[0]
    // // ) {
    // //   srcFuncExp = srcFuncExp.body[0];
    // // }
    // // this._parameters = this.selectInitialQuery.parameters;
    // // const fromFuncExp = new V1_AppliedFunction();
    // // fromFuncExp.function = _functionName(SUPPORTED_FUNCTIONS.FROM);
    // // fromFuncExp.parameters = [srcFuncExp];
    // // if (this.mappingPath) {
    // //   fromFuncExp.parameters.push(_elementPtr(this.mappingPath));
    // // }
    // // if (this.runtimePath) {
    // //   fromFuncExp.parameters.push(_elementPtr(this.runtimePath));
    // // }
    // const columns = (await this.getRelationalType(this.rawLambda)).columns;
    // const query = new DataCubeQuery();
    // query.query = `~[${columns.map((e) => `'${e.name}'`)}]->select()`;
    // const source = new LSPDataCubeSource();
    // source.sourceColumns = columns;
    // // source.mapping = this.mappingPath;
    // // source.runtime = this.runtimePath;
    // const v1lambda = new V1_Lambda();
    // v1lambda.body = (this.rawLambda.body as any[]) ?? [];
    // v1lambda.parameters = (this.rawLambda.parameters as any[]) ?? [];
    // source.query = v1lambda;
    // console.log('getInitialInput:', { query, source });
    // return {
    //   query,
    //   source,
    // };
  }

  override async parseValueSpecification(
    code: string,
    returnSourceInformation?: boolean | undefined,
  ): Promise<V1_ValueSpecification> {
    throw new Error('parseValueSpecification has not been implemented');
    // return V1_deserializeValueSpecification(
    //   await this.lspEngine.transformCodeToValueSpec(
    //     code,
    //     returnSourceInformation,
    //   ),
    //   [],
    // );
  }

  override getValueSpecificationCode(
    value: V1_ValueSpecification,
    pretty?: boolean | undefined,
  ): Promise<string> {
    throw new Error('getValueSpecificationCode has not been implemented');
  }

  override getQueryTypeahead(
    code: string,
    baseQuery: V1_Lambda,
    source: DataCubeSource,
  ): Promise<CompletionItem[]> {
    throw new Error('getQueryTypeahead has not been implemented');
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

  override getQueryCodeRelationReturnType(
    code: string,
    baseQuery: V1_ValueSpecification,
    source: DataCubeSource,
  ): Promise<RelationType> {
    throw new Error('getQueryCodeRelationReturnType has not been implemented');
    // const queryString =
    //   await this.graphState.graphManager.valueSpecificationToPureCode(
    //     V1_serializeValueSpecification(baseQuery, []),
    //   );
    // const fullQuery = queryString + code;
    // return this.getRelationalType(
    //   await this.graphState.graphManager.pureCodeToLambda(fullQuery),
    // );
  }

  override async executeQuery(
    query: V1_Lambda,
    source: DataCubeSource,
    api: DataCubeAPI,
  ): Promise<DataCubeExecutionResult> {
    throw new Error('runQuery has not been implemented');
    // const rawLambda = new V1_RawLambda();
    // rawLambda.body = query.body;
    // rawLambda.parameters = query.parameters;

    // const [executionWithMetadata, queryString] = await Promise.all([
    //   this.lspEngine.runQuery({
    //     clientVersion: undefined,
    //     function: rawLambda,
    //     mapping: undefined,
    //     model: {},
    //     runtime: undefined,
    //     context: {
    //       queryTimeOutInSeconds: 3000,
    //       enableConstraints: true,
    //     },
    //     parameterValues: [],
    //   }),
    //   this.lspEngine.transformV1RawLambdaToCode(rawLambda, true),
    // ]);
    // const expectedTDS = guaranteeType(
    //   executionWithMetadata.executionResult,
    //   TDSExecutionResult,
    //   'Query returned expected to be of tabular data set',
    // );
    // const sql = expectedTDS.activities?.[0];
    // let sqlString = '### NO SQL FOUND';
    // if (sql instanceof RelationalExecutionActivities) {
    //   sqlString = sql.sql;
    // }
    // return {
    //   result: expectedTDS,
    //   executedQuery: queryString,
    //   executedSQL: sqlString,
    // };
  }

  override buildExecutionContext(
    source: DataCubeSource,
  ): V1_AppliedFunction | undefined {
    return undefined;
  }

  // ---------------------------------- LOGGING ----------------------------------

  override logDebug(message: string, ...data: unknown[]) {
    console.debug(message, data);
  }

  override debugProcess(processName: string, ...data: [string, unknown][]) {
    console.debug(processName, data);
  }

  override logInfo(event: LogEvent, ...data: unknown[]) {
    console.log(event, data);
  }

  override logWarning(event: LogEvent, ...data: unknown[]) {
    console.warn(event, data);
  }

  override logError(event: LogEvent, ...data: unknown[]) {
    console.error(event, data);
  }

  override logUnhandledError(error: Error) {
    console.error(error);
  }

  override logIllegalStateError(message: string, error?: Error) {
    console.error(message, error);
  }
}
