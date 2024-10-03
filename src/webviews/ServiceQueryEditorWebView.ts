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

import { type ExtensionContext, type WebviewPanel, window } from 'vscode';
import {
  ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
  ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
  GET_CLASSIFIER_PATH_MAP_REQUEST_ID,
  GET_CLASSIFIER_PATH_MAP_RESPONSE,
  GET_PROJECT_ENTITIES,
  GET_PROJECT_ENTITIES_RESPONSE,
  GET_SUBTYPE_INFO_REQUEST_ID,
  GET_SUBTYPE_INFO_RESPONSE,
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
        client.writeEntity({ content: message.msg });
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
      default:
        throw new Error(`Unsupported request ${message.command}`);
    }
  }, undefined);
};
