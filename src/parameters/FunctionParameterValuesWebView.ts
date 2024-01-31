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
} from 'vscode';
import { LEGEND_COMMAND, LEGEND_EXECUTE_COMMAND } from '../utils/Const';

export const renderFunctionParameterValuesWebView = (
  functionParametersWebViewPanel: WebviewPanel,
  context: ExtensionContext,
  args: unknown[],
): void => {
  const parametersEditorScriptPath = Uri.file(
    path.join(
      context.extensionPath,
      'lib',
      'components',
      'ParametersEditorRenderer.js',
    ),
  );

  const parametersEditorScript =
    functionParametersWebViewPanel.webview.asWebviewUri(
      parametersEditorScriptPath,
    );
  const isDarkTheme = window.activeColorTheme.kind === ColorThemeKind.Dark;

  functionParametersWebViewPanel.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div id="root" data-input-parameters=${JSON.stringify(
          args,
        )} data-is-dark-theme='${isDarkTheme}'></div>
        <script src=${parametersEditorScript}></script>
        <script>
          const vscode = acquireVsCodeApi();
        </script>
      </body>
    </html>
  `;
  functionParametersWebViewPanel.webview.onDidReceiveMessage((msg) => {
    switch (msg.command) {
      case LEGEND_EXECUTE_COMMAND:
        commands.executeCommand(
          LEGEND_COMMAND,
          ...args.slice(0, 5).concat(msg.parameterValues),
        );
        break;

      default:
    }
  }, undefined);
};
