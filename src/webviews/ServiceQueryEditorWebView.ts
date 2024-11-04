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
  type Location,
  type WebviewPanel,
  window,
  workspace,
} from 'vscode';
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
import { getWebviewHtml, handleV1LSPEngineMessage } from './utils';
import { type LegendConceptTreeProvider } from '../conceptTree';
import { type PlainObject } from '../utils/SerializationUtils';
import { guaranteeNonNullable } from '../utils/AssertionUtils';
import { TextLocation } from '../model/TextLocation';

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

  const serviceLocation: Location = guaranteeNonNullable(
    legendConceptTree.getTreeItemById(serviceId)?.location,
    `Can't find service file with ID '${serviceId}'`,
  );
  const serviceTextLocation = TextLocation.serialization.fromJson({
    documentId: serviceLocation.uri.toString(),
    textInterval: {
      start: {
        line: serviceLocation.range.start.line,
        column: serviceLocation.range.start.character,
      },
      end: {
        line: serviceLocation.range.end.line,
        column: serviceLocation.range.end.character,
      },
    },
  });

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
    if (
      await handleV1LSPEngineMessage(
        webview,
        serviceTextLocation,
        serviceId,
        client,
        context,
        legendConceptTree,
        message,
      )
    ) {
      return;
    }
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
      default:
        break;
    }
  }, undefined);
};
