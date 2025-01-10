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
  ThemeColor,
  ThemeIcon,
  Uri,
  type Webview,
  commands,
  window,
  ColorThemeKind,
  workspace,
} from 'vscode';
import {
  type LegendExecutionResult,
  GET_TDS_REQUEST_RESULTS_ID,
  getAggregationTDSColumnCustomizations,
  getTDSRowData,
  guaranteeType,
  IS_EXECUTION_HAPPENNG,
  LegendExecutionResultType,
  SEND_TDS_REQUEST_ID,
  SET_CONTEXT_COMMAND_ID,
  SHOW_EXECUTION_RESULTS,
  SHOW_RESULTS_COMMAND_ID,
  SHOW_RESULTS_COMMAND_TITLE,
  TDSLegendExecutionResult,
  TEST_ERROR_COLOR,
  TEST_FAIL_COLOR,
  TEST_FAIL_ICON,
  TEST_PASS_COLOR,
  TEST_PASS_ICON,
  WARNING_ICON,
} from '@finos/legend-engine-ide-client-vscode-shared';
import type { LanguageClientProgressResult } from '../model/LanguageClientProgressResult';
import {
  type LegendTreeDataProvider,
  TreeChildNodeData,
  TreeRootNodeData,
  buildTreeNodeId,
} from '../utils/LegendTreeProvider';
import type { LegendWebViewProvider } from '../utils/LegendWebViewProvider';
import { type PlainObject } from '@finos/legend-vscode-extension-dependencies';
import * as path from 'path';
import { FunctionLegendExecutionResult } from '../model/FunctionLegendExecutionResult';

