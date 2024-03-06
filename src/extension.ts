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

import * as path from 'path';
import {
  Uri,
  workspace,
  type ExtensionContext,
  languages,
  window,
  commands,
  ViewColumn,
  StatusBarAlignment,
  ThemeIcon,
  type TextDocumentContentProvider,
  type CancellationToken,
  type TerminalProfile,
  type ProviderResult,
} from 'vscode';
import type {
  LanguageClient,
  LanguageClientOptions,
  Executable,
  ServerOptions,
} from 'vscode-languageclient/node';
import { LegendTreeDataProvider } from './utils/LegendTreeProvider';
import { LanguageClientProgressResult } from './results/LanguageClientProgressResult';
import type { PlainObject } from './utils/SerializationUtils';
import {
  PROGRESS_NOTIFICATION_ID,
  RESULTS_WEB_VIEW,
  SHOW_RESULTS_COMMAND_ID,
  EXECUTION_TREE_VIEW,
  EXEC_FUNCTION_WITH_PARAMETERS_ID,
  LEGEND_CLIENT_COMMAND_ID,
  FUNCTION_PARAMTER_VALUES_ID,
  SEND_TDS_REQUEST_ID,
  EXEC_FUNCTION_ID,
  LEGEND_VIRTUAL_FS_SCHEME,
} from './utils/Const';
import { LegendWebViewProvider } from './utils/LegendWebViewProvider';
import {
  renderTestResults,
  resetExecutionTab,
} from './results/ExecutionResultHelper';
import { error } from 'console';
import { isPlainObject } from './utils/AssertionUtils';
import { renderFunctionResultsWebView } from './function/FunctionResultsWebView';
import type { FunctionTDSRequest } from './model/FunctionTDSRequest';
import { LegendExecutionResult } from './results/LegendExecutionResult';
import { TDSLegendExecutionResult } from './results/TDSLegendExecutionResult';
import { LegendLanguageClient } from './LegendLanguageClient';
import { createTestController } from './testController';

let client: LegendLanguageClient;

