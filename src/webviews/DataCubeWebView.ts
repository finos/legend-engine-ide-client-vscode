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

import { type ExtensionContext, type WebviewPanel } from 'vscode';
import { type LegendLanguageClient } from '../LegendLanguageClient';
import { getWebviewHtml } from './utils';
import { type LegendConceptTreeProvider } from '../conceptTree';
import { type PlainObject } from '../utils/SerializationUtils';
import { handleV1LSPEngineMessage } from '../graph/utils';
import { type V1_RawLambda } from '@finos/legend-vscode-extension-dependencies';

export const renderDataCubeWebView = async (
  webViewPanel: WebviewPanel,
  context: ExtensionContext,
  client: LegendLanguageClient,
  legendConceptTree: LegendConceptTreeProvider,
  cellUri: string,
  lambda: PlainObject<V1_RawLambda>,
  renderFilePath: string,
): Promise<void> => {
  const { webview } = webViewPanel;

  // Construct data input parameters
  const dataInputParams: PlainObject = {
    cellUri,
    lambda,
  };

  webview.html = getWebviewHtml(
    webview,
    webViewPanel.viewType,
    context,
    renderFilePath,
    dataInputParams,
  );

  webview.onDidReceiveMessage(async (message) => {
    if (
      await handleV1LSPEngineMessage(
        (response: PlainObject) => webview.postMessage(response),
        {
          documentUri: cellUri,
          sectionIndex: 0,
          entityId: 'notebook_cell',
        },
        client,
        context,
        legendConceptTree,
        message,
      )
    ) {
      return;
    }
  }, undefined);
};
