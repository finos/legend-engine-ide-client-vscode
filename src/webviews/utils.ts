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

import { type ExtensionContext, type Webview, Location, Uri } from 'vscode';
import * as path from 'path';
import { type PlainObject } from '@finos/legend-vscode-extension-dependencies';
import {
  ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
  ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
  CHECK_DATASET_ENTITLEMENTS_COMMAND_ID,
  CHECK_DATASET_ENTITLEMENTS_RESPONSE,
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
  GET_CURRENT_USER_ID_REQUEST_ID,
  GET_CURRENT_USER_ID_RESPONSE,
  GET_LAMBDA_RETURN_TYPE_COMMAND_ID,
  GET_LAMBDA_RETURN_TYPE_RESPONSE,
  GET_SUBTYPE_INFO_REQUEST_ID,
  GET_SUBTYPE_INFO_RESPONSE,
  GRAMMAR_TO_JSON_LAMBDA_COMMAND_ID,
  GRAMMAR_TO_JSON_LAMBDA_RESPONSE,
  JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID,
  JSON_TO_GRAMMAR_LAMBDA_BATCH_RESPONSE,
  SURVEY_DATASETS_COMMAND_ID,
  SURVEY_DATASETS_RESPONSE,
} from '../utils/Const';
import { type LegendLanguageClient } from '../LegendLanguageClient';
import { type LegendConceptTreeProvider } from '../conceptTree';
import { guaranteeNonNullable } from '../utils/AssertionUtils';
import { TextLocation } from '../model/TextLocation';

