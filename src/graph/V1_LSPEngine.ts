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
  type ClassifierPathMapping,
  type CodeCompletionResult,
  type ExecutionOptions,
  type ExternalFormatDescription,
  type GenerationConfigurationDescription,
  type GenerationMode,
  type GraphManagerOperationReport,
  type Parameters,
  type PlainObject,
  type PostValidationAssertionResult,
  type PureProtocolProcessorPlugin,
  type RawLambda,
  type RawRelationalOperationElement,
  type RelationTypeMetadata,
  type RequestHeaders,
  type RequestProcessConfig,
  type ResponseProcessConfig,
  type ServiceExecutionMode,
  type SubtypeInfo,
  type TEMPORARY__EngineSetupConfig,
  type TraceData,
  type TracerService,
  type V1_ArtifactGenerationExtensionInput,
  type V1_ArtifactGenerationExtensionOutput,
  type V1_CompilationResult,
  type V1_CompleteCodeInput,
  type V1_DatabaseBuilderInput,
  type V1_DatabaseToModelGenerationInput,
  type V1_DatasetEntitlementReport,
  type V1_DatasetSpecification,
  type V1_DebugTestsResult,
  type V1_EntitlementReportAnalyticsInput,
  type V1_ExecuteInput,
  type V1_ExecutionPlan,
  type V1_ExecutionResult,
  type V1_ExternalFormatModelGenerationInput,
  type V1_FunctionActivatorInfo,
  type V1_FunctionActivatorInput,
  type V1_GenerateSchemaInput,
  type V1_GenerationOutput,
  type V1_GrammarParserBatchInputEntry,
  type V1_GraphManagerEngine,
  type V1_LambdaReturnTypeInput,
  type V1_LightQuery,
  type V1_MappingModelCoverageAnalysisInput,
  type V1_PureModelContext,
  type V1_PureModelContextData,
  type V1_Query,
  type V1_QuerySearchSpecification,
  type V1_RawLambda,
  type V1_RawRelationalOperationElement,
  type V1_RawSQLExecuteInput,
  type V1_RelationalConnectionBuilder,
  type V1_RunTestsInput,
  type V1_RunTestsResult,
  type V1_ServiceConfigurationInfo,
  type V1_ServiceRegistrationResult,
  type V1_ServiceStorage,
  type V1_SourceInformation,
  type V1_StoreEntitlementAnalysisInput,
  type V1_TestDataGenerationExecutionInput,
  type V1_TestDataGenerationExecutionWithSeedInput,
  type V1_TestDataGenerationInput,
  type V1_TestDataGenerationResult,
  type V1_TextCompilationResult,
  type V1_ValueSpecification,
  assertErrorThrown,
  guaranteeNonNullable,
  isLossSafeNumber,
  parseLosslessJSON,
  returnUndefOnError,
  TEMPORARY__AbstractEngineConfig,
  V1_EXECUTION_RESULT,
  V1_MappingModelCoverageAnalysisResult,
  V1_serializeExecutionResult,
} from '@finos/legend-vscode-extension-dependencies';
import { deserialize } from 'serializr';
import { postMessage } from '../utils/VsCodeUtils';
import {
  ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
  ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
  EXECUTE_QUERY_COMMAND_ID,
  EXECUTE_QUERY_RESPONSE,
  GET_CLASSIFIER_PATH_MAP_REQUEST_ID,
  GET_CLASSIFIER_PATH_MAP_RESPONSE,
  GET_SUBTYPE_INFO_REQUEST_ID,
  GET_SUBTYPE_INFO_RESPONSE,
} from '../utils/Const';
import { type LegendExecutionResult } from '../results/LegendExecutionResult';
import { ExecuteQueryInput } from '../model/ExecuteQueryInput';

class V1_LSPEngine_Config extends TEMPORARY__AbstractEngineConfig {}

/**
 * This class defines what the engine is capable of.
 */
export class V1_LSPEngine implements V1_GraphManagerEngine {
  config = new V1_LSPEngine_Config();

  setup = (config: TEMPORARY__EngineSetupConfig): Promise<void> =>
    Promise.resolve();

  waitForMessage = <T>(commandId: string): Promise<T> =>
    new Promise((resolve) => {
      window.addEventListener(
        'message',
        (event: MessageEvent<{ result: T; command: string }>) => {
          if (event.data.command === commandId) {
            resolve(event.data.result);
          }
        },
      );
    });

