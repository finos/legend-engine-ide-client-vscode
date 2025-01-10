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
  type Webview,
  Uri,
  window,
  workspace,
} from 'vscode';
import * as path from 'path';
import { type PlainObject } from '@finos/legend-vscode-extension-dependencies';
import {
  type TextLocation,
  GET_PROJECT_ENTITIES,
  GET_PROJECT_ENTITIES_RESPONSE,
  QUERY_BUILDER_CONFIG_ERROR,
  WRITE_ENTITY,
} from '@finos/legend-engine-ide-client-vscode-shared';
import {
  type LegendLanguageClient,
  LegendEntitiesRequest,
} from '../LegendLanguageClient';
import { type LegendConceptTreeProvider } from '../conceptTree';
import { TextDocumentIdentifier } from 'vscode-languageclient';

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
        <div id="root" style="height: 100vh; width: 100%;" data-input-parameters='${JSON.stringify(
          { webviewType, ...dataInputParams },
        )}'></div>
        <script src=${webviewRootScript}></script>
        <script>
          const vscode = acquireVsCodeApi();
        </script>
      </body>
    </html>
  `;
};

/**
 * This function handles shared QueryBuilder related messages that
 * are common across webviews that render QueryBuilder. It returns
 * true if the message is handled and false otherwise (so that the
 * calling webview can handle it instead, if needed).
 *
 * @param webview the webview handling the message
 * @param client LegendLanguageClient instance
 * @param legendConceptTree concept tree provider
 * @param message the message being handled
 * @returns true if the message is handled, false otherwise
 */
export const handleQueryBuilderWebviewMessage = async (
  webview: Webview,
  client: LegendLanguageClient,
  legendConceptTree: LegendConceptTreeProvider,
  message: {
    command: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    msg: any;
    entityPath: string;
    updatedEntityId?: string;
    messageId: string;
  },
): Promise<boolean> => {
  switch (message.command) {
    case GET_PROJECT_ENTITIES: {
      const entities = await client.entities(
        new LegendEntitiesRequest(
          message.msg?.entityTextLocations?.map((textLocation: TextLocation) =>
            TextDocumentIdentifier.create(textLocation.documentId),
          ) ?? [],
          message.msg?.entityPaths ?? [],
        ),
      );
      webview.postMessage({
        command: GET_PROJECT_ENTITIES_RESPONSE,
        result: entities,
        updatedEntityId: message.updatedEntityId,
        messageId: message.messageId,
      });
      return true;
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
      return true;
    }
    case QUERY_BUILDER_CONFIG_ERROR: {
      window.showErrorMessage('Error setting up Query Builder', {
        modal: true,
        detail: message.msg,
      });
      return true;
    }
    default:
      return false;
  }
};