const renderTDSResultMessage = (
  legendExecutionResult: LegendExecutionResult,
  result: TDSLegendExecutionResult,
  link: Uri,
  extensionPath: string,
  webview: Webview,
): string => {
  const tds = result.result;
  const config = workspace.getConfiguration('legend');
  const agGridLicense = config.get<string>('agGridLicense', '');
  const colDefs = tds.columns.map((c) => ({
    field: c,
    headerName: c,
    ...getAggregationTDSColumnCustomizations(agGridLicense !== '', result, c),
  }));
  const rowData = getTDSRowData(tds);
  const webviewScriptPath = Uri.file(
    path.join(extensionPath, 'dist', 'AgGridRenderer.js'),
  );

  const webviewScript = webview.asWebviewUri(webviewScriptPath);
  const isDarkTheme = window.activeColorTheme.kind === ColorThemeKind.Dark;
  const htmlString = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Webview</title>
  </head>
  <body>
    <div id="root" 
    style="height: 500px; width: 100%;" class=${
      isDarkTheme ? 'ag-theme-balham-dark' : 'ag-theme-balham'
    }
         data-row-data='${JSON.stringify(rowData)}'
         data-column-defs='${JSON.stringify(colDefs)}'
         data-is-dark-theme='${isDarkTheme}'
         data-ag-grid-license='${agGridLicense}'
         data-columns='${JSON.stringify(result.builder.columns)}'> 
    </div>
    <script src=${webviewScript}></script>
    <script>
          const vscode = acquireVsCodeApi();
    </script>
  </body>
  </html>
  `;

  const functionResult = guaranteeType(
    legendExecutionResult,
    FunctionLegendExecutionResult,
  );
  webview.onDidReceiveMessage(async (msg) => {
    switch (msg.command) {
      case SEND_TDS_REQUEST_ID: {
        const r = await commands.executeCommand(SEND_TDS_REQUEST_ID, {
          entity: functionResult.ids[0],
          sectionNum: functionResult.sectionNum,
          uri: functionResult.uri,
          inputParameters: functionResult.inputParameters,
          request: msg.values,
        });
        webview.postMessage({ command: GET_TDS_REQUEST_RESULTS_ID, result: r });
        break;
      }

      default:
        throw new Error(`Unsupported request ${msg.command}`);
    }
  }, undefined);
  return htmlString;
};

const renderResultMessage = (
  r: LegendExecutionResult,
  link: Uri,
  extensionPath: string,
  webview: Webview,
): string => {
  const mssg = r.message;
  try {
    const json = JSON.parse(mssg) as PlainObject<TDSLegendExecutionResult>;
    const result = TDSLegendExecutionResult.serialization.fromJson(json);
    return renderTDSResultMessage(r, result, link, extensionPath, webview);
  } catch {
    // do nothing
  }
  const htmlString = `<html><body><div style="white-space: pre-wrap">${mssg}</div></body></html>`;
  return htmlString;
};

const showResults = (): void => {
  commands.executeCommand(SET_CONTEXT_COMMAND_ID, SHOW_EXECUTION_RESULTS, true);
};

const showExecutionProgress = (val: boolean): void => {
  commands.executeCommand(SET_CONTEXT_COMMAND_ID, IS_EXECUTION_HAPPENNG, val);
};

const getResultIcon = (resultType: LegendExecutionResultType): string => {
  switch (resultType) {
    case LegendExecutionResultType.SUCCESS:
      return TEST_PASS_ICON;
    case LegendExecutionResultType.ERROR:
      return TEST_FAIL_ICON;
    case LegendExecutionResultType.FAILURE:
      return TEST_FAIL_ICON;
    case LegendExecutionResultType.WARNING:
      return WARNING_ICON;
    default:
      return '';
  }
};

const getResultIconColor = (resultType: LegendExecutionResultType): string => {
  switch (resultType) {
    case LegendExecutionResultType.SUCCESS:
      return TEST_PASS_COLOR;
    case LegendExecutionResultType.ERROR:
      return TEST_ERROR_COLOR;
    case LegendExecutionResultType.FAILURE:
      return TEST_FAIL_COLOR;
    case LegendExecutionResultType.WARNING:
      return TEST_ERROR_COLOR;
    default:
      return '';
  }
};

export const resetExecutionTab = (
  resultsTreeDataProvider: LegendTreeDataProvider,
  resultsViewprovider: LegendWebViewProvider,
): void => {
  showResults();
  resultsTreeDataProvider.resetTreeData();
  resultsTreeDataProvider.refresh();
  showExecutionProgress(true);
  resultsViewprovider.updateView('');
};

export const renderTestResults = (
  result: LanguageClientProgressResult,
  resultsTreeDataProvider: LegendTreeDataProvider,
  uri: Uri,
  extensionPath: string,
  webview: Webview,
): void => {
  showExecutionProgress(false);
  resultsTreeDataProvider.resetTreeData();
  result.value.forEach((r) => {
    const icon = getResultIcon(r.type);
    const color = getResultIconColor(r.type);
    const themeIcon = new ThemeIcon(icon, new ThemeColor(color));
    const viewResultCommand = {
      title: SHOW_RESULTS_COMMAND_TITLE,
      command: SHOW_RESULTS_COMMAND_ID,
      arguments: [
        renderResultMessage(r, uri, extensionPath, webview),
        r.location?.uri(),
        r.location?.textInterval.toRange(),
      ],
    };

    r.ids.forEach((id, i, ids) => {
      let cmd;
      if (ids.length === i + 1) {
        cmd = viewResultCommand;
      }

      if (i === 0) {
        resultsTreeDataProvider.addRootNode(
          new TreeRootNodeData(id, id, themeIcon, cmd),
        );
      } else {
        const childNode = new TreeChildNodeData(
          buildTreeNodeId(ids.slice(0, i)),
          buildTreeNodeId(ids.slice(0, i + 1)),
          id,
          themeIcon,
          cmd,
        );

        resultsTreeDataProvider.addChildNode(childNode);

        if (r.type !== LegendExecutionResultType.SUCCESS) {
          resultsTreeDataProvider.updateNodeIcon(childNode.parentId, themeIcon);
        }
      }
    });
  });
  // Refresh the tree view to reflect the changes
  resultsTreeDataProvider.refresh();
};