export const getWebviewHtml = (
  webview: Webview,
  webviewType: string,
  context: ExtensionContext,
  renderFilePath: string,
  dataInputParams: PlainObject,
): string => {
  // Get script to use for web view
  let webviewRootScript;
  if (renderFilePath.length === 0) {
    const webviewRootScriptPath = Uri.file(
      path.join(context.extensionPath, 'dist', 'WebViewRoot.js'),
    );
    webviewRootScript = webview.asWebviewUri(webviewRootScriptPath);
  } else {
    webviewRootScript = renderFilePath;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div id="root" style="height: 100vh; width: 100%;" data-input-parameters=${JSON.stringify(
          { webviewType, ...dataInputParams },
        )}></div>
        <script src=${webviewRootScript}></script>
        <script>
          const vscode = acquireVsCodeApi();
        </script>
      </body>
    </html>
  `;
};

export const getCurrentUserId = (
  context: ExtensionContext,
): string | undefined => context.globalState.get('currentUserId');

/**
 * This function handles shared V1_LSPEngine messages that are common
 * across many webviews. It returns true if the message is handled and
 * false otherwise (so that the calling webview can handle it instead,
 * if needed).
 *
 * @param webview the webview handling the message
 * @param entityTextLocation the text location of the entity used in the webview
 * @param client LegendLanguageClient instance
 * @param context extension context
 * @param legendConceptTree concept tree provider
 * @param message the message being handled
 * @returns true if the message is handled, false otherwise
 */
export const handleV1LSPEngineMessage = async (
  webview: Webview,
  entityTextLocation: TextLocation,
  client: LegendLanguageClient,
  context: ExtensionContext,
  legendConceptTree: LegendConceptTreeProvider,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: { command: string; msg: any },
): Promise<boolean> => {
  switch (message.command) {
    case GET_CURRENT_USER_ID_REQUEST_ID: {
      const result = getCurrentUserId(context);
      webview.postMessage({
        command: GET_CURRENT_USER_ID_RESPONSE,
        result,
      });
      return true;
    }
    case GET_CLASSIFIER_PATH_MAP_REQUEST_ID: {
      const result = await client.getClassifierPathMap();
      webview.postMessage({
        command: GET_CLASSIFIER_PATH_MAP_RESPONSE,
        result,
      });
      return true;
    }
    case GET_SUBTYPE_INFO_REQUEST_ID: {
      const result = await client.getSubtypeInfo();
      webview.postMessage({
        command: GET_SUBTYPE_INFO_RESPONSE,
        result,
      });
      return true;
    }
    case ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID: {
      const mappingId = (message.msg as { mapping: string }).mapping;
      const mappingLocation: Location = guaranteeNonNullable(
        legendConceptTree.getTreeItemById(mappingId)?.location,
        `Can't find mapping file with ID '${mappingId}'`,
      );
      const mappingTextLocation = TextLocation.serialization.fromJson({
        documentId: mappingLocation.uri.toString(),
        textInterval: {
          start: {
            line: mappingLocation.range.start.line,
            column: mappingLocation.range.start.character,
          },
          end: {
            line: mappingLocation.range.end.line,
            column: mappingLocation.range.end.character,
          },
        },
      });

      const result =
        await client.analyzeMappingModelCoverage(mappingTextLocation);
      webview.postMessage({
        command: ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
        result,
      });
      break;
    }
    case EXECUTE_QUERY_COMMAND_ID: {
      const {
        lambda,
        mapping,
        runtime,
        context: executionContext,
        parameterValues,
        serializationFormat,
      } = message.msg;
      const result = await client.executeQuery(
        entityTextLocation,
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
      return true;
    }
    case EXPORT_DATA_COMMAND_ID: {
      const {
        lambda,
        mapping,
        runtime,
        context: executionContext,
        parameterValues,
        serializationFormat,
        downloadFileName,
      } = message.msg;
      const result = await client.exportData(
        entityTextLocation,
        lambda,
        mapping,
        runtime,
        executionContext,
        parameterValues ?? [],
        downloadFileName,
        serializationFormat,
      );
      webview.postMessage({
        command: EXPORT_DATA_RESPONSE,
        result,
      });
      return true;
    }
    case GENERATE_EXECUTION_PLAN_COMMAND_ID: {
      const {
        lambda,
        mapping,
        runtime,
        context: executionContext,
        parameterValues,
      } = message.msg;
      const result = await client.generateExecutionPlan(
        entityTextLocation,
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
      return true;
    }
    case DEBUG_GENERATE_EXECUTION_PLAN_COMMAND_ID: {
      const {
        lambda,
        mapping,
        runtime,
        context: executionContext,
        parameterValues,
      } = message.msg;
      const result = await client.debugGenerateExecutionPlan(
        entityTextLocation,
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
      return true;
    }
    case GRAMMAR_TO_JSON_LAMBDA_COMMAND_ID: {
      const { code, lambdaId, options } = message.msg;
      const result = await client.grammarToJson_lambda(
        entityTextLocation,
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
      return true;
    }
    case JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID: {
      const { lambdas, renderStyle } = message.msg;
      const result = await client.jsonToGrammar_lambda_batch(
        entityTextLocation,
        lambdas,
        renderStyle,
      );
      webview.postMessage({
        command: JSON_TO_GRAMMAR_LAMBDA_BATCH_RESPONSE,
        result,
      });
      return true;
    }
    case GET_LAMBDA_RETURN_TYPE_COMMAND_ID: {
      const { lambda } = message.msg;
      const result = await client.getLambdaReturnType(
        entityTextLocation,
        lambda,
      );
      webview.postMessage({
        command: GET_LAMBDA_RETURN_TYPE_RESPONSE,
        result,
      });
      return true;
    }
    case SURVEY_DATASETS_COMMAND_ID: {
      const { mapping, runtime, lambda } = message.msg;
      const result = await client.generateDatasetSpecifications(
        entityTextLocation,
        mapping,
        runtime,
        lambda,
      );
      webview.postMessage({
        command: SURVEY_DATASETS_RESPONSE,
        result,
      });
      return true;
    }
    case CHECK_DATASET_ENTITLEMENTS_COMMAND_ID: {
      const { mapping, runtime, lambda, reports } = message.msg;
      const result = await client.generateEntitlementReports(
        entityTextLocation,
        mapping,
        runtime,
        lambda,
        reports,
      );
      webview.postMessage({
        command: CHECK_DATASET_ENTITLEMENTS_RESPONSE,
        result,
      });
      return true;
    }
    default:
      return false;
  }
  return false;
};
