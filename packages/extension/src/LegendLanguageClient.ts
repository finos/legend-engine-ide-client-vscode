/**
 * Copyright (c) 2023-present, Goldman Sachs
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

import { commands, Uri, window, type CancellationToken } from 'vscode';
import type { FunctionTDSRequest } from './model/FunctionTDSRequest';
import {
  ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
  CHECK_DATASET_ENTITLEMENTS_COMMAND_ID,
  ENTITIES_REQUEST_ID,
  EXECUTE_QUERY_COMMAND_ID,
  EXECUTE_TESTS_REQUEST_ID,
  GENERATE_EXECUTION_PLAN_COMMAND_ID,
  GET_CLASSIFIER_PATH_MAP_REQUEST_ID,
  GET_EXECUTE_FUNCTION_DESCRIPTION_ID,
  GET_FUNCTION_ACTIVATOR_SNIPPETS_ID,
  GET_LAMBDA_RETURN_TYPE_COMMAND_ID,
  GET_QUERY_TYPEAHEAD_COMMAND_ID,
  GET_SUBTYPE_INFO_REQUEST_ID,
  GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID,
  JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID,
  LEGEND_COMMAND,
  LEGEND_WRITE_ENTITY_REQUEST_ID,
  LegendExecutionResult,
  LegendExecutionResultType,
  ONE_ENTITY_PER_FILE_REQUEST_ID,
  REPL_CLASSPATH_REQUEST_ID,
  SURVEY_DATASETS_COMMAND_ID,
  TDS_JSON_REQUEST_ID,
  TEST_CASES_REQUEST_ID,
  TextLocation,
  VIRTUAL_FILE_SYSTEM_FILE_REQUEST_ID,
} from '@finos/legend-engine-ide-client-vscode-shared';
import {
  LanguageClient,
  type TextDocumentIdentifier,
} from 'vscode-languageclient/node';
import type { LegendTest } from './model/LegendTest';
import type { ExecuteTestRequest } from './model/ExecuteTestRequest';
import type { LegendTestExecutionResult } from './model/LegendTestExecutionResult';
import { LegendEntity } from './model/LegendEntity';
import {
  type EXECUTION_SERIALIZATION_FORMAT,
  type PlainObject,
  type V1_GrammarParserBatchInputEntry,
  type V1_Lambda,
  type V1_ParameterValue,
  type V1_RawExecutionContext,
  type V1_RawLambda,
  type V1_RenderStyle,
  type V1_Runtime,
} from '@finos/legend-vscode-extension-dependencies';

export class LegendEntitiesRequest {
  private textDocuments!: TextDocumentIdentifier[];
  private entityPaths!: string[];

  constructor(textDocuments: TextDocumentIdentifier[], entityPaths: string[]) {
    this.textDocuments = textDocuments;
    this.entityPaths = entityPaths;
  }
}

interface LegendWriteEntityRequest {
  entityPath: string;
  content: PlainObject;
}

export class LegendLanguageClient extends LanguageClient {
  async sendTDSRequest(
    request: FunctionTDSRequest,
  ): Promise<PlainObject<LegendExecutionResult>> {
    return this.sendRequest(TDS_JSON_REQUEST_ID, request);
  }

  async replClasspath(token?: CancellationToken): Promise<string> {
    if (token) {
      return this.sendRequest(REPL_CLASSPATH_REQUEST_ID, token);
    } else {
      return this.sendRequest(REPL_CLASSPATH_REQUEST_ID);
    }
  }

  async testCases(
    token?: CancellationToken,
  ): Promise<PlainObject<LegendTest>[]> {
    if (token) {
      return this.sendRequest(TEST_CASES_REQUEST_ID, token);
    } else {
      return this.sendRequest(TEST_CASES_REQUEST_ID);
    }
  }

  async executeTests(
    req: ExecuteTestRequest,
    token?: CancellationToken,
  ): Promise<PlainObject<LegendTestExecutionResult>[]> {
    if (token) {
      return this.sendRequest(EXECUTE_TESTS_REQUEST_ID, req, token);
    } else {
      return this.sendRequest(EXECUTE_TESTS_REQUEST_ID, req);
    }
  }

  async legendVirtualFile(
    uri: Uri,
    token?: CancellationToken,
  ): Promise<string> {
    if (token) {
      return this.sendRequest(
        VIRTUAL_FILE_SYSTEM_FILE_REQUEST_ID,
        uri.toString(),
        token,
      );
    } else {
      return this.sendRequest(EXECUTE_TESTS_REQUEST_ID, uri.toString());
    }
  }

  async entities(
    request: LegendEntitiesRequest,
    token?: CancellationToken,
  ): Promise<LegendEntity[]> {
    let promise: Promise<PlainObject<LegendTestExecutionResult>[]>;

    if (token) {
      promise = this.sendRequest<PlainObject<LegendTestExecutionResult>[]>(
        ENTITIES_REQUEST_ID,
        request,
        token,
      );
    } else {
      promise = this.sendRequest<PlainObject<LegendTestExecutionResult>[]>(
        ENTITIES_REQUEST_ID,
        request,
      );
    }

    return promise.then((res) =>
      res.map((x) => LegendEntity.serialization.fromJson(x)),
    );
  }

  async oneEntityPerFileRefactoring(
    token?: CancellationToken,
  ): Promise<string> {
    if (token) {
      return this.sendRequest(ONE_ENTITY_PER_FILE_REQUEST_ID, token);
    } else {
      return this.sendRequest(ONE_ENTITY_PER_FILE_REQUEST_ID);
    }
  }

  async writeEntity(
    request: LegendWriteEntityRequest,
    token?: CancellationToken,
  ): Promise<string> {
    if (token) {
      return this.sendRequest(LEGEND_WRITE_ENTITY_REQUEST_ID, request, token);
    } else {
      return this.sendRequest(LEGEND_WRITE_ENTITY_REQUEST_ID, request);
    }
  }

  async getClassifierPathMap(token?: CancellationToken): Promise<string> {
    if (token) {
      return this.sendRequest(GET_CLASSIFIER_PATH_MAP_REQUEST_ID, token);
    } else {
      return this.sendRequest(GET_CLASSIFIER_PATH_MAP_REQUEST_ID);
    }
  }

  async getSubtypeInfo(token?: CancellationToken): Promise<string> {
    if (token) {
      return this.sendRequest(GET_SUBTYPE_INFO_REQUEST_ID, token);
    } else {
      return this.sendRequest(GET_SUBTYPE_INFO_REQUEST_ID);
    }
  }

  async analyzeMappingModelCoverage(
    mappingTextLocation: TextLocation,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      mappingTextLocation,
      ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
      {
        returnLightGraph: true,
      },
    );
  }

  async executeQuery(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
    lambda: V1_RawLambda,
    mapping: string | undefined,
    runtime: V1_Runtime | undefined,
    context: V1_RawExecutionContext,
    parameterValues: { [key: string]: unknown },
    serializationFormat?: EXECUTION_SERIALIZATION_FORMAT | undefined,
  ): Promise<LegendExecutionResult[]> {
    const executableArgs = {
      lambda: JSON.stringify(lambda),
      mapping,
      runtime: JSON.stringify(runtime),
      context: JSON.stringify(context),
      serializationFormat,
    };
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          EXECUTE_QUERY_COMMAND_ID,
          executableArgs,
          parameterValues,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          EXECUTE_QUERY_COMMAND_ID,
          executableArgs,
          parameterValues,
        );
  }

  async exportData(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
    lambda: V1_RawLambda,
    mapping: string | undefined,
    runtime: V1_Runtime | undefined,
    context: V1_RawExecutionContext,
    parameterValues: V1_ParameterValue[],
    downloadFileName: string,
    serializationFormat?: EXECUTION_SERIALIZATION_FORMAT | undefined,
  ): Promise<LegendExecutionResult | undefined> {
    const uri = await window.showSaveDialog({
      defaultUri: Uri.file(downloadFileName),
      saveLabel: 'Save',
    });
    if (!uri) {
      window.showErrorMessage('File save cancelled');
      return LegendExecutionResult.serialization.fromJson({
        ids: [],
        type: LegendExecutionResultType.FAILURE,
        message: 'File save cancelled',
      });
    }

    const exportFilePath = uri.path;
    const executableArgs = {
      lambda: JSON.stringify(lambda),
      mapping,
      runtime: JSON.stringify(runtime),
      context: JSON.stringify(context),
      serializationFormat,
      exportFilePath,
    };
    const response = (
      entityDetails instanceof TextLocation
        ? await commands.executeCommand(
            LEGEND_COMMAND,
            entityDetails,
            EXECUTE_QUERY_COMMAND_ID,
            executableArgs,
            parameterValues,
          )
        : await commands.executeCommand(
            LEGEND_COMMAND,
            entityDetails.documentUri,
            entityDetails.sectionIndex,
            entityDetails.entityId,
            EXECUTE_QUERY_COMMAND_ID,
            executableArgs,
            parameterValues,
          )
    ) as LegendExecutionResult[];

    if (!response[0] || response[0].type === LegendExecutionResultType.ERROR) {
      return (
        response[0] ??
        LegendExecutionResult.serialization.fromJson({
          type: LegendExecutionResultType.ERROR,
        })
      );
    }

    window.showInformationMessage(
      `File ${downloadFileName} saved successfully!`,
    );

    return response[0];
  }

  async generateExecutionPlan(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
    lambda: V1_RawLambda,
    mapping: string | undefined,
    runtime: V1_Runtime | undefined,
    context: V1_RawExecutionContext,
    parameterValues: V1_ParameterValue[],
  ): Promise<LegendExecutionResult[]> {
    const executableArgs = {
      lambda: JSON.stringify(lambda),
      mapping,
      runtime: JSON.stringify(runtime),
      context: JSON.stringify(context),
    };
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          GENERATE_EXECUTION_PLAN_COMMAND_ID,
          executableArgs,
          parameterValues,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          GENERATE_EXECUTION_PLAN_COMMAND_ID,
          executableArgs,
          parameterValues,
        );
  }

  async debugGenerateExecutionPlan(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
    lambda: V1_RawLambda,
    mapping: string | undefined,
    runtime: V1_Runtime | undefined,
    context: V1_RawExecutionContext,
    parameterValues: V1_ParameterValue[],
  ): Promise<LegendExecutionResult[]> {
    const executableArgs = {
      lambda: JSON.stringify(lambda),
      mapping,
      runtime: JSON.stringify(runtime),
      context: JSON.stringify(context),
      debug: true,
    };
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          GENERATE_EXECUTION_PLAN_COMMAND_ID,
          executableArgs,
          parameterValues,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          GENERATE_EXECUTION_PLAN_COMMAND_ID,
          executableArgs,
          parameterValues,
        );
  }

  async grammarToJson_lambda_batch(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
    input: Record<string, V1_GrammarParserBatchInputEntry>,
  ): Promise<LegendExecutionResult[]> {
    const executableArgs = {
      input: JSON.stringify(input),
    };
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID,
          executableArgs,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID,
          executableArgs,
        );
  }

  async jsonToGrammar_lambda_batch(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
    lambdas: Record<string, PlainObject<V1_RawLambda>>,
    renderStyle?: V1_RenderStyle | undefined,
  ): Promise<LegendExecutionResult[]> {
    const executableArgs = {
      lambdas: JSON.stringify(lambdas),
      renderStyle,
    };
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID,
          executableArgs,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID,
          executableArgs,
        );
  }

  async getLambdaReturnType(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
    lambda: V1_RawLambda,
  ): Promise<LegendExecutionResult[]> {
    const executableArgs = {
      lambda: JSON.stringify(lambda),
    };
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          GET_LAMBDA_RETURN_TYPE_COMMAND_ID,
          executableArgs,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          GET_LAMBDA_RETURN_TYPE_COMMAND_ID,
          executableArgs,
        );
  }

  async generateDatasetSpecifications(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
    mapping: string,
    runtime: string,
    lambda: V1_RawLambda,
  ): Promise<LegendExecutionResult[]> {
    const executableArgs = {
      mapping,
      runtime,
      lambda: JSON.stringify(lambda),
    };
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          SURVEY_DATASETS_COMMAND_ID,
          executableArgs,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          SURVEY_DATASETS_COMMAND_ID,
          executableArgs,
        );
  }

  async generateEntitlementReports(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
    mapping: string,
    runtime: string,
    lambda: V1_RawLambda,
    reports: { name: string; type: string }[],
  ): Promise<LegendExecutionResult[]> {
    const executableArgs = {
      mapping,
      runtime,
      lambda: JSON.stringify(lambda),
      reports: JSON.stringify(reports),
    };
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          CHECK_DATASET_ENTITLEMENTS_COMMAND_ID,
          executableArgs,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          CHECK_DATASET_ENTITLEMENTS_COMMAND_ID,
          executableArgs,
        );
  }

  async getQueryTypeahead(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
    code: string,
    baseQuery: PlainObject<V1_Lambda>,
  ): Promise<LegendExecutionResult[]> {
    const executableArgs = {
      code,
      baseQuery: JSON.stringify(baseQuery),
    };
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          GET_QUERY_TYPEAHEAD_COMMAND_ID,
          executableArgs,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          GET_QUERY_TYPEAHEAD_COMMAND_ID,
          executableArgs,
        );
  }

  async getExecuteFunctionDescription(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
  ): Promise<LegendExecutionResult[]> {
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          GET_EXECUTE_FUNCTION_DESCRIPTION_ID,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          GET_EXECUTE_FUNCTION_DESCRIPTION_ID,
        );
  }

  async getFunctionActivatorSnippets(
    entityDetails:
      | TextLocation
      | { documentUri: string; sectionIndex: number; entityId: string },
  ): Promise<LegendExecutionResult[]> {
    return entityDetails instanceof TextLocation
      ? commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails,
          GET_FUNCTION_ACTIVATOR_SNIPPETS_ID,
        )
      : commands.executeCommand(
          LEGEND_COMMAND,
          entityDetails.documentUri,
          entityDetails.sectionIndex,
          entityDetails.entityId,
          GET_FUNCTION_ACTIVATOR_SNIPPETS_ID,
        );
  }
}
