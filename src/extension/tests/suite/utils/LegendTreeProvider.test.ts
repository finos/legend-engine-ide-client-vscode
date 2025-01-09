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

import { createSandbox, type SinonStub } from 'sinon';
import { ThemeColor, ThemeIcon, window } from 'vscode';
import {
  RESULTS_WEB_VIEW,
  TEST_FAIL_COLOR,
  TEST_FAIL_ICON,
  TEST_PASS_COLOR,
  TEST_PASS_ICON,
} from '../../../utils/Const';
import { deepStrictEqual, strictEqual } from 'assert';
import {
  Mock_ExecutionContext,
  Mock_Webview,
} from '../../mockUtils/Mock_LanguageClient';
import type { PlainObject } from '../../../utils/SerializationUtils';
import { LegendExecutionResultType } from '../../../results/LegendExecutionResultType';
import { LegendTreeDataProvider } from '../../../utils/LegendTreeProvider';
import { LegendWebViewProvider } from '../../../utils/LegendWebViewProvider';
import { renderTestResults } from '../../../results/ExecutionResultHelper';
import { LanguageClientProgressResult } from '../../../results/LanguageClientProgressResult';

const TEST_LEGEND_EXECUTION_RESULTS_DATA_SUCCESS: PlainObject<LanguageClientProgressResult> =
  {
    token: 'success',
    value: [
      {
        ids: ['service', 'testSuite'],
        type: LegendExecutionResultType.SUCCESS,
        message: 'success',
      },
      {
        ids: ['service', 'testSuite', 'test'],
        type: LegendExecutionResultType.SUCCESS,
        message: 'success',
      },
    ],
  };

const TEST_LEGEND_EXECUTION_RESULTS_DATA_FAIL: PlainObject<LanguageClientProgressResult> =
  {
    token: 'fail',
    value: [
      {
        ids: ['Service', 'testSuite'],
        type: LegendExecutionResultType.FAILURE,
        message: 'failure',
      },
      {
        ids: ['Service', 'testSuite', 'test1'],
        type: LegendExecutionResultType.FAILURE,
        message: 'failure',
      },
      {
        ids: ['Service', 'testSuite', 'test2'],
        type: LegendExecutionResultType.SUCCESS,
        message: 'success',
      },
    ],
  };

suite('LegendTreeProvider Test Suite', () => {
  const testSandbox = createSandbox();
  let registerWebviewViewProviderStub: SinonStub;

  setup(() => {
    registerWebviewViewProviderStub = testSandbox.stub(
      window,
      'registerWebviewViewProvider',
    );
  });

  teardown(() => {
    testSandbox.restore();
  });

  test('Test results tree view when execution succeds', async () => {
    const context = new Mock_ExecutionContext();
    const resultsTreeDataProvider = new LegendTreeDataProvider();
    const resultsViewprovider = new LegendWebViewProvider();
    registerWebviewViewProviderStub(RESULTS_WEB_VIEW, resultsViewprovider);
    testSandbox.stub(resultsViewprovider, 'getWebView').resolves(Mock_Webview);

    renderTestResults(
      LanguageClientProgressResult.serialization.fromJson(
        TEST_LEGEND_EXECUTION_RESULTS_DATA_SUCCESS,
      ),
      resultsTreeDataProvider,
      context.extensionUri,
      context.extensionPath,
      resultsViewprovider.getWebView(),
    );
    strictEqual(resultsTreeDataProvider.treeData.nodes.size, 3);
    const nodeValues = Array.from(
      resultsTreeDataProvider.treeData.nodes.values(),
    );

    deepStrictEqual(
      nodeValues[0]?.iconPath,
      new ThemeIcon(TEST_PASS_ICON, new ThemeColor(TEST_PASS_COLOR)),
    );
    strictEqual(nodeValues[0].id, 'service');
    deepStrictEqual(nodeValues[0].childrenIds, ['service:testSuite']);

    deepStrictEqual(
      nodeValues[1]?.iconPath,
      new ThemeIcon(TEST_PASS_ICON, new ThemeColor(TEST_PASS_COLOR)),
    );
    strictEqual(nodeValues[1].id, 'service:testSuite');
    deepStrictEqual(nodeValues[1].childrenIds, ['service:testSuite:test']);

    deepStrictEqual(
      nodeValues[2]?.iconPath,
      new ThemeIcon(TEST_PASS_ICON, new ThemeColor(TEST_PASS_COLOR)),
    );
    strictEqual(nodeValues[2].id, 'service:testSuite:test');
    deepStrictEqual(nodeValues[2].childrenIds, []);
  });

  test('Test results tree view when execution fails', async () => {
    const context = new Mock_ExecutionContext();
    const resultsTreeDataProvider = new LegendTreeDataProvider();
    const resultsViewprovider = new LegendWebViewProvider();
    registerWebviewViewProviderStub(RESULTS_WEB_VIEW, resultsViewprovider);
    testSandbox.stub(resultsViewprovider, 'getWebView').resolves(Mock_Webview);

    renderTestResults(
      LanguageClientProgressResult.serialization.fromJson(
        TEST_LEGEND_EXECUTION_RESULTS_DATA_FAIL,
      ),
      resultsTreeDataProvider,
      context.extensionUri,
      context.extensionPath,
      resultsViewprovider.getWebView(),
    );
    strictEqual(
      resultsTreeDataProvider.treeData.nodes.size,
      4,
      'expect 4 nodes',
    );
    const nodeValues = Array.from(
      resultsTreeDataProvider.treeData.nodes.values(),
    );

    deepStrictEqual(
      nodeValues[0]?.iconPath,
      new ThemeIcon(TEST_FAIL_ICON, new ThemeColor(TEST_FAIL_COLOR)),
    );
    strictEqual(nodeValues[0].id, 'Service');
    deepStrictEqual(nodeValues[0].childrenIds, ['Service:testSuite']);

    deepStrictEqual(
      nodeValues[1]?.iconPath,
      new ThemeIcon(TEST_FAIL_ICON, new ThemeColor(TEST_FAIL_COLOR)),
    );
    strictEqual(nodeValues[1].id, 'Service:testSuite');
    deepStrictEqual(nodeValues[1].childrenIds, [
      'Service:testSuite:test1',
      'Service:testSuite:test2',
    ]);

    deepStrictEqual(
      nodeValues[2]?.iconPath,
      new ThemeIcon(TEST_FAIL_ICON, new ThemeColor(TEST_FAIL_COLOR)),
    );
    strictEqual(nodeValues[2].id, 'Service:testSuite:test1');
    deepStrictEqual(nodeValues[2].childrenIds, []);

    deepStrictEqual(
      nodeValues[3]?.iconPath,
      new ThemeIcon(TEST_PASS_ICON, new ThemeColor(TEST_PASS_COLOR)),
    );
    strictEqual(nodeValues[3].id, 'Service:testSuite:test2');
    deepStrictEqual(nodeValues[3].childrenIds, []);
  });
});
