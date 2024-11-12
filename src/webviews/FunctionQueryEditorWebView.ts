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
import { type PlainObject } from '@finos/legend-vscode-extension-dependencies';
import { guaranteeNonNullable } from '../utils/AssertionUtils';
import { type LegendConceptTreeProvider } from '../conceptTree';
import { TextLocation } from '../model/TextLocation';

export const renderFunctionQueryEditorWebView = (
  functionQueryEditorWebViewPanel: WebviewPanel,
  context: ExtensionContext,
  functionId: string,
  renderFilePath: string,
  client: LegendLanguageClient,
  legendConceptTree: LegendConceptTreeProvider,
): void => {
  const { webview } = functionQueryEditorWebViewPanel;

  const functionLocation: Location = guaranteeNonNullable(
    legendConceptTree.getTreeItemById(functionId)?.location,
    `Can't find service file with ID '${functionId}'`,
  );
  const functionTextLocation = TextLocation.serialization.fromJson({
    documentId: functionLocation.uri.toString(),
    textInterval: {
      start: {
        line: functionLocation.range.start.line,
        column: functionLocation.range.start.character,
      },
      end: {
        line: functionLocation.range.end.line,
        column: functionLocation.range.end.character,
      },
    },
  });

  // Construct data input parameters
  const dataInputParams: PlainObject = {
    functionId,
  };

  webview.html = getWebviewHtml(
    webview,
    functionQueryEditorWebViewPanel.viewType,
    context,
    renderFilePath,
    dataInputParams,
  );

  webview.onDidReceiveMessage(async (message) => {
    if (
      await handleV1LSPEngineMessage(
        webview,
        functionTextLocation,
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
          updatedEntityId: message.updatedEntityId,
        });
        break;
      }
      case WRITE_ENTITY: {
        await client.writeEntity({
          entityPath: message.entityPath,
          content: message.msg,
        });
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