  // ----------------------------------------- Server Client ----------------------------------------
  getCurrentUserId = (): string | undefined => {
    throw new Error('getCurrentUserId not implemented');
  };
  serverClientGetBaseUrl = (): string | undefined => {
    throw new Error('serverClientGetBaseUrl not implemented');
  };
  serverClientGetPureBaseUrl = (): string => {
    throw new Error('serverClientGetPureBaseUrl not implemented');
  };
  serverClientGetTraceData = (
    name: string,
    tracingTags?: PlainObject,
  ): TraceData => {
    throw new Error('serverClientGetTraceData not implemented');
  };
  serverClientSetTracerService = (tracerService: TracerService): void =>
    undefined;
  serverClientSetEnv = (val: string | undefined): void => {
    throw new Error('serverClientSetEnv not implemented');
  };
  serverClientSetCurrentUserId = (val: string | undefined): void => {
    throw new Error('serverClientSetCurrentUserId not implemented');
  };
  serverClientSetBaseUrl = (val: string | undefined): void => {
    throw new Error('serverClientSetBaseUrl not implemented');
  };
  serverClientSetBaseUrlForServiceRegistration = (
    val: string | undefined,
  ): void => {
    throw new Error(
      'serverClientSetBaseUrlForServiceRegistration not implemented',
    );
  };
  serverClientSetUseClientRequestPayloadCompression = (val: boolean): void => {
    throw new Error(
      'serverClientSetUseClientRequestPayloadCompression not implemented',
    );
  };
  serverClientSetEnableDebuggingPayload = (val: boolean): void => {
    throw new Error('serverClientSetEnableDebuggingPayload not implemented');
  };
  serverClientCreatePrototypeProject = (): Promise<{
    projectId: string;
    webUrl: string | undefined;
    owner: string;
  }> => {
    throw new Error('serverClientCreatePrototypeProject not implemented');
  };
  serverClientValidUserAccessRole = (userId: string): Promise<boolean> => {
    throw new Error('serverClientValidUserAccessRole not implemented');
  };
  serverClientPostWithTracing = <T>(
    traceData: TraceData,
    url: string,
    data: unknown,
    options: RequestInit,
    headers?: RequestHeaders,
    parameters?: Parameters,
    requestProcessConfig?: RequestProcessConfig,
    responseProcessConfig?: ResponseProcessConfig,
  ): Promise<T> => {
    throw new Error('serverClientPostWithTracing not implemented');
  };

  // ------------------------------------------- Protocol -------------------------------------------

  async getClassifierPathMapping(): Promise<ClassifierPathMapping[]> {
    postMessage({
      command: GET_CLASSIFIER_PATH_MAP_REQUEST_ID,
    });
    return JSON.parse(
      await this.waitForMessage<string>(GET_CLASSIFIER_PATH_MAP_RESPONSE),
    ) as ClassifierPathMapping[];
  }

  async getSubtypeInfo(): Promise<SubtypeInfo> {
    postMessage({
      command: GET_SUBTYPE_INFO_REQUEST_ID,
    });
    return this.waitForMessage<SubtypeInfo>(GET_SUBTYPE_INFO_RESPONSE);
  }

  // ------------------------------------------- Grammar -------------------------------------------

  pureModelContextDataToPureCode(
    graph: V1_PureModelContextData,
    pretty: boolean,
  ): Promise<string> {
    throw new Error('pureModelContextDataToPureCode not implemented');
  }

  async pureCodeToPureModelContextData(
    code: string,
    options?: {
      sourceInformationIndex?: Map<string, V1_SourceInformation> | undefined;
      onError?: () => void;
    },
  ): Promise<V1_PureModelContextData> {
    throw new Error('pureCodeToPureModelContextData not implemented');
  }

