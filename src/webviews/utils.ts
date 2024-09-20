import { type ExtensionContext, Uri, type Webview } from 'vscode';
import * as path from 'path';
import { type PlainObject } from '@finos/legend-vscode-extension-dependencies';

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
