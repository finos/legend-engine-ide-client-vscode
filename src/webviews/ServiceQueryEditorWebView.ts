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
  GET_PROJECT_ENTITIES,
  GET_PROJECT_ENTITIES_RESPONSE,
  QUERY_BUILDER_CONFIG_ERROR,
  WRITE_ENTITY,
} from '../utils/Const';
import {
  type LegendLanguageClient,
  LegendEntitiesRequest,
} from '../LegendLanguageClient';
import { getWebviewHtml } from './utils';
import { type PlainObject } from '@finos/legend-vscode-extension-dependencies';

export const renderServiceQueryEditorWebView = (
  serviceQueryEditorWebViewPanel: WebviewPanel,
  context: ExtensionContext,
  serviceId: string,
  engineUrl: string,
  enableGridEnterpriseMode: boolean,
  renderFilePath: string,
  client: LegendLanguageClient,
): void => {
  const { webview } = serviceQueryEditorWebViewPanel;

  // Construct data input parameters
  const dataInputParams: PlainObject = {
    serviceId,
    engineUrl,
    enableGridEnterpriseMode,
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
      default:
        throw new Error(`Unsupported request ${message.command}`);
    }
  }, undefined);
};
