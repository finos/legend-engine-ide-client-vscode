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

import {
  commands,
  Uri,
  window,
  workspace,
  type CancellationToken,
} from 'vscode';
import type { FunctionTDSRequest } from './model/FunctionTDSRequest';
import { LegendExecutionResult } from './results/LegendExecutionResult';
import {
  ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
  CHECK_DATASET_ENTITLEMENTS_COMMAND_ID,
  ENTITIES_REQUEST_ID,
  EXECUTE_QUERY_COMMAND_ID,
  EXECUTE_TESTS_REQUEST_ID,
  GENERATE_EXECUTION_PLAN_COMMAND_ID,
  GET_CLASSIFIER_PATH_MAP_REQUEST_ID,
  GET_LAMBDA_RETURN_TYPE_COMMAND_ID,
  GET_QUERY_TYPEAHEAD_COMMAND_ID,
  GET_SUBTYPE_INFO_REQUEST_ID,
  GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID,
  JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID,
  LEGEND_COMMAND,
  LEGEND_WRITE_ENTITY_REQUEST_ID,
  ONE_ENTITY_PER_FILE_REQUEST_ID,
  REPL_CLASSPATH_REQUEST_ID,
  SURVEY_DATASETS_COMMAND_ID,
  TDS_JSON_REQUEST_ID,
  TEST_CASES_REQUEST_ID,
  VIRTUAL_FILE_SYSTEM_FILE_REQUEST_ID,
} from './utils/Const';
import type { PlainObject } from './utils/SerializationUtils';
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
  type V1_GrammarParserBatchInputEntry,
  type V1_Lambda,
  type V1_ParameterValue,
  type V1_RawExecutionContext,
  type V1_RawLambda,
  type V1_RenderStyle,
  type V1_Runtime,
} from '@finos/legend-vscode-extension-dependencies';
import { LegendExecutionResultType } from './results/LegendExecutionResultType';
import { type TextLocation } from './model/TextLocation';

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
    entityTextLocation: TextLocation,
    lambda: V1_RawLambda,
    mapping: string | undefined,
    runtime: V1_Runtime | undefined,
    context: V1_RawExecutionContext,
    parameterValues: { [key: string]: unknown },
    serializationFormat?: EXECUTION_SERIALIZATION_FORMAT | undefined,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      entityTextLocation,
      EXECUTE_QUERY_COMMAND_ID,
      {
        lambda: JSON.stringify(lambda),
        mapping,
        runtime: JSON.stringify(runtime),
        context: JSON.stringify(context),
        serializationFormat,
      },
      parameterValues,
    );
  }

  async executeQueryByDocumentId(
    documentUri: string,
    sectionIndex: number,
    entityId: string,
    lambda: V1_RawLambda,
    mapping: string | undefined,
    runtime: V1_Runtime | undefined,
    context: V1_RawExecutionContext,
    parameterValues: { [key: string]: unknown },
    serializationFormat?: EXECUTION_SERIALIZATION_FORMAT | undefined,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      documentUri,
      sectionIndex,
      entityId,
      EXECUTE_QUERY_COMMAND_ID,
      {
        lambda: JSON.stringify(lambda),
        mapping,
        runtime: JSON.stringify(runtime),
        context: JSON.stringify(context),
        serializationFormat,
      },
      parameterValues,
    );
  }

  async exportData(
    entityTextLocation: TextLocation,
    lambda: V1_RawLambda,
    mapping: string | undefined,
    runtime: V1_Runtime | undefined,
    context: V1_RawExecutionContext,
    parameterValues: V1_ParameterValue[],
    downloadFileName: string,
    serializationFormat?: EXECUTION_SERIALIZATION_FORMAT | undefined,
  ): Promise<LegendExecutionResult> {
    const response = (await commands.executeCommand(
      LEGEND_COMMAND,
      entityTextLocation,
      EXECUTE_QUERY_COMMAND_ID,
      {
        lambda: JSON.stringify(lambda),
        mapping,
        runtime: JSON.stringify(runtime),
        context: JSON.stringify(context),
        serializationFormat,
      },
      parameterValues,
    )) as LegendExecutionResult[];
    if (!response[0] || response[0].type === LegendExecutionResultType.ERROR) {
      return (
        response[0] ??
        LegendExecutionResult.serialization.fromJson({
          type: LegendExecutionResultType.ERROR,
        })
      );
    }
    const content = response[0].message;
    const uri = await window.showSaveDialog({
      defaultUri: Uri.file(downloadFileName),
      saveLabel: 'Save',
    });

    if (uri) {
      await workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
      window.showInformationMessage(
        `File ${downloadFileName} saved successfully!`,
      );
    } else {
      window.showErrorMessage('File save cancelled');
    }

    return response[0];
  }

  async generateExecutionPlan(
    entityTextLocation: TextLocation,
    lambda: V1_RawLambda,
    mapping: string | undefined,
    runtime: V1_Runtime | undefined,
    context: V1_RawExecutionContext,
    parameterValues: V1_ParameterValue[],
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      entityTextLocation,
      GENERATE_EXECUTION_PLAN_COMMAND_ID,
      {
        lambda: JSON.stringify(lambda),
        mapping,
        runtime: JSON.stringify(runtime),
        context: JSON.stringify(context),
      },
      parameterValues,
    );
  }

  async debugGenerateExecutionPlan(
    entityTextLocation: TextLocation,
    lambda: V1_RawLambda,
    mapping: string | undefined,
    runtime: V1_Runtime | undefined,
    context: V1_RawExecutionContext,
    parameterValues: V1_ParameterValue[],
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      entityTextLocation,
      GENERATE_EXECUTION_PLAN_COMMAND_ID,
      {
        lambda: JSON.stringify(lambda),
        mapping,
        runtime: JSON.stringify(runtime),
        context: JSON.stringify(context),
        debug: true,
      },
      parameterValues,
    );
  }

  async grammarToJson_lambda_batch(
    entityTextLocation: TextLocation,
    input: Record<string, V1_GrammarParserBatchInputEntry>,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      entityTextLocation,
      GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID,
      {
        input: JSON.stringify(input),
      },
    );
  }

  async grammarToJson_lambda_batchByDocumentId(
    documentUri: string,
    sectionIndex: number,
    entityId: string,
    input: Record<string, V1_GrammarParserBatchInputEntry>,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      documentUri,
      sectionIndex,
      entityId,
      GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID,
      {
        input: JSON.stringify(input),
      },
    );
  }

  async jsonToGrammar_lambda_batch(
    entityTextLocation: TextLocation,
    lambdas: Record<string, PlainObject<V1_RawLambda>>,
    renderStyle?: V1_RenderStyle | undefined,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      entityTextLocation,
      JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID,
      {
        lambdas: JSON.stringify(lambdas),
        renderStyle,
      },
    );
  }

  async jsonToGrammar_lambda_batchByDocumentId(
    documentUri: string,
    sectionIndex: number,
    entityId: string,
    lambdas: Record<string, PlainObject<V1_RawLambda>>,
    renderStyle?: V1_RenderStyle | undefined,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      documentUri,
      sectionIndex,
      entityId,
      JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID,
      {
        lambdas: JSON.stringify(lambdas),
        renderStyle,
      },
    );
  }

  async getLambdaReturnType(
    entityTextLocation: TextLocation,
    lambda: V1_RawLambda,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      entityTextLocation,
      GET_LAMBDA_RETURN_TYPE_COMMAND_ID,
      {
        lambda: JSON.stringify(lambda),
      },
    );
  }

  async getLambdaReturnTypeByDocumentId(
    documentUri: string,
    sectionIndex: number,
    entityId: string,
    lambda: V1_RawLambda,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      documentUri,
      sectionIndex,
      entityId,
      GET_LAMBDA_RETURN_TYPE_COMMAND_ID,
      {
        lambda: JSON.stringify(lambda),
      },
    );
  }

  async generateDatasetSpecifications(
    entityTextLocation: TextLocation,
    mapping: string,
    runtime: string,
    lambda: V1_RawLambda,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      entityTextLocation,
      SURVEY_DATASETS_COMMAND_ID,
      {
        mapping,
        runtime,
        lambda: JSON.stringify(lambda),
      },
    );
  }

  async generateEntitlementReports(
    entityTextLocation: TextLocation,
    mapping: string,
    runtime: string,
    lambda: V1_RawLambda,
    reports: { name: string; type: string }[],
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      entityTextLocation,
      CHECK_DATASET_ENTITLEMENTS_COMMAND_ID,
      {
        mapping,
        runtime,
        lambda: JSON.stringify(lambda),
        reports: JSON.stringify(reports),
      },
    );
  }

  async getQueryTypeaheadByDocumentId(
    documentUri: string,
    sectionIndex: number,
    entityId: string,
    code: string,
    baseQuery: PlainObject<V1_Lambda>,
  ): Promise<LegendExecutionResult[]> {
    return commands.executeCommand(
      LEGEND_COMMAND,
      documentUri,
      sectionIndex,
      entityId,
      GET_QUERY_TYPEAHEAD_COMMAND_ID,
      {
        code,
        baseQuery: JSON.stringify(baseQuery),
      },
    );
  }
}