export function createClient(context: ExtensionContext): LanguageClient {
  languages.setLanguageConfiguration('legend', {
    wordPattern:
      // eslint-disable-next-line prefer-named-capture-group
      /(-?\d*\.\d\w*)|([^`~!@#%^$&*()\-=+[{\]}\\|;:'",.<>/?\s][^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]*)/,
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
  });

  const serverOptionsRun: Executable = {
    command: 'java',
    args: [
      `-DstoragePath=${context.storageUri!.fsPath}`,
      '-jar',
      context.asAbsolutePath(
        path.join('server', 'legend-engine-ide-lsp-server-shaded.jar'),
      ),
      context.asAbsolutePath(path.join('server', 'pom.xml')),
    ],
  };

  const serverOptionsDebug: Executable = {
    command: 'java',
    args: [
      `-DstoragePath=${context.storageUri!.fsPath}`,
      '-agentlib:jdwp=transport=dt_socket,server=y,quiet=y,suspend=n,address=*:11285',
      '-jar',
      context.asAbsolutePath(
        path.join('server', 'legend-engine-ide-lsp-server-shaded.jar'),
      ),
      context.asAbsolutePath(path.join('server', 'pom.xml')),
    ],
  };

  const serverOptions: ServerOptions = {
    run: serverOptionsRun,
    debug: serverOptionsDebug,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'legend' },
      { scheme: LEGEND_VIRTUAL_FS_SCHEME, language: 'legend' },
    ],
    synchronize: { fileEvents: workspace.createFileSystemWatcher('**/*.pure') },
  };
  client = new LegendLanguageClient(
    'Legend',
    'Legend',
    serverOptions,
    clientOptions,
  );
  // Initialize client
  client.start();
  return client;
}

export function registerComamnds(context: ExtensionContext): void {
  const executeFunctionWithParametersCommand = commands.registerCommand(
    LEGEND_CLIENT_COMMAND_ID,
    async (...args: unknown[]) => {
      const functionSignature = args[2] as string;
      const commandId = args[3] as string;
      if (
        commandId === EXEC_FUNCTION_WITH_PARAMETERS_ID ||
        commandId === EXEC_FUNCTION_ID
      ) {
        const functionParametersWebView = window.createWebviewPanel(
          FUNCTION_PARAMTER_VALUES_ID,
          `Function Execution: ${functionSignature}`,
          ViewColumn.One,
          {
            enableScripts: true,
          },
        );
        renderFunctionResultsWebView(
          functionParametersWebView,
          context.extensionUri,
          context,
          args,
        );
      }
    },
  );
  context.subscriptions.push(executeFunctionWithParametersCommand);

  const openLog = commands.registerCommand('legend.log', () => {
    const openPath = Uri.joinPath(context.storageUri!, 'engine-lsp', 'log.txt');
    workspace.openTextDocument(openPath).then((doc) => {
      window.showTextDocument(doc);
    });
  });
  context.subscriptions.push(openLog);

  const functiontds = commands.registerCommand(
    SEND_TDS_REQUEST_ID,
    async (request: FunctionTDSRequest) => {
      const result = await client.sendTDSRequest(request);
      const mssg = LegendExecutionResult.serialization.fromJson(result).message;
      const json = JSON.parse(mssg) as PlainObject<TDSLegendExecutionResult>;
      return TDSLegendExecutionResult.serialization.fromJson(json);
    },
  );
  context.subscriptions.push(functiontds);
}

export function registerClientViews(context: ExtensionContext): void {
  // Register views
  const resultsTreeDataProvider = new LegendTreeDataProvider();
  window.registerTreeDataProvider(EXECUTION_TREE_VIEW, resultsTreeDataProvider);

  const resultsViewprovider = new LegendWebViewProvider();
  const resultsView = window.registerWebviewViewProvider(
    RESULTS_WEB_VIEW,
    resultsViewprovider,
  );
  context.subscriptions.push(resultsView);

  // Create views
  window.createTreeView(EXECUTION_TREE_VIEW, {
    treeDataProvider: resultsTreeDataProvider,
  });

  // Register commands
  const showResultsCommand = commands.registerCommand(
    SHOW_RESULTS_COMMAND_ID,
    (errorMssg: string, uri?: string, range?: Range) => {
      resultsViewprovider.updateView(errorMssg);
      if (uri) {
        let options = {};
        if (range) {
          options = {
            selection: range,
          };
        }
        commands.executeCommand('vscode.openWith', uri, 'default', options);
      }
    },
  );
  context.subscriptions.push(showResultsCommand);

  // Listen to progress notifications
  client.onNotification(
    PROGRESS_NOTIFICATION_ID,
    (objectResult: PlainObject<LanguageClientProgressResult>) => {
      try {
        if (
          isPlainObject(objectResult.value) &&
          objectResult.value.kind !== 'end'
        ) {
          resetExecutionTab(resultsTreeDataProvider, resultsViewprovider);
        }
        resultsViewprovider.focus();
        const result =
          LanguageClientProgressResult.serialization.fromJson(objectResult);
        renderTestResults(
          result,
          resultsTreeDataProvider,
          context.extensionUri,
          context.extensionPath,
          resultsViewprovider.getWebView(),
        );
      } catch (e) {
        if (error instanceof Error) {
          window.showErrorMessage(error.message);
        }
      }
    },
  );
}

export function activate(context: ExtensionContext): void {
  createStatusBarItem(context);
  createClient(context);
  registerClientViews(context);
  registerComamnds(context);
  createReplTerminal(context);
  registerLegendVirtualFilesystemProvider(client, context);
  context.subscriptions.push(createTestController(client));
}

export function createStatusBarItem(context: ExtensionContext): void {
  // todo have mechanism to push status of server...
  // example: https://github.com/redhat-developer/vscode-java/blob/master/src/serverStatusBarProvider.ts#L36
  const statusBarItem = window.createStatusBarItem(
    'legend.serverStatus',
    StatusBarAlignment.Left,
  );
  context.subscriptions.push(statusBarItem);
  statusBarItem.name = 'Legend';
  statusBarItem.text = '$(compass) Legend';
  statusBarItem.tooltip = 'Show Legend commands';
  statusBarItem.command = {
    title: 'Show Legend commands',
    command: 'legend.showCommands.shorcut',
    tooltip: 'Show Legend commands',
  };

  const shortcutCommand = commands.registerCommand(
    'legend.showCommands.shorcut',
    async () => {
      const items = [];
      items.push(
        {
          label: '$(go-to-file) Show Language Server log',
          command: 'legend.log',
        },
        {
          label: '$(settings-gear) Open Legend Settings',
          command: 'workbench.action.openSettings',
          args: ['@ext:FINOS.legend-engine-ide-client-vscode'],
        },
      );

      const choice = await window.showQuickPick(items);
      if (!choice) {
        return;
      }

      if (choice.command) {
        commands.executeCommand(choice.command, ...(choice.args || []));
      }
    },
  );

  context.subscriptions.push(shortcutCommand);
  statusBarItem.show();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

export function createReplTerminal(context: ExtensionContext): void {
  const provider = window.registerTerminalProfileProvider(
    'legend.terminal.repl',
    {
      provideTerminalProfile(
        token: CancellationToken,
      ): ProviderResult<TerminalProfile> {
        return client.replClasspath(token).then((cp) => ({
          options: {
            name: 'Legend REPL',
            shellPath: 'java',
            shellArgs: [
              `-DstoragePath=${path.join(context.storageUri!.fsPath, 'repl')}`,
              // '-agentlib:jdwp=transport=dt_socket,server=y,quiet=y,suspend=n,address=*:11292',
              'org.finos.legend.engine.ide.lsp.server.LegendREPLTerminal',
            ],
            env: {
              CLASSPATH: cp,
            },
            message: `REPL log file: ${Uri.file(
              path.join(
                context.storageUri!.fsPath,
                'repl',
                'engine-lsp',
                'log.txt',
              ),
            )}`,
            iconPath: new ThemeIcon('compass'),
          },
        }));
      },
    },
  );

  context.subscriptions.push(provider);
}

function registerLegendVirtualFilesystemProvider(
  client: LegendLanguageClient,
  context: ExtensionContext,
) {
  const legendVfsProvider = new (class implements TextDocumentContentProvider {
    async provideTextDocumentContent(
      uri: Uri,
      token: CancellationToken,
    ): Promise<string> {
      return client.legendVirtualFile(uri, token);
    }
  })();
  context.subscriptions.push(
    workspace.registerTextDocumentContentProvider(
      LEGEND_VIRTUAL_FS_SCHEME,
      legendVfsProvider,
    ),
  );
}
