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
  type ExecutionOptions,
  type ExternalFormatDescription,
  type GenerationConfigurationDescription,
  type GenerationMode,
  type GraphManagerOperationReport,
  type PostValidationAssertionResult,
  type PureProtocolProcessorPlugin,
  type RawLambda,
  type RawRelationalOperationElement,
  type ServiceExecutionMode,
  type SubtypeInfo,
  type TEMPORARY__EngineSetupConfig,
  type V1_ArtifactGenerationExtensionInput,
  type V1_ArtifactGenerationExtensionOutput,
  type V1_CompilationResult,
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
  type V1_GraphManagerEngine,
  TEMPORARY__AbstractEngineConfig,
  V1_MappingModelCoverageAnalysisResult,
} from '@finos/legend-graph';
import {
  type Parameters,
  type PlainObject,
  type RequestHeaders,
  type RequestProcessConfig,
  type ResponseProcessConfig,
  type TraceData,
  type TracerService,
} from '@finos/legend-vscode-extension-dependencies';
import { type LegendLanguageClient } from '../LegendLanguageClient';
import { deserialize } from 'serializr';

class V1_LSPEngine_Config extends TEMPORARY__AbstractEngineConfig {}

/**
 * This class defines what the engine is capable of.
 */
export class V1_LSPEngine implements V1_GraphManagerEngine {
  config = new V1_LSPEngine_Config();
  client: LegendLanguageClient;

  constructor(client: LegendLanguageClient) {
    this.client = client;
  }

  setup = (config: TEMPORARY__EngineSetupConfig): Promise<void> => {
    this.config.setEnv(config.env);
    this.config.setTabSize(config.tabSize);
    return Promise.resolve();
  };

  // ----------------------------------------- Server Client ----------------------------------------
  getCurrentUserId = (): string | undefined => {
    throw new Error('Method not implemented');
  };
  serverClientGetBaseUrl = (): string | undefined => {
    throw new Error('Method not implemented');
  };
  serverClientGetPureBaseUrl = (): string => {
    throw new Error('Method not implemented');
  };
  serverClientGetTraceData = (
    name: string,
    tracingTags?: PlainObject,
  ): TraceData => {
    throw new Error('Method not implemented');
  };
  serverClientSetTracerService = (tracerService: TracerService): void => {
    throw new Error('Method not implemented');
  };
  serverClientSetEnv = (val: string | undefined): void => {
    throw new Error('Method not implemented');
  };
  serverClientSetCurrentUserId = (val: string | undefined): void => {
    throw new Error('Method not implemented');
  };
  serverClientSetBaseUrl = (val: string | undefined): void => {
    throw new Error('Method not implemented');
  };
  serverClientSetBaseUrlForServiceRegistration = (
    val: string | undefined,
  ): void => {
    throw new Error('Method not implemented');
  };
  serverClientSetUseClientRequestPayloadCompression = (val: boolean): void => {
    throw new Error('Method not implemented');
  };
  serverClientSetEnableDebuggingPayload = (val: boolean): void => {
    throw new Error('Method not implemented');
  };
  serverClientCreatePrototypeProject = (): Promise<{
    projectId: string;
    webUrl: string | undefined;
    owner: string;
  }> => {
    throw new Error('Method not implemented');
  };
  serverClientValidUserAccessRole = (userId: string): Promise<boolean> => {
    throw new Error('Method not implemented');
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
    throw new Error('Method not implemented');
  };

  // ------------------------------------------- Protocol -------------------------------------------

  async getClassifierPathMapping(): Promise<ClassifierPathMapping[]> {
    throw new Error('Method not implemented');
  }

  async getSubtypeInfo(): Promise<SubtypeInfo> {
    throw new Error('Method not implemented');
  }

  // ------------------------------------------- Grammar -------------------------------------------

  private extractElementSourceInformationIndexFromPureModelContextDataJSON(
    json: PlainObject<V1_PureModelContextData>,
  ): Map<string, V1_SourceInformation> {
    throw new Error('Method not implemented');
  }

  pureModelContextDataToPureCode(
    graph: V1_PureModelContextData,
    pretty: boolean,
  ): Promise<string> {
    throw new Error('Method not implemented');
  }

  async pureCodeToPureModelContextData(
    code: string,
    options?: {
      sourceInformationIndex?: Map<string, V1_SourceInformation> | undefined;
      onError?: () => void;
    },
  ): Promise<V1_PureModelContextData> {
    throw new Error('Method not implemented');
  }

  private async pureCodeToPureModelContextDataJSON(
    code: string,
    options?: { onError?: () => void; returnSourceInformation?: boolean },
  ): Promise<PlainObject<V1_PureModelContextData>> {
    throw new Error('Method not implemented');
  }

