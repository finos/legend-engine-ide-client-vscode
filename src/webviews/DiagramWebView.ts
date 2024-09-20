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

import * as path from 'path';
import { Uri, type ExtensionContext, type WebviewPanel, window } from 'vscode';
import type { LegendEntity } from '../model/LegendEntity';
import {
  DIAGRAM_DROP_CLASS_ERROR,
  DIAGRAM_RENDERER,
  GET_PROJECT_ENTITIES,
  GET_PROJECT_ENTITIES_RESPONSE,
  WRITE_ENTITY,
} from '../utils/Const';
import type { LegendLanguageClient } from '../LegendLanguageClient';
import { type WebViewRootDataInputParams } from '../components/WebViewRoot';

export const renderDiagramRendererWebView = (
  diagramRendererWebViewPanel: WebviewPanel,
  context: ExtensionContext,
  diagramId: string,
  entities: LegendEntity[],
  renderFilePath: string,
  client: LegendLanguageClient,
): void => {
  const { webview } = diagramRendererWebViewPanel;

  // Get script to use for web view
  let webViewRootScript;
  if (renderFilePath.length === 0) {
    const webViewRootScriptPath = Uri.file(
      path.join(context.extensionPath, 'dist', 'WebViewRoot.js'),
    );
    webViewRootScript = webview.asWebviewUri(webViewRootScriptPath);
  } else {
    webViewRootScript = renderFilePath;
  }

  // Construct data input parameters
  const dataInputParams: WebViewRootDataInputParams = {
    webViewType: DIAGRAM_RENDERER,
    diagramId,
  };

  webview.html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div id="root" style="height: 100vh; width: 100%;" data-input-parameters=${JSON.stringify(
          dataInputParams,
        )}></div>
        <script src=${webViewRootScript}></script>
        <script>
          const vscode = acquireVsCodeApi();
        </script>
      </body>
    </html>
  `;

  webview.onDidReceiveMessage(async (message) => {
    switch (message.command) {
      case GET_PROJECT_ENTITIES: {
        webview.postMessage({
          command: GET_PROJECT_ENTITIES_RESPONSE,
          result: entities,
        });
        break;
      }
      case DIAGRAM_DROP_CLASS_ERROR: {
        window.showErrorMessage('Unsupported operation', {
          modal: true,
          detail: 'Only Class drop is supported.',
        });
        break;
      }
      case WRITE_ENTITY: {
        client.writeEntity({ content: message.msg });
        break;
      }
      default:
        throw new Error(`Unsupported request ${message.command}`);
    }
  }, undefined);
};
