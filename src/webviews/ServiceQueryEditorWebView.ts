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
  type ExtensionContext,
  type WebviewPanel,
  window,
  workspace,
} from 'vscode';
import {
  ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
  ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
  DEBUG_GENERATE_EXECUTION_PLAN_COMMAND_ID,
  DEBUG_GENERATE_EXECUTION_PLAN_RESPONSE,
  EXECUTE_QUERY_COMMAND_ID,
  EXECUTE_QUERY_RESPONSE,
  EXPORT_DATA_COMMAND_ID,
  EXPORT_DATA_RESPONSE,
  GENERATE_EXECUTION_PLAN_COMMAND_ID,
  GENERATE_EXECUTION_PLAN_RESPONSE,
  GET_CLASSIFIER_PATH_MAP_REQUEST_ID,
  GET_CLASSIFIER_PATH_MAP_RESPONSE,
  GET_LAMBDA_RETURN_TYPE_COMMAND_ID,
  GET_LAMBDA_RETURN_TYPE_RESPONSE,
  GET_PROJECT_ENTITIES,
  GET_PROJECT_ENTITIES_RESPONSE,
  GET_SUBTYPE_INFO_REQUEST_ID,
  GET_SUBTYPE_INFO_RESPONSE,
  GRAMMAR_TO_JSON_LAMBDA_COMMAND_ID,
  GRAMMAR_TO_JSON_LAMBDA_RESPONSE,
  JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID,
  JSON_TO_GRAMMAR_LAMBDA_BATCH_RESPONSE,
  QUERY_BUILDER_CONFIG_ERROR,
  WRITE_ENTITY,
} from '../utils/Const';
import {
  type LegendLanguageClient,
  LegendEntitiesRequest,
} from '../LegendLanguageClient';
import { getWebviewHtml } from './utils';
import { type LegendConceptTreeProvider } from '../conceptTree';
import { type PlainObject } from '../utils/SerializationUtils';
import { guaranteeNonNullable } from '../utils/AssertionUtils';

