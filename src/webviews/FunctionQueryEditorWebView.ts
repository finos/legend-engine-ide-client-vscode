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
} from 'vscode';
import { type LegendLanguageClient } from '../LegendLanguageClient';
import {
  getWebviewHtml,
  handleQueryBuilderWebviewMessage,
  handleV1LSPEngineMessage,
} from './utils';
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
    } else {
      await handleQueryBuilderWebviewMessage(
        webview,
        client,
        legendConceptTree,
        message,
      );
    }
  }, undefined);
};
