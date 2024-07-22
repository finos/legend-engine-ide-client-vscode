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
  SnippetString,
  SnippetTextEdit,
  WorkspaceEdit,
  EndOfLine,
  TerminalLink,
} from 'vscode';
import {
  type LanguageClient,
  type LanguageClientOptions,
  type Executable,
  type ServerOptions,
} from 'vscode-languageclient/node';
import { LegendTreeDataProvider } from './utils/LegendTreeProvider';
import { LanguageClientProgressResult } from './results/LanguageClientProgressResult';
import type { PlainObject } from './utils/SerializationUtils';
import {
  PROGRESS_NOTIFICATION_ID,
  RESULTS_WEB_VIEW,
  SHOW_RESULTS_COMMAND_ID,
  EXECUTION_TREE_VIEW,
  LEGEND_CLIENT_COMMAND_ID,
  FUNCTION_PARAMTER_VALUES_ID,
  SEND_TDS_REQUEST_ID,
  EXEC_FUNCTION_ID,
  LEGEND_VIRTUAL_FS_SCHEME,
  ACTIVATE_FUNCTION_ID,
  LEGEND_LANGUAGE_ID,
  LEGEND_SHOW_DIAGRAM,
  DIAGRAM_RENDERER,
} from './utils/Const';
import { LegendWebViewProvider } from './utils/LegendWebViewProvider';
import {
  renderTestResults,
  resetExecutionTab,
} from './results/ExecutionResultHelper';
import { error } from 'console';
import { isPlainObject } from './utils/AssertionUtils';
import { renderFunctionResultsWebView } from './webviews/FunctionResultsWebView';
import type { FunctionTDSRequest } from './model/FunctionTDSRequest';
import { LegendExecutionResult } from './results/LegendExecutionResult';
import { TDSLegendExecutionResult } from './results/TDSLegendExecutionResult';
import {
  LegendEntitiesRequest,
  LegendLanguageClient,
} from './LegendLanguageClient';
import { createTestController } from './testController';
import {
  type LegendConceptTreeItem,
  createLegendConceptTreeProvider,
} from './conceptTree';
import { renderDiagramRendererWebView } from './webviews/DiagramWebView';

let client: LegendLanguageClient;

