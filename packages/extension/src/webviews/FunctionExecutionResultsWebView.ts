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
import {
  type ExtensionContext,
  commands,
  Uri,
  type WebviewPanel,
  ColorThemeKind,
  window,
  workspace,
} from 'vscode';
import {
  GET_TDS_REQUEST_RESULTS_ID,
  LEGEND_COMMAND,
  LEGEND_EXECUTE_COMMAND,
  SEND_TDS_REQUEST_ID,
} from '@finos/legend-engine-ide-client-vscode-shared';

export const renderFunctionResultsWebView = (
  functionResultsWebViewPanel: WebviewPanel,
  link: Uri,
  context: ExtensionContext,
  args: unknown[],
): void => {
  const functionResultsEditorScriptPath = Uri.file(
    path.join(
      context.extensionPath,
      'dist',
      'FunctionResultsEditorRenderer.js',
    ),
  );
  const functionResultsScript =
    functionResultsWebViewPanel.webview.asWebviewUri(
      functionResultsEditorScriptPath,
    );
  const webview = functionResultsWebViewPanel.webview;
  const isDarkTheme = window.activeColorTheme.kind === ColorThemeKind.Dark;
  const config = workspace.getConfiguration('legend');
  const agGridLicense = config.get<string>('agGridLicense', '');

  webview.html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div id="root" style="height: 500px; width: 100%;" class=${
          isDarkTheme ? 'ag-theme-balham-dark' : 'ag-theme-balham'
        } data-input-parameters=${JSON.stringify(
          args,
        )} data-is-dark-theme='${isDarkTheme}'
          data-ag-grid-license='${agGridLicense}'></div>
        <script src=${functionResultsScript}></script>
        <script>
          const vscode = acquireVsCodeApi();
        </script>
      </body>
    </html>
  `;
  webview.onDidReceiveMessage(async (msg) => {
    switch (msg.command) {
      case LEGEND_EXECUTE_COMMAND: {
        const results = await commands.executeCommand(
          LEGEND_COMMAND,
          ...args.slice(0, 5).concat(msg.parameterValues),
        );
        webview.postMessage({
          command: GET_TDS_REQUEST_RESULTS_ID,
          result: results,
        });
        break;
      }
      case SEND_TDS_REQUEST_ID: {
        const r = await commands.executeCommand(SEND_TDS_REQUEST_ID, {
          entity: args[2],
          sectionNum: args[1],
          uri: args[0],
          inputParameters: args[5],
          request: msg.values,
        });
        webview.postMessage({ command: GET_TDS_REQUEST_RESULTS_ID, result: r });
        break;
      }
      default:
        throw new Error(`Unsupported request ${msg.command}`);
    }
  }, undefined);
};
