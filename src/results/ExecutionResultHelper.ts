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

import { ThemeColor, ThemeIcon, commands } from 'vscode';
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
} from '../utils/Const';
import type { LanguageClientProgressResult } from './LanguageClientProgressResult';
import {
  type LegendTreeDataProvider,
  TreeChildNodeData,
  TreeRootNodeData,
  buildTreeNodeId,
} from '../utils/LegendTreeProvider';
import { LegendExecutionLegacyTestSource } from './LegendExecutionLegacyTestSource';
import { LegendExecutionTestableSource } from './LegendExecutionTestableSource';
import { LegendExecutionResultType } from './LegendExecutionResultType';
import { guaranteeNonNullable } from '../utils/AssertionUtils';
import type { LegendWebViewProvider } from '../utils/LegendWebViewProvider';

const renderResultMessage = (mssg: string): string => {
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
      arguments: [renderResultMessage(r.message)],
    };
    if (r.source instanceof LegendExecutionLegacyTestSource) {
      resultsTreeDataProvider.addRootNode(
        new TreeRootNodeData(
          r.source.testId,
          r.source.testId,
          themeIcon,
          viewResultCommand,
        ),
      );
    } else if (r.source instanceof LegendExecutionTestableSource) {
      const rootNode = new TreeRootNodeData(
        r.source.testSuiteId,
        r.source.testSuiteId,
        themeIcon,
      );
      resultsTreeDataProvider.addRootNode(rootNode);
      const testIdNode = new TreeChildNodeData(
        guaranteeNonNullable(rootNode.id),
        buildTreeNodeId([r.source.testSuiteId, r.source.testId]),
        r.source.testId,
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
      if (r.source.assertionId) {
        const assertionNode = new TreeChildNodeData(
          guaranteeNonNullable(rootNode.id),
          buildTreeNodeId([
            r.source.testSuiteId,
            r.source.testId,
            r.source.assertionId,
          ]),
          r.source.assertionId,
          themeIcon,
          viewResultCommand,
        );
        resultsTreeDataProvider.addChildNode(
          guaranteeNonNullable(testIdNode.id),
          assertionNode,
        );
      }
    } else {
      resultsTreeDataProvider.addRootNode(
        new TreeRootNodeData(
          r.source.entityPath,
          r.source.entityPath,
          themeIcon,
          viewResultCommand,
        ),
      );
    }
  });
  // Refresh the tree view to reflect the changes
  resultsTreeDataProvider.refresh();
};