  async transformLambdasToCode(
    input: Map<string, RawLambda>,
    pretty: boolean,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<Map<string, string>> {
    throw new Error('Method not implemented');
  }

  async transformValueSpecsToCode(
    input: Record<string, PlainObject<V1_ValueSpecification>>,
    pretty: boolean,
  ): Promise<Map<string, string>> {
    throw new Error('Method not implemented');
  }

  async transformValueSpecToCode(
    input: PlainObject<V1_ValueSpecification>,
    pretty: boolean,
  ): Promise<string> {
    throw new Error('Method not implemented');
  }

  async transformCodeToValueSpeces(
    input: Record<string, V1_GrammarParserBatchInputEntry>,
  ): Promise<Map<string, PlainObject>> {
    throw new Error('Method not implemented');
  }

  async transformCodeToValueSpec(
    input: string,
  ): Promise<PlainObject<V1_ValueSpecification>> {
    throw new Error('Method not implemented');
  }

  async transformLambdaToCode(
    lambda: RawLambda,
    pretty: boolean,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<string> {
    throw new Error('Method not implemented');
  }

  async prettyLambdaContent(lambda: string): Promise<string> {
    throw new Error('Method not implemented');
  }

  async transformCodeToLambda(
    code: string,
    lambdaId?: string,
    options?: {
      pruneSourceInformation?: boolean;
    },
  ): Promise<V1_RawLambda> {
    throw new Error('Method not implemented');
  }

  async transformRelationalOperationElementsToPureCode(
    input: Map<string, RawRelationalOperationElement>,
  ): Promise<Map<string, string>> {
    throw new Error('Method not implemented');
  }

  async transformPureCodeToRelationalOperationElement(
    code: string,
    operationId: string,
  ): Promise<V1_RawRelationalOperationElement> {
    throw new Error('Method not implemented');
  }

  // ------------------------------------------- Compile -------------------------------------------

  async compilePureModelContextData(
    model: V1_PureModelContext,
    options?: { onError?: (() => void) | undefined } | undefined,
  ): Promise<V1_CompilationResult> {
    throw new Error('Method not implemented');
  }

  async compileText(
    graphText: string,
    TEMPORARY__report: GraphManagerOperationReport,
    compileContext?: V1_PureModelContextData,
    options?: { onError?: () => void; getCompilationWarnings?: boolean },
  ): Promise<V1_TextCompilationResult> {
    throw new Error('Method not implemented');
  }

  async getLambdaReturnType(
    lambdaReturnInput: V1_LambdaReturnTypeInput,
  ): Promise<string> {
    throw new Error('Method not implemented');
  }

  async getLambdaReturnTypeFromRawInput(
    rawInput: PlainObject<V1_LambdaReturnTypeInput>,
  ): Promise<string> {
    throw new Error('Method not implemented');
  }

  // --------------------------------------------- Execution ---------------------------------------------

  async runQuery(
    input: V1_ExecuteInput,
    options?: ExecutionOptions,
  ): Promise<{
    executionResult: V1_ExecutionResult;
    executionTraceId?: string;
  }> {
    throw new Error('Method not implemented');
  }

  async exportData(
    input: V1_ExecuteInput,
    options?: ExecutionOptions,
  ): Promise<Response> {
    throw new Error('Method not implemented');
  }

  async runQueryAndReturnMap(
    input: V1_ExecuteInput,
    options?: ExecutionOptions,
  ): Promise<Map<string, string>> {
    throw new Error('Method not implemented');
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
    throw new Error('Method not implemented');
  }

  generateExecutionPlan(
    input: V1_ExecuteInput,
  ): Promise<PlainObject<V1_ExecutionPlan>> {
    throw new Error('Method not implemented');
  }

  debugExecutionPlanGeneration(
    input: V1_ExecuteInput,
  ): Promise<{ plan: PlainObject<V1_ExecutionPlan>; debug: string[] }> {
    throw new Error('Method not implemented');
  }

  generateExecuteTestData(
    input: V1_TestDataGenerationExecutionInput,
  ): Promise<string> {
    throw new Error('Method not implemented');
  }

  generateExecuteTestDataWithSeedData(
    input: V1_TestDataGenerationExecutionWithSeedInput,
  ): Promise<string> {
    throw new Error('Method not implemented');
  }

  // --------------------------------------------- Test ---------------------------------------------

  async runTests(input: V1_RunTestsInput): Promise<V1_RunTestsResult> {
    throw new Error('Method not implemented');
  }

  async debugTests(input: V1_RunTestsInput): Promise<V1_DebugTestsResult> {
    throw new Error('Method not implemented');
  }

  // -------------------------------------------  Generation -------------------------------------------

  async generateArtifacts(
    input: V1_ArtifactGenerationExtensionInput,
  ): Promise<V1_ArtifactGenerationExtensionOutput> {
    throw new Error('Method not implemented');
  }

  // --------------------------------------------- Test Data Generation ---------------------------------------------

  async generateTestData(
    input: V1_TestDataGenerationInput,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<V1_TestDataGenerationResult> {
    throw new Error('Method not implemented');
  }

  // ------------------------------------------- File Generation -------------------------------------------

  async getAvailableGenerationConfigurationDescriptions(): Promise<
    GenerationConfigurationDescription[]
  > {
    throw new Error('Method not implemented');
  }

  async generateFile(
    configs: PlainObject,
    type: string,
    generationMode: GenerationMode,
    model: V1_PureModelContextData,
  ): Promise<V1_GenerationOutput[]> {
    throw new Error('Method not implemented');
  }

  // ------------------------------------------- External Format -----------------------------------------

  async getAvailableExternalFormatsDescriptions(): Promise<
    ExternalFormatDescription[]
  > {
    throw new Error('Method not implemented');
  }

  async generateModel(
    input: V1_ExternalFormatModelGenerationInput,
  ): Promise<string> {
    throw new Error('Method not implemented');
  }

  async generateSchema(
    input: V1_GenerateSchemaInput,
  ): Promise<V1_PureModelContextData> {
    throw new Error('Method not implemented');
  }

  // ------------------------------------------- Service -------------------------------------------

  async getServerServiceInfo(): Promise<V1_ServiceConfigurationInfo> {
    throw new Error('Method not implemented');
  }

  async registerService(
    input: V1_PureModelContext,
    server: string,
    executionMode: ServiceExecutionMode,
    TEMPORARY__useStoreModel: boolean,
    TEMPORARY__useGenerateLineage: boolean,
    TEMPORARY__useGenerateOpenApi: boolean,
  ): Promise<V1_ServiceRegistrationResult> {
    throw new Error('Method not implemented');
  }

  async getServiceVersionInfo(
    serviceUrl: string,
    serviceId: string,
  ): Promise<V1_ServiceStorage> {
    throw new Error('Method not implemented');
  }

  async activateServiceGeneration(
    serviceUrl: string,
    generationId: string,
  ): Promise<void> {
    throw new Error('Method not implemented');
  }

  async runServicePostVal(
    servicePath: string,
    input: V1_PureModelContext,
    assertionId: string,
  ): Promise<PostValidationAssertionResult> {
    throw new Error('Method not implemented');
  }

  // ------------------------------------------- Query -------------------------------------------

  async searchQueries(
    searchSpecification: V1_QuerySearchSpecification,
  ): Promise<V1_LightQuery[]> {
    throw new Error('Method not implemented');
  }

  async getQueries(queryIds: string[]): Promise<V1_LightQuery[]> {
    throw new Error('Method not implemented');
  }

  async getQuery(queryId: string): Promise<V1_Query> {
    throw new Error('Method not implemented');
  }

  async createQuery(query: V1_Query): Promise<V1_Query> {
    throw new Error('Method not implemented');
  }

  async updateQuery(query: V1_Query): Promise<V1_Query> {
    throw new Error('Method not implemented');
  }

  async patchQuery(query: Partial<V1_Query>): Promise<V1_Query> {
    throw new Error('Method not implemented');
  }

  async deleteQuery(queryId: string): Promise<void> {
    throw new Error('Method not implemented');
  }

  async cancelUserExecutions(broadcastToCluster: boolean): Promise<string> {
    throw new Error('Method not implemented');
  }

  // ------------------------------------------ Analysis ------------------------------------------

  async analyzeMappingModelCoverage(
    input: V1_MappingModelCoverageAnalysisInput,
  ): Promise<V1_MappingModelCoverageAnalysisResult> {
    return deserialize(
      V1_MappingModelCoverageAnalysisResult,
      await this.client.analyzeMappingModelCoverage(input),
    );
  }

  async surveyDatasets(
    input: V1_StoreEntitlementAnalysisInput,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<V1_DatasetSpecification[]> {
    throw new Error('Method not implemented');
  }

  async checkDatasetEntitlements(
    input: V1_EntitlementReportAnalyticsInput,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<V1_DatasetEntitlementReport[]> {
    throw new Error('Method not implemented');
  }

  async buildDatabase(
    input: V1_DatabaseBuilderInput,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<V1_PureModelContextData> {
    throw new Error('Method not implemented');
  }

  async executeRawSQL(
    input: V1_RawSQLExecuteInput,
    plugins: PureProtocolProcessorPlugin[],
  ): Promise<string> {
    throw new Error('Method not implemented');
  }

  // ------------------------------------------- Function -------------------------------------------

  async getAvailableFunctionActivators(): Promise<V1_FunctionActivatorInfo[]> {
    throw new Error('Method not implemented');
  }

  async validateFunctionActivator(
    input: V1_FunctionActivatorInput,
  ): Promise<void> {
    throw new Error('Method not implemented');
  }

  async publishFunctionActivatorToSandbox(
    input: V1_FunctionActivatorInput,
  ): Promise<void> {
    throw new Error('Method not implemented');
  }

  // ------------------------------------------- Relational -------------------------------------------

  async generateModelsFromDatabaseSpecification(
    input: V1_DatabaseToModelGenerationInput,
  ): Promise<V1_PureModelContextData> {
    throw new Error('Method not implemented');
  }

  async getAvailableRelationalDatabaseTypeConfigurations(): Promise<
    V1_RelationalConnectionBuilder[]
  > {
    throw new Error('Method not implemented');
  }
}