  async transformLambdasToCode(
    input: Map<string, RawLambda>,
    pretty: boolean,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<Map<string, string>> {
    throw new Error('transformLambdasToCode not implemented');
  }

  async transformValueSpecsToCode(
    input: Record<string, PlainObject<V1_ValueSpecification>>,
    pretty: boolean,
  ): Promise<Map<string, string>> {
    throw new Error('transformValueSpecsToCode not implemented');
  }

  async transformValueSpecToCode(
    input: PlainObject<V1_ValueSpecification>,
    pretty: boolean,
  ): Promise<string> {
    throw new Error('transformValueSpecToCode not implemented');
  }

  async transformCodeToValueSpeces(
    input: Record<string, V1_GrammarParserBatchInputEntry>,
  ): Promise<Map<string, PlainObject>> {
    throw new Error('transformCodeToValueSpeces not implemented');
  }

  async transformCodeToValueSpec(
    input: string,
  ): Promise<PlainObject<V1_ValueSpecification>> {
    throw new Error('transformCodeToValueSpec not implemented');
  }

  async transformLambdaToCode(
    lambda: RawLambda,
    pretty: boolean,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<string> {
    throw new Error('transformLambdaToCode not implemented');
  }

  async prettyLambdaContent(lambda: string): Promise<string> {
    throw new Error('prettyLambdaContent not implemented');
  }

  async transformCodeToLambda(
    code: string,
    lambdaId?: string,
    options?: {
      pruneSourceInformation?: boolean;
    },
  ): Promise<V1_RawLambda> {
    throw new Error('transformCodeToLambda not implemented');
  }

  async transformRelationalOperationElementsToPureCode(
    input: Map<string, RawRelationalOperationElement>,
  ): Promise<Map<string, string>> {
    throw new Error(
      'transformRelationalOperationElementsToPureCode not implemented',
    );
  }

  async transformPureCodeToRelationalOperationElement(
    code: string,
    operationId: string,
  ): Promise<V1_RawRelationalOperationElement> {
    throw new Error(
      'transformPureCodeToRelationalOperationElement not implemented',
    );
  }

  // ------------------------------------------- Compile -------------------------------------------

  async compilePureModelContextData(
    model: V1_PureModelContext,
    options?: { onError?: (() => void) | undefined } | undefined,
  ): Promise<V1_CompilationResult> {
    throw new Error('compilePureModelContextData not implemented');
  }

  async compileText(
    graphText: string,
    TEMPORARY__report: GraphManagerOperationReport,
    compileContext?: V1_PureModelContextData,
    options?: { onError?: () => void; getCompilationWarnings?: boolean },
  ): Promise<V1_TextCompilationResult> {
    throw new Error('compileText not implemented');
  }

  async getLambdaReturnType(
    lambdaReturnInput: V1_LambdaReturnTypeInput,
  ): Promise<string> {
    throw new Error('getLambdaReturnType not implemented');
  }

  async getLambdaReturnTypeFromRawInput(
    rawInput: PlainObject<V1_LambdaReturnTypeInput>,
  ): Promise<string> {
    throw new Error('getLambdaReturnTypeFromRawInput not implemented');
  }

  async getLambdaRelationTypeFromRawInput(
    rawInput: V1_LambdaReturnTypeInput,
  ): Promise<RelationTypeMetadata> {
    throw new Error('getLambdaRelationTypeFromRawInput not implemented');
  }

  async getCodeCompletion(
    rawInput: V1_CompleteCodeInput,
  ): Promise<CodeCompletionResult> {
    throw new Error('getCodeCompletion not implemented');
  }

  // --------------------------------------------- Execution ---------------------------------------------

  async runQuery(
    input: V1_ExecuteInput,
    options?: ExecutionOptions,
  ): Promise<{
    executionResult: V1_ExecutionResult;
    executionTraceId?: string;
  }> {
    try {
      const executionResultMap = await this.runQueryAndReturnMap(
        input,
        options,
      );
      const executionResultInText =
        executionResultMap.get(V1_EXECUTION_RESULT) ?? '';
      const rawExecutionResult =
        returnUndefOnError(() =>
          this.parseExecutionResults(executionResultInText, options),
        ) ?? executionResultInText;
      const executionResult = V1_serializeExecutionResult(rawExecutionResult);
      return { executionResult };
    } catch (error) {
      assertErrorThrown(error);
      throw error;
    }
  }

  async exportData(
    input: V1_ExecuteInput,
    options?: ExecutionOptions,
  ): Promise<Response> {
    throw new Error('exportData not implemented');
  }

  async runQueryAndReturnMap(
    input: V1_ExecuteInput,
    options?: ExecutionOptions,
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    postMessage({
      command: EXECUTE_QUERY_COMMAND_ID,
      msg: ExecuteQueryInput.serialization.toJson({
        lambda: input.function,
        mapping: input.mapping,
        runtime: input.runtime,
        context: input.context,
        parameterValues: input.parameterValues,
      }),
    });
    const response = await this.waitForMessage<LegendExecutionResult[]>(
      EXECUTE_QUERY_RESPONSE,
    );
    result.set(V1_EXECUTION_RESULT, JSON.parse(guaranteeNonNullable(response?.[0]?.message)));
    return result;
  }

  /**
   * For parsing of execution results, we may want to maintain the precision of the numbers
   * coming in. To do this, we setup a custom parser for numbers, so that if the number
   * is unsafe to convert to number (we lose precision) we will keep them as strings.
   * This is useful when displaying the execution results.
   */
  parseExecutionResults(
    executionResultTxt: string,
    options: ExecutionOptions | undefined,
  ): PlainObject<V1_ExecutionResult> {
    if (options?.useLosslessParse) {
      return parseLosslessJSON(
        executionResultTxt,
      ) as PlainObject<V1_ExecutionResult>;
    }
    if (!options?.convertUnsafeNumbersToString) {
      return JSON.parse(executionResultTxt);
    }
    try {
      const customNumParser = (numVal: string): number | string => {
        if (isLossSafeNumber(numVal)) {
          return Number(numVal);
        }
        return numVal;
      };
      return parseLosslessJSON(
        executionResultTxt,
        undefined,
        customNumParser,
      ) as PlainObject<V1_ExecutionResult>;
    } catch {
      // fall back to regular parse if any issue with the custom number parsing
      return JSON.parse(executionResultTxt);
    }
  }

  generateExecutionPlan(
    input: V1_ExecuteInput,
  ): Promise<PlainObject<V1_ExecutionPlan>> {
    throw new Error('generateExecutionPlan not implemented');
  }

  debugExecutionPlanGeneration(
    input: V1_ExecuteInput,
  ): Promise<{ plan: PlainObject<V1_ExecutionPlan>; debug: string[] }> {
    throw new Error('debugExecutionPlanGeneration not implemented');
  }

  generateExecuteTestData(
    input: V1_TestDataGenerationExecutionInput,
  ): Promise<string> {
    throw new Error('generateExecuteTestData not implemented');
  }

  generateExecuteTestDataWithSeedData(
    input: V1_TestDataGenerationExecutionWithSeedInput,
  ): Promise<string> {
    throw new Error('generateExecuteTestDataWithSeedData not implemented');
  }

  // --------------------------------------------- Test ---------------------------------------------

  async runTests(input: V1_RunTestsInput): Promise<V1_RunTestsResult> {
    throw new Error('runTests not implemented');
  }

  async debugTests(input: V1_RunTestsInput): Promise<V1_DebugTestsResult> {
    throw new Error('debugTests not implemented');
  }

  // -------------------------------------------  Generation -------------------------------------------

  async generateArtifacts(
    input: V1_ArtifactGenerationExtensionInput,
  ): Promise<V1_ArtifactGenerationExtensionOutput> {
    throw new Error('generateArtifacts not implemented');
  }

  // --------------------------------------------- Test Data Generation ---------------------------------------------

  async generateTestData(
    input: V1_TestDataGenerationInput,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<V1_TestDataGenerationResult> {
    throw new Error('generateTestData not implemented');
  }

  // ------------------------------------------- File Generation -------------------------------------------

  async getAvailableGenerationConfigurationDescriptions(): Promise<
    GenerationConfigurationDescription[]
  > {
    throw new Error(
      'getAvailableGenerationConfigurationDescriptions not implemented',
    );
  }

  async generateFile(
    configs: PlainObject,
    type: string,
    generationMode: GenerationMode,
    model: V1_PureModelContextData,
  ): Promise<V1_GenerationOutput[]> {
    throw new Error('generateFile not implemented');
  }

  // ------------------------------------------- External Format -----------------------------------------

  async getAvailableExternalFormatsDescriptions(): Promise<
    ExternalFormatDescription[]
  > {
    throw new Error('getAvailableExternalFormatsDescriptions not implemented');
  }

  async generateModel(
    input: V1_ExternalFormatModelGenerationInput,
  ): Promise<string> {
    throw new Error('generateModel not implemented');
  }

  async generateSchema(
    input: V1_GenerateSchemaInput,
  ): Promise<V1_PureModelContextData> {
    throw new Error('generateSchema not implemented');
  }

  // ------------------------------------------- Service -------------------------------------------

  async getServerServiceInfo(): Promise<V1_ServiceConfigurationInfo> {
    throw new Error('getServerServiceInfo not implemented');
  }

  async registerService(
    input: V1_PureModelContext,
    server: string,
    executionMode: ServiceExecutionMode,
    TEMPORARY__useStoreModel: boolean,
    TEMPORARY__useGenerateLineage: boolean,
    TEMPORARY__useGenerateOpenApi: boolean,
  ): Promise<V1_ServiceRegistrationResult> {
    throw new Error('registerService not implemented');
  }

  async getServiceVersionInfo(
    serviceUrl: string,
    serviceId: string,
  ): Promise<V1_ServiceStorage> {
    throw new Error('getServiceVersionInfo not implemented');
  }

  async activateServiceGeneration(
    serviceUrl: string,
    generationId: string,
  ): Promise<void> {
    throw new Error('activateServiceGeneration not implemented');
  }

  async runServicePostVal(
    servicePath: string,
    input: V1_PureModelContext,
    assertionId: string,
  ): Promise<PostValidationAssertionResult> {
    throw new Error('runServicePostVal not implemented');
  }

  // ------------------------------------------- Query -------------------------------------------

  async searchQueries(
    searchSpecification: V1_QuerySearchSpecification,
  ): Promise<V1_LightQuery[]> {
    throw new Error('searchQueries not implemented');
  }

  async getQueries(queryIds: string[]): Promise<V1_LightQuery[]> {
    throw new Error('getQueries not implemented');
  }

  async getQuery(queryId: string): Promise<V1_Query> {
    throw new Error('getQuery not implemented');
  }

  async createQuery(query: V1_Query): Promise<V1_Query> {
    throw new Error('createQuery not implemented');
  }

  async updateQuery(query: V1_Query): Promise<V1_Query> {
    throw new Error('updateQuery not implemented');
  }

  async patchQuery(query: Partial<V1_Query>): Promise<V1_Query> {
    throw new Error('patchQuery not implemented');
  }

  async deleteQuery(queryId: string): Promise<void> {
    throw new Error('deleteQuery not implemented');
  }

  async cancelUserExecutions(broadcastToCluster: boolean): Promise<string> {
    throw new Error('cancelUserExecutions not implemented');
  }

  // ------------------------------------------ Analysis ------------------------------------------

  async analyzeMappingModelCoverage(
    input: V1_MappingModelCoverageAnalysisInput,
  ): Promise<V1_MappingModelCoverageAnalysisResult> {
    postMessage({
      command: ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
      msg: input,
    });
    const response = await this.waitForMessage<LegendExecutionResult[]>(
      ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
    );
    return deserialize(
      V1_MappingModelCoverageAnalysisResult,
      JSON.parse(guaranteeNonNullable(response?.[0]?.message)),
    );
  }

  async surveyDatasets(
    input: V1_StoreEntitlementAnalysisInput,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<V1_DatasetSpecification[]> {
    throw new Error('surveyDatasets not implemented');
  }

  async checkDatasetEntitlements(
    input: V1_EntitlementReportAnalyticsInput,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<V1_DatasetEntitlementReport[]> {
    throw new Error('checkDatasetEntitlements not implemented');
  }

  async buildDatabase(
    input: V1_DatabaseBuilderInput,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<V1_PureModelContextData> {
    throw new Error('buildDatabase not implemented');
  }

  async executeRawSQL(
    input: V1_RawSQLExecuteInput,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<string> {
    throw new Error('executeRawSQL not implemented');
  }

  // ------------------------------------------- Function -------------------------------------------

  async getAvailableFunctionActivators(): Promise<V1_FunctionActivatorInfo[]> {
    throw new Error('getAvailableFunctionActivators not implemented');
  }

  async validateFunctionActivator(
    input: V1_FunctionActivatorInput,
  ): Promise<void> {
    throw new Error('validateFunctionActivator not implemented');
  }

  async publishFunctionActivatorToSandbox(
    input: V1_FunctionActivatorInput,
  ): Promise<void> {
    throw new Error('publishFunctionActivatorToSandbox not implemented');
  }

  // ------------------------------------------- Relational -------------------------------------------

  async generateModelsFromDatabaseSpecification(
    input: V1_DatabaseToModelGenerationInput,
  ): Promise<V1_PureModelContextData> {
    throw new Error('generateModelsFromDatabaseSpecification not implemented');
  }

  async getAvailableRelationalDatabaseTypeConfigurations(): Promise<
    V1_RelationalConnectionBuilder[]
  > {
    throw new Error(
      'getAvailableRelationalDatabaseTypeConfigurations not implemented',
    );
  }
}
