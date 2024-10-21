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

import { type ExtensionContext, Uri, type Webview } from 'vscode';
import * as path from 'path';
import { type PlainObject } from '../utils/SerializationUtils';

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
