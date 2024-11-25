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
import { type LegendConceptTreeProvider } from '../conceptTree';
import { type PlainObject } from '../utils/SerializationUtils';
import { guaranteeNonNullable } from '../utils/AssertionUtils';
import { TextLocation } from '../model/TextLocation';

export const renderQueryBuilderWebView = async (
  webViewPanel: WebviewPanel,
  context: ExtensionContext,
  entityId: string,
  renderFilePath: string,
  client: LegendLanguageClient,
  legendConceptTree: LegendConceptTreeProvider,
): Promise<void> => {
  const { webview } = webViewPanel;

  // Refresh legend concept tree in case it hasn't been built yet
  await legendConceptTree.refresh();

  const entityLocation: Location = guaranteeNonNullable(
    legendConceptTree.getTreeItemById(entityId)?.location,
    `Can't find entity with ID '${entityId}'`,
  );
  const entityTextLocation = TextLocation.serialization.fromJson({
    documentId: entityLocation.uri.toString(),
    textInterval: {
      start: {
        line: entityLocation.range.start.line,
        column: entityLocation.range.start.character,
      },
      end: {
        line: entityLocation.range.end.line,
        column: entityLocation.range.end.character,
      },
    },
  });

  // Construct data input parameters
  const dataInputParams: PlainObject = {
    entityId,
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
        webview,
        entityTextLocation,
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