export const renderServiceQueryEditorWebView = (
  serviceQueryEditorWebViewPanel: WebviewPanel,
  context: ExtensionContext,
  serviceId: string,
  engineUrl: string,
  renderFilePath: string,
  client: LegendLanguageClient,
  legendConceptTree: LegendConceptTreeProvider,
): void => {
  const { webview } = serviceQueryEditorWebViewPanel;

  const servicePath = guaranteeNonNullable(
    legendConceptTree.getTreeItemById(serviceId)?.location?.uri.toString(),
    `Can't find service file with ID '${serviceId}'`,
  );

  // Construct data input parameters
  const dataInputParams: PlainObject = {
    serviceId,
    engineUrl,
  };

  webview.html = getWebviewHtml(
    webview,
    serviceQueryEditorWebViewPanel.viewType,
    context,
    renderFilePath,
    dataInputParams,
  );

  webview.onDidReceiveMessage(async (message) => {
    switch (message.command) {
      case GET_PROJECT_ENTITIES: {
        const entities = await client.entities(new LegendEntitiesRequest([]));
        webview.postMessage({
          command: GET_PROJECT_ENTITIES_RESPONSE,
          result: entities,
        });
        break;
      }
      case WRITE_ENTITY: {
        await client.writeEntity({ content: message.msg });
        await workspace.textDocuments
          .filter(
            (doc) =>
              doc.uri.toString() ===
              legendConceptTree
                .getTreeItemById(message.entityPath)
                ?.location?.uri?.toString(),
          )?.[0]
          ?.save();
        break;
      }
      case QUERY_BUILDER_CONFIG_ERROR: {
        window.showErrorMessage('Error setting up Query Builder', {
          modal: true,
          detail: message.msg,
        });
        break;
      }
      case GET_CLASSIFIER_PATH_MAP_REQUEST_ID: {
        const result = await client.getClassifierPathMap();
        webview.postMessage({
          command: GET_CLASSIFIER_PATH_MAP_RESPONSE,
          result,
        });
        break;
      }
      case GET_SUBTYPE_INFO_REQUEST_ID: {
        const result = await client.getSubtypeInfo();
        webview.postMessage({
          command: GET_SUBTYPE_INFO_RESPONSE,
          result,
        });
        break;
      }
      case ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID: {
        const mappingId = (message.msg as { mapping: string }).mapping;
        const mappingPath = guaranteeNonNullable(
          legendConceptTree
            .getTreeItemById(mappingId)
            ?.location?.uri.toString(),
          `Can't find mapping file with ID '${mappingId}'`,
        );
        const result = await client.analyzeMappingModelCoverage(
          mappingPath,
          mappingId,
        );
        webview.postMessage({
          command: ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
          result,
        });
        break;
      }
      case EXECUTE_QUERY_COMMAND_ID: {
        const { lambda, mapping, runtime, context: executionContext, parameterValues, serializationFormat } =
          message.msg;
        const result = await client.executeQuery(
          servicePath,
          serviceId,
          lambda,
          mapping,
          runtime,
          executionContext,
          parameterValues ?? {},
          serializationFormat,
        );
        webview.postMessage({
          command: EXECUTE_QUERY_RESPONSE,
          result,
        });
        break;
      }
      case EXPORT_DATA_COMMAND_ID: {
        const { lambda, mapping, runtime, context: executionContext, parameterValues, serializationFormat, contentType } =
          message.msg;
        const result = await client.exportData(
          servicePath,
          serviceId,
          lambda,
          mapping,
          runtime,
          executionContext,
          parameterValues ?? [],
          serializationFormat,
          contentType,
        );
        webview.postMessage({
          command: EXPORT_DATA_RESPONSE,
          result,
        });
        break;
      }
      case GENERATE_EXECUTION_PLAN_COMMAND_ID: {
        const { lambda, mapping, runtime, context: executionContext, parameterValues } =
          message.msg;
        const result = await client.generateExecutionPlan(
          servicePath,
          serviceId,
          lambda,
          mapping,
          runtime,
          executionContext,
          parameterValues ?? [],
        );
        webview.postMessage({
          command: GENERATE_EXECUTION_PLAN_RESPONSE,
          result,
        });
        break;
      }
      case DEBUG_GENERATE_EXECUTION_PLAN_COMMAND_ID: {
        const { lambda, mapping, runtime, context: executionContext, parameterValues } =
          message.msg;
        const result = await client.debugGenerateExecutionPlan(
          servicePath,
          serviceId,
          lambda,
          mapping,
          runtime,
          executionContext,
          parameterValues ?? [],
        );
        webview.postMessage({
          command: DEBUG_GENERATE_EXECUTION_PLAN_RESPONSE,
          result,
        });
        break;
      }
      case GRAMMAR_TO_JSON_LAMBDA_COMMAND_ID: {
        const { code, lambdaId, options } = message.msg;
        const result = await client.grammarToJson_lambda(
          servicePath,
          serviceId,
          code,
          lambdaId,
          undefined,
          undefined,
          options?.pruneSourceInformation !== undefined
            ? !options.pruneSourceInformation
            : true,
        );
        webview.postMessage({
          command: GRAMMAR_TO_JSON_LAMBDA_RESPONSE,
          result,
        });
        break;
      }
      case JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID: {
        const { lambdas, renderStyle } = message.msg;
        const result = await client.jsonToGrammar_lambda_batch(
          servicePath,
          serviceId,
          lambdas,
          renderStyle,
        );
        webview.postMessage({
          command: JSON_TO_GRAMMAR_LAMBDA_BATCH_RESPONSE,
          result,
        });
        break;
      }
      case GET_LAMBDA_RETURN_TYPE_COMMAND_ID: {
        const { lambda } = message.msg;
        const result = await client.getLambdaReturnType(
          servicePath,
          serviceId,
          lambda,
        );
        webview.postMessage({
          command: GET_LAMBDA_RETURN_TYPE_RESPONSE,
          result,
        });
        break;
      }
      default:
        throw new Error(`Unsupported request ${message.command}`);
    }
  }, undefined);
};
