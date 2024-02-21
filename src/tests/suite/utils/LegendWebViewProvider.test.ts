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
import { window, commands } from 'vscode';
import {
  RESULTS_WEB_VIEW,
  SHOW_RESULTS_COMMAND_ID,
} from '../../../utils/Const';
import { strictEqual } from 'assert';
import { Mock_Webview } from '../../mockUtils/Mock_LanguageClient';
import { LegendWebViewProvider } from '../../../utils/LegendWebViewProvider';

suite('LegendWebViewProvider Test Suite', () => {
  const testSandbox = createSandbox();
  let registerWebviewViewProviderStub: SinonStub;
  let executeCommandStub: SinonStub;

  setup(() => {
    registerWebviewViewProviderStub = testSandbox.stub(
      window,
      'registerWebviewViewProvider',
    );
    executeCommandStub = testSandbox.stub(commands, 'executeCommand');
  });

  teardown(() => {
    testSandbox.restore();
  });

  test('Test updating webview', async () => {
    const resultsViewprovider = new LegendWebViewProvider();
    registerWebviewViewProviderStub(RESULTS_WEB_VIEW, resultsViewprovider);
    testSandbox.stub(resultsViewprovider, 'getWebView').resolves(Mock_Webview);
    const updateViewSpy = testSandbox.stub(resultsViewprovider, 'updateView');
    const message = 'Test web view update';
    executeCommandStub
      .withArgs(SHOW_RESULTS_COMMAND_ID)
      .resolves(resultsViewprovider.updateView(message));
    commands.executeCommand(SHOW_RESULTS_COMMAND_ID, message);
    strictEqual(
      executeCommandStub.withArgs(SHOW_RESULTS_COMMAND_ID, message).callCount,
      1,
    );
    strictEqual(updateViewSpy.calledOnceWith(message), true);
  });
});
