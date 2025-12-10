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
  type ApplicationStore,
  type CompletionItem,
  type DataCubeExecutionResult,
  type DataCubeRelationType,
  type PlainObject,
  type RelationTypeMetadata,
  type V1_AppliedFunction,
  type V1_ValueSpecification,
  _elementPtr,
  _function,
  _lambda,
  DataCubeEngine,
  DataCubeFunction,
  DataCubeSource,
  DataCubeSpecification,
  guaranteeType,
  isNonNullable,
  RelationalExecutionActivities,
  TDSExecutionResult,
  V1_buildExecutionResult,
  V1_deserializeRawValueSpecification,
  V1_deserializeValueSpecification,
  V1_Lambda,
  V1_RawLambda,
  V1_serializeRawValueSpecification,
  V1_serializeValueSpecification,
} from '@finos/legend-vscode-extension-dependencies';
import { V1_LSPEngine } from '../../graph/V1_LSPEngine';
import {
  assertErrorThrown,
  guaranteeNonNullable,
  type StopWatch,
  type TimingsRecord,
  UnsupportedOperationError,
} from '@finos/legend-shared';
import {
  LSP_DATA_CUBE_SOURCE_TYPE,
  RawLSPDataCubeSource,
} from './LSPDataCubeSource';
import { type LegendVSCodeApplicationConfig } from '../../application/LegendVSCodeApplicationConfig';
import { type LegendVSCodePluginManager } from '../../application/LegendVSCodePluginManager';

class LSPDataCubeSource extends DataCubeSource {
  mapping?: string | undefined;
  runtime: string | undefined;
}

export class LSPDataCubeEngine extends DataCubeEngine {
  lspEngine: V1_LSPEngine;
  rawLambda: V1_RawLambda;
  applicationStore: ApplicationStore<
    LegendVSCodeApplicationConfig,
    LegendVSCodePluginManager
  >;

  constructor(
    rawLambdaJson: PlainObject<V1_RawLambda>,
    postAndWaitForMessage: <T>(
      requestMessage: { command: string; msg?: PlainObject },
      responseCommandId: string,
    ) => Promise<T>,
    applicationStore: ApplicationStore<
      LegendVSCodeApplicationConfig,
      LegendVSCodePluginManager
    >,
  ) {
    super();
    this.lspEngine = new V1_LSPEngine(postAndWaitForMessage);
    this.rawLambda = V1_deserializeRawValueSpecification(
      rawLambdaJson,
    ) as V1_RawLambda;
    this.applicationStore = applicationStore;
  }

  // ------------------------------- HELPER FUNCTIONS ------------------------------

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

  private buildLambdaFromRawLambda(rawLambda: V1_RawLambda): V1_Lambda {
    return guaranteeType(
      V1_deserializeValueSpecification(
        V1_serializeRawValueSpecification(rawLambda),
        this.applicationStore.pluginManager.getPureProtocolProcessorPlugins(),
      ),
      V1_Lambda,
    );
  }

  async generateInitialSpecification(): Promise<DataCubeSpecification> {
    const specification = new DataCubeSpecification();
    const columns = (await this.getRawLambdaRelationType(this.rawLambda))
      .columns;
    specification.query = `~[${columns.map((e) => `'${e.name}'`)}]->select()`;
    const source = new RawLSPDataCubeSource();
    source.query = await this.lspEngine.transformV1RawLambdaToCode(
      V1_serializeRawValueSpecification(this.rawLambda),
    );
    specification.source = RawLSPDataCubeSource.serialization.toJson(source);
    return specification;
  }

  // ---------------------------------- INTERFACE ----------------------------------

  override getDataFromSource(source?: DataCubeSource): PlainObject {
    if (source instanceof LSPDataCubeSource) {
      return {
        sourceType: LSP_DATA_CUBE_SOURCE_TYPE,
      };
    }
    return {};
  }

  override finalizeTimingRecord(
    stopWatch: StopWatch,
    timings?: TimingsRecord,
  ): TimingsRecord | undefined {
    return undefined;
  }

  async processSource(value: PlainObject): Promise<DataCubeSource> {
    switch (value._type) {
      case LSP_DATA_CUBE_SOURCE_TYPE: {
        const rawSource = RawLSPDataCubeSource.serialization.fromJson(value);
        const source = new LSPDataCubeSource();
        const rawLambda = await this.lspEngine.transformCodeToLambda(
          rawSource.query,
        );
        const lambda = this.buildLambdaFromRawLambda(rawLambda);
        source.query = guaranteeNonNullable(
          lambda.body[0],
          'Expected rawSource query to be a lambda',
        );
        try {
          source.columns = (
            await this.getQueryRelationReturnType(
              _lambda([], [source.query]),
              source,
            )
          ).columns;
        } catch (error) {
          assertErrorThrown(error);
          throw new Error(
            `Can't get query result columns. Make sure the source query return a relation (i.e. typed TDS). Error: ${error.message}`,
          );
        }
        return source;
      }
      default:
        throw new UnsupportedOperationError(
          `Can't process query source of type '${value._type}'`,
        );
    }
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

    const startTime = performance.now();

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
    const endTime = performance.now();
    return {
      result: expectedTDS,
      executedQuery: queryString,
      executedSQL: sqlString,
      executionTime: endTime - startTime,
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
