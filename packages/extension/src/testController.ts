/**
 * Copyright (c) 2024-present, Goldman Sachs
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
  tests,
  workspace,
  TestRunProfileKind,
  type CancellationToken,
  type TestRunRequest,
  type TestController,
  type TestItem,
  type TestMessage,
} from 'vscode';
import type { LegendLanguageClient } from './LegendLanguageClient';
import { LegendTest } from './model/LegendTest';
import { LegendExecutionResultType } from '@finos/legend-engine-ide-client-vscode-shared';
import { LegendTestExecutionResult } from './model/LegendTestExecutionResult';
import {
  textIntervalToRange,
  textLocationToLocation,
  textLocationToUri,
} from './utils/TextLocationUtils';

type TestTuple = { legendTest: LegendTest; testItem: TestItem };

function processThisAndChildren(
  legendTest: LegendTest,
  testIdToCommand: Map<string, TestTuple>,
  action: (testItem: TestItem) => void,
): void {
  action(testIdToCommand.get(legendTest.id)!.testItem);
  legendTest.children.forEach((x) =>
    processThisAndChildren(x, testIdToCommand, action),
  );
}

function executeTests(
  controller: TestController,
  client: LegendLanguageClient,
  testIdToCommand: Map<string, TestTuple>,
  request: TestRunRequest,
  token: CancellationToken,
): Thenable<void> | void {
  const testRun = controller.createTestRun(request);

  let legendTests;

  if (request.include) {
    legendTests = request.include.map(
      (x) => testIdToCommand.get(x.id)!.legendTest,
    );
  } else {
    legendTests = [] as LegendTest[];
    controller.items.forEach((ti) => {
      if (!request.exclude?.includes(ti)) {
        legendTests.push(testIdToCommand.get(ti.id)!.legendTest);
      }
    });
  }

  legendTests.forEach((x) =>
    processThisAndChildren(x, testIdToCommand, testRun.enqueued),
  );

  return Promise.all(
    legendTests.map(async (x) => {
      processThisAndChildren(x, testIdToCommand, testRun.started);
      return client
        .executeTests(
          {
            location: x.location,
            testId: x.id,
            excludedTestIds: request.exclude?.map((ex) => ex.id),
          },
          token,
        )
        .then((objectResults) => {
          objectResults.forEach((objectResult) => {
            const result =
              LegendTestExecutionResult.serialization.fromJson(objectResult);
            const testItem = testIdToCommand.get(result.id)!.testItem;
            switch (result.type) {
              case LegendExecutionResultType.SUCCESS:
                testRun.passed(testItem);
                break;
              case LegendExecutionResultType.FAILURE: {
                const assertionResults = result.assertionResults?.map(
                  (assertion) => {
                    let msg: TestMessage;

                    if (assertion.expected && assertion.actual) {
                      msg = {
                        message:
                          assertion.message ||
                          `Assertion ${assertion.assertId} failed`,
                        expectedOutput: assertion.expected,
                        actualOutput: assertion.actual,
                      };
                    } else {
                      msg = {
                        message:
                          assertion.message ||
                          `Assertion ${assertion.assertId} failed`,
                      };
                    }

                    if (
                      assertion.location &&
                      textLocationToLocation(assertion.location)
                    ) {
                      msg.location = textLocationToLocation(assertion.location);
                    }

                    return msg;
                  },
                );

                testRun.failed(testItem, assertionResults || []);
                break;
              }
              case LegendExecutionResultType.ERROR:
              case LegendExecutionResultType.WARNING:
              default:
                testRun.errored(testItem, {
                  message: result.message || 'Unknown',
                });
            }

            if (result.output) {
              testRun.appendOutput(result.output, undefined, testItem);
            }
          });
        });
    }),
  ).then(() => testRun.end());
}

function legendTestToTestItem(
  controller: TestController,
  testIdToCommand: Map<string, TestTuple>,
  legendTest: LegendTest,
): TestItem {
  const testItem = controller.createTestItem(
    legendTest.id,
    legendTest.label,
    textLocationToUri(legendTest.location),
  );
  testItem.range = textIntervalToRange(legendTest.location.textInterval);
  testItem.children.replace(
    legendTest.children.map((childLegendTest) =>
      legendTestToTestItem(controller, testIdToCommand, childLegendTest),
    ),
  );
  testIdToCommand.set(legendTest.id, { legendTest, testItem });
  return testItem;
}

function refreshTests(
  controller: TestController,
  client: LegendLanguageClient,
  testIdToCommand: Map<string, TestTuple>,
  token?: CancellationToken,
): Thenable<void> | void {
  return client.testCases(token).then((test) => {
    const testitems = test.map((t) => {
      const legendTest = LegendTest.serialization.fromJson(t);
      return legendTestToTestItem(controller, testIdToCommand, legendTest);
    });
    controller.items.replace(testitems);
  });
}

export function createTestController(
  client: LegendLanguageClient,
): TestController {
  const controller = tests.createTestController(
    'leged.test.controller',
    'Legend Tests',
  );

  const testIdToCommand = new Map<string, TestTuple>();

  controller.createRunProfile(
    'Run Tests',
    TestRunProfileKind.Run,
    (request, token) =>
      executeTests(controller, client, testIdToCommand, request, token),
    true,
    undefined,
    false,
  );
  controller.refreshHandler = (token) =>
    refreshTests(controller, client, testIdToCommand, token);

  // delayed by 500ms to allow language server to ack the change
  // before we request a refresh of test cases
  workspace.onDidOpenTextDocument((e) =>
    setTimeout(() => refreshTests(controller, client, testIdToCommand), 500),
  );
  workspace.onDidChangeTextDocument((e) =>
    setTimeout(() => refreshTests(controller, client, testIdToCommand), 500),
  );

  return controller;
}
