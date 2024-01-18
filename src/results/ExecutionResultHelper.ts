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
} from 'vscode';
import {
  SET_CONTEXT_COMMAND_ID,
  SHOW_RESULTS_COMMAND_ID,
  SHOW_RESULTS_COMMAND_TITLE,
  SHOW_EXECUTION_RESULTS,
  TEST_ERROR_COLOR,
  TEST_FAIL_COLOR,
  TEST_FAIL_ICON,
  TEST_PASS_COLOR,
  TEST_PASS_ICON,
  WARNING_ICON,
  IS_EXECUTION_HAPPENNG,
  NODE_MODULES,
  AG_GRID_COMMUNITY,
  STYLES_MODULE,
  AG_GRID_STYLE_PATH,
  AG_GRID_BALHAM_THEME,
} from '../utils/Const';
import type { LanguageClientProgressResult } from './LanguageClientProgressResult';
import {
  type LegendTreeDataProvider,
  TreeChildNodeData,
  TreeRootNodeData,
  buildTreeNodeId,
} from '../utils/LegendTreeProvider';
import { LegendExecutionResultType } from './LegendExecutionResultType';
import { guaranteeNonNullable, isBoolean } from '../utils/AssertionUtils';
import type { LegendWebViewProvider } from '../utils/LegendWebViewProvider';
import type { PlainObject } from '../utils/SerializationUtils';
import {
  TDSLegendExecutionResult,
  type TabularDataSet,
} from './TDSLegendExecutionResult';
import * as path from 'path';

export type TDSResultCellDataType =
  | string
  | number
  | boolean
  | null
  | undefined;

export interface TDSRowDataType {
  [key: string]: TDSResultCellDataType;
}

const renderTDSResultMessage = (
  tds: TabularDataSet,
  link: Uri,
  extensionPath: string,
  webview: Webview,
): string => {
  const agGridStylePath = Uri.joinPath(
    link,
    NODE_MODULES,
    AG_GRID_COMMUNITY,
    STYLES_MODULE,
    AG_GRID_STYLE_PATH,
  );
  const agGridBalhamThemePath = Uri.joinPath(
    link,
    NODE_MODULES,
    AG_GRID_COMMUNITY,
    STYLES_MODULE,
    AG_GRID_BALHAM_THEME,
  );
  const colDefs = tds.columns.map((c) => ({ field: c, headerName: c }));
  const rowData = tds.rows.map((_row, rowIdx) => {
    const row: TDSRowDataType = {};
    const cols = tds.columns;
    _row.values.forEach((value, colIdx) => {
      // `ag-grid` shows `false` value as empty string so we have
      // call `.toString()` to avoid this behavior.
      row[cols[colIdx] as string] = isBoolean(value) ? String(value) : value;
    });

    row.rowNumber = rowIdx;
    return row;
  });
  const webviewScriptPath = Uri.file(
    path.join(extensionPath, 'lib', 'components', 'AgGridRenderer.js'),
  );

  const webviewScript = webview.asWebviewUri(webviewScriptPath);
  const isDarkTheme = window.activeColorTheme.kind === ColorThemeKind.Dark;
  const htmlString = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="${webview.asWebviewUri(agGridStylePath)}">
      <link rel="stylesheet" href="${webview.asWebviewUri(
        agGridBalhamThemePath,
      )}">
    <title>React Webview</title>
  </head>
  <body>
    <div id="root" 
    style="height: 500px; width: 100%;" class=${
      isDarkTheme ? 'ag-theme-balham-dark' : 'ag-theme-balham'
    }
         data-row-data='${JSON.stringify(rowData)}'
         data-column-defs='${JSON.stringify(colDefs)}'
         data-is-dark-theme='${isDarkTheme}'> 
    </div>
    <script src=${webviewScript}></script>
  </body>
  </html>
  `;
  return htmlString;
};

const renderResultMessage = (
  mssg: string,
  link: Uri,
  extensionPath: string,
  webview: Webview,
): string => {
  try {
    const json = JSON.parse(mssg) as PlainObject<TDSLegendExecutionResult>;
    const result = TDSLegendExecutionResult.serialization.fromJson(json);
    return renderTDSResultMessage(result.result, link, extensionPath, webview);
  } catch (e) {
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
      arguments: [renderResultMessage(r.message, uri, extensionPath, webview)],
    };
    if (r.ids.length === 2) {
      const testId = guaranteeNonNullable(r.ids[1]);
      resultsTreeDataProvider.addRootNode(
        new TreeRootNodeData(testId, testId, themeIcon, viewResultCommand),
      );
    } else if (r.ids.length > 2) {
      const testSuiteId = guaranteeNonNullable(r.ids[1]);
      const testId = guaranteeNonNullable(r.ids[2]);
      const assertionId = r.ids[3];
      const rootNode = new TreeRootNodeData(
        testSuiteId,
        testSuiteId,
        themeIcon,
      );
      resultsTreeDataProvider.addRootNode(rootNode);
      const testIdNode = new TreeChildNodeData(
        guaranteeNonNullable(rootNode.id),
        buildTreeNodeId([testSuiteId, testId]),
        testId,
        themeIcon,
      );
      resultsTreeDataProvider.addChildNode(
        guaranteeNonNullable(rootNode.id),
        testIdNode,
      );
      if (r.type !== LegendExecutionResultType.SUCCESS) {
        // Update testSuite and test node icons when we encounter failures
        resultsTreeDataProvider.updateNodeIcon(
          guaranteeNonNullable(rootNode.id),
          themeIcon,
        );
        resultsTreeDataProvider.updateNodeIcon(
          guaranteeNonNullable(testIdNode.id),
          themeIcon,
        );
      }
      if (assertionId) {
        const assertionNode = new TreeChildNodeData(
          guaranteeNonNullable(rootNode.id),
          buildTreeNodeId([testSuiteId, testId, assertionId]),
          assertionId,
          themeIcon,
          viewResultCommand,
        );
        resultsTreeDataProvider.addChildNode(
          guaranteeNonNullable(testIdNode.id),
          assertionNode,
        );
      }
    } else {
      const entityPath = guaranteeNonNullable(r.ids[0]);
      resultsTreeDataProvider.addRootNode(
        new TreeRootNodeData(
          entityPath,
          entityPath,
          themeIcon,
          viewResultCommand,
        ),
      );
    }
  });
  // Refresh the tree view to reflect the changes
  resultsTreeDataProvider.refresh();
};
