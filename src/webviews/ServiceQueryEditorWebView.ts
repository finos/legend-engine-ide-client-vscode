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

export const renderServiceQueryEditorWebView = (
  serviceQueryEditorWebViewPanel: WebviewPanel,
  context: ExtensionContext,
  serviceId: string,
  renderFilePath: string,
  client: LegendLanguageClient,
  legendConceptTree: LegendConceptTreeProvider,
): void => {
  const { webview } = serviceQueryEditorWebViewPanel;

  const serviceLocation: Location = guaranteeNonNullable(
    legendConceptTree.getTreeItemById(serviceId)?.location,
    `Can't find service file with ID '${serviceId}'`,
  );
  const serviceTextLocation = TextLocation.serialization.fromJson({
    documentId: serviceLocation.uri.toString(),
    textInterval: {
      start: {
        line: serviceLocation.range.start.line,
        column: serviceLocation.range.start.character,
      },
      end: {
        line: serviceLocation.range.end.line,
        column: serviceLocation.range.end.character,
      },
    },
  });

  // Construct data input parameters
  const dataInputParams: PlainObject = {
    serviceId,
  };

  webview.html = getWebviewHtml(
    webview,
    serviceQueryEditorWebViewPanel.viewType,
    context,
    renderFilePath,
    dataInputParams,
  );

  webview.onDidReceiveMessage(async (message) => {
    if (
      await handleV1LSPEngineMessage(
        webview,
        serviceTextLocation,
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