export function createClient(context: ExtensionContext): LanguageClient {
  languages.setLanguageConfiguration(LEGEND_LANGUAGE_ID, {
    wordPattern:
      // eslint-disable-next-line prefer-named-capture-group
      /(-?\d*\.\d\w*)|([^`~!@#%^$&*()\-=+[{\]}\\|;:'",.<>/?\s][^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]*)/,
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
  });

  const extraVmArgs = workspace
    .getConfiguration('legend')
    .get('language.server.vmargs', []);

  const params = [];
  params.push(...extraVmArgs);
  params.push(`-DstoragePath=${context.storageUri!.fsPath}`);
  params.push('-jar');
  params.push(
    context.asAbsolutePath(
      path.join('server', 'legend-engine-ide-lsp-server-shaded.jar'),
    ),
  );
  params.push(context.asAbsolutePath(path.join('server', 'pom.xml')));

  const serverOptionsRun: Executable = {
    command: 'java',
    args: params,
  };

  const debugParams = [];
  debugParams.push(
    '-agentlib:jdwp=transport=dt_socket,server=y,quiet=y,suspend=n,address=*:11285',
  );
  debugParams.push(...params);

  const serverOptionsDebug: Executable = {
    command: 'java',
    args: debugParams,
  };

  const serverOptions: ServerOptions = {
    run: serverOptionsRun,
    debug: serverOptionsDebug,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: LEGEND_LANGUAGE_ID },
      { scheme: LEGEND_VIRTUAL_FS_SCHEME, language: LEGEND_LANGUAGE_ID },
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

  // if pom changes, ask user if we should reload extension
  workspace.onDidSaveTextDocument((e) => {
    if (e.fileName.endsWith('pom.xml')) {
      window
        .showInformationMessage(
          'Reload Legend Extension?',
          {
            modal: true,
            detail: `You just change POM file that can affect your project dependencies.  Should reload to pick changes?`,
          },
          'Reload',
        )
        .then((answer) => {
          if (answer === 'Reload') {
            client.restart();
          }
        });
    }
  });

  // if settings change, ask user if we should reload extension
  workspace.onDidChangeConfiguration((e) => {
    if (
      e.affectsConfiguration('legend.sdlc.server.url') ||
      e.affectsConfiguration('legend.extensions.other.dependencies') ||
      e.affectsConfiguration('legend.extensions.dependencies.pom') ||
      e.affectsConfiguration('legend.language.server.vmargs')
    ) {
      window
        .showInformationMessage(
          'Reload Legend Extension?',
          {
            modal: true,
            detail: `You just change a configuration setting that can affect your project dependencies.  Should reload to pick changes?`,
          },
          'Reload',
        )
        .then((answer) => {
          if (answer === 'Reload') {
            client.restart();
          }
        });
    }
  });

  client.outputChannel.show();

  return client;
}

export function registerCommands(context: ExtensionContext): void {
  const functionCommand = commands.registerCommand(
    LEGEND_CLIENT_COMMAND_ID,
    async (...args: unknown[]) => {
      const commandId = args[3] as string;
      switch (commandId) {
        case EXEC_FUNCTION_ID: {
          handleExecuteFunctionCommand(context, args);
          break;
        }

        case ACTIVATE_FUNCTION_ID: {
          handleActivateFunctionCommand(args);
          break;
        }

        default: {
          break;
        }
      }
    },
  );
  context.subscriptions.push(functionCommand);

  const openLog = commands.registerCommand('legend.log', () => {
    const openPath = Uri.joinPath(context.storageUri!, 'engine-lsp', 'log.txt');
    workspace.openTextDocument(openPath).then((doc) => {
      window.showTextDocument(doc);
    });
  });
  context.subscriptions.push(openLog);

  const reloadServer = commands.registerCommand('legend.reload', () => {
    client.restart();
  });
  context.subscriptions.push(reloadServer);

  const showOutput = commands.registerCommand('legend.extension.output', () => {
    client.outputChannel.show();
  });
  context.subscriptions.push(showOutput);

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

  const showDiagram = commands.registerCommand(
    LEGEND_SHOW_DIAGRAM,
    async (...args: unknown[]) => {
      const diagramRendererWebView = window.createWebviewPanel(
        DIAGRAM_RENDERER,
        `Diagram Render`,
        ViewColumn.One,
        {
          enableScripts: true,
        },
      );

      const entities = await client.entities(new LegendEntitiesRequest([]));
      renderDiagramRendererWebView(
        diagramRendererWebView,
        context,
        (args[0] as LegendConceptTreeItem).id as string,
        entities,
        workspace.getConfiguration('legend').get('studio.forms.file', ''),
      );
    },
  );
  context.subscriptions.push(showDiagram);
}

function handleExecuteFunctionCommand(
  context: ExtensionContext,
  args: unknown[],
): void {
  const functionSignature = args[2] as string;
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

function handleActivateFunctionCommand(args: unknown[]): void {
  const functionActivatorSnippets = Object.entries(args[4] as string);
  const items = functionActivatorSnippets.map((x) => ({
    label: x[0],
    snippet: x[1],
  }));
  window.showQuickPick(items).then((choice) => {
    if (!choice) {
      return;
    }
    const uri = Uri.parse(args[0] as string);
    workspace.openTextDocument(uri).then((document) => {
      const snippet =
        document.eol === EndOfLine.CRLF
          ? new SnippetString(choice.snippet.replaceAll('\n', '\r\n'))
          : new SnippetString(choice.snippet);
      const lastLine = document.lineCount - 1;
      const snippetPosition = document.lineAt(lastLine).range.end;
      const snippetTextEdit = SnippetTextEdit.insert(snippetPosition, snippet);
      const workspaceEdit = new WorkspaceEdit();
      workspaceEdit.set(uri, [snippetTextEdit]);
      workspace.applyEdit(workspaceEdit).then((x) => {
        if (!x) {
          throw new Error('Edit failed to apply.');
        }
      });
    });
  });
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
  registerCommands(context);
  createReplTerminal(context);
  registerLegendVirtualFilesystemProvider(context);
  context.subscriptions.push(createTestController(client));
  context.subscriptions.push(...createLegendConceptTreeProvider(client));
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
          label: '$(list-tree) Show Legend Concept Tree',
          command: 'legend.conceptTree.show',
        },
        {
          label: '$(output) Show Legend Extension Output',
          command: 'legend.extension.output',
        },
        {
          label: '$(go-to-file) Show Legend Server logs',
          command: 'legend.log',
        },
        {
          label: '$(refresh) Reload Legend Extension',
          command: 'legend.reload',
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

class LegendTerminalLink extends TerminalLink {
  url: Uri;

  constructor(startIndex: number, lenght: number, url: Uri, tooltip?: string) {
    super(startIndex, lenght, tooltip);
    this.url = url;
  }
}

const REPL_NAME = 'Legend REPL';

export function createReplTerminal(context: ExtensionContext): void {
  const provider = window.registerTerminalProfileProvider(
    'legend.terminal.repl',
    {
      provideTerminalProfile(
        token: CancellationToken,
      ): ProviderResult<TerminalProfile> {
        return client.replClasspath(token).then((cp) => ({
          options: {
            name: REPL_NAME,
            shellPath: 'java',
            shellArgs: [
              `-DstoragePath=${path.join(context.storageUri!.fsPath, 'repl')}`,
              `-Dlegend.repl.grid.licenseKey=${workspace
                .getConfiguration('legend')
                .get('agGridLicense', '')}`,
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
            isTransient: true,
          },
        }));
      },
    },
  );

  context.subscriptions.push(provider);

  // eslint-disable-next-line no-process-env
  if (process.env.VSCODE_PROXY_URI !== undefined) {
    const terminalLinkProvider = window.registerTerminalLinkProvider({
      provideTerminalLinks: (terminalContext) => {
        if (terminalContext.terminal.creationOptions.name !== REPL_NAME) {
          return [];
        }

        const isLocalHost =
          terminalContext.line.startsWith('http://localhost:');
        let indexOfReplPath = terminalContext.line.indexOf('/repl');

        if (!isLocalHost || indexOfReplPath === -1) {
          return [];
        }

        const localHostUrl = Uri.parse(terminalContext.line);
        const port = localHostUrl.authority.split(':')[1]!;

        // eslint-disable-next-line no-process-env
        if (process.env.VSCODE_PROXY_URI!.endsWith('/')) {
          // manage the trailing / when concat paths...
          indexOfReplPath++;
        }

        const proxyUrl = Uri.parse(
          // eslint-disable-next-line no-process-env
          process.env.VSCODE_PROXY_URI!.replace('{{port}}', port) +
            terminalContext.line.substring(indexOfReplPath),
        );
        return [
          new LegendTerminalLink(
            0,
            terminalContext.line.length,
            proxyUrl,
            'Open on Browser',
          ),
        ];
      },

      handleTerminalLink: (link: LegendTerminalLink) => {
        commands.executeCommand('simpleBrowser.api.open', link.url);
      },
    });

    context.subscriptions.push(terminalLinkProvider);
  }
}

function registerLegendVirtualFilesystemProvider(
  context: ExtensionContext,
): void {
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
