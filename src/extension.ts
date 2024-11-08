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
  type CancellationToken,
  type ExtensionContext,
  type ProviderResult,
  type TerminalProfile,
  type TextDocument,
  type TextDocumentContentProvider,
  type WebviewPanel,
  commands,
  EndOfLine,
  languages,
  ProgressLocation,
  SnippetString,
  SnippetTextEdit,
  StatusBarAlignment,
  ThemeIcon,
  Uri,
  ViewColumn,
  window,
  workspace,
  WorkspaceEdit,
} from 'vscode';
import {
  type LanguageClient,
  type LanguageClientOptions,
  type Executable,
  type ServerOptions,
} from 'vscode-languageclient/node';
import { type V1_ConcreteFunctionDefinition } from '@finos/legend-vscode-extension-dependencies';
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
  ONE_ENTITY_PER_FILE_COMMAND_ID,
  LEGEND_EDIT_SERVICE_QUERY,
  SERVICE_QUERY_EDITOR,
  LEGEND_REFRESH_QUERY_BUILDER,
  LEGEND_EDIT_FUNCTION_QUERY,
  FUNCTION_QUERY_EDITOR,
} from './utils/Const';
import { LegendWebViewProvider } from './utils/LegendWebViewProvider';
import {
  renderTestResults,
  resetExecutionTab,
} from './results/ExecutionResultHelper';
import { error } from 'console';
import { guaranteeNonNullable, isPlainObject } from './utils/AssertionUtils';
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
  type LegendConceptTreeProvider,
  createLegendConceptTreeProvider,
} from './conceptTree';
import { renderDiagramRendererWebView } from './webviews/DiagramWebView';
import { renderServiceQueryEditorWebView } from './webviews/ServiceQueryEditorWebView';
import { enableLegendBook } from './purebook/purebook';
import { renderFunctionQueryEditorWebView } from './webviews/FunctionQueryEditorWebView';
import { V1_getFunctionNameWithoutSignature } from './utils/V1_ProtocolUtils';

let client: LegendLanguageClient;
const openedWebViews: Record<string, WebviewPanel> = {};
let legendConceptTreeProvider: LegendConceptTreeProvider;

export const normalizeFunctionEntityId = async (
  functionUri: string,
  includePackage: boolean = true,
): Promise<string | undefined> => {
  const functionEntity = await client.entities(
    new LegendEntitiesRequest([{ uri: functionUri }]),
  );
  return V1_getFunctionNameWithoutSignature(
    guaranteeNonNullable(
      functionEntity[0]?.content,
      `Unable to find entity with URI ${functionUri}`,
    ) as unknown as V1_ConcreteFunctionDefinition,
    includePackage,
  );
};

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
      { scheme: 'vscode-notebook-cell', language: LEGEND_LANGUAGE_ID },
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

  // if pom changes, ask user if we should reload extension.
  // if query changes, we should reload any query builders that are open.
  workspace.onDidSaveTextDocument(async (e: TextDocument) => {
    // refresh the tree provider in case the entity name has changed
    await legendConceptTreeProvider.refresh(e);
    const legendItem = guaranteeNonNullable(
      legendConceptTreeProvider.getConceptsFrom(e.uri.toString())?.[0],
      `Unable to find item in legend concept tree with URI ${e.uri.toString()}`,
    );
    const normalizedEntityId = legendItem.id
      ? legendItem?.contextValue ===
        'meta::pure::metamodel::function::ConcreteFunctionDefinition'
        ? ((await normalizeFunctionEntityId(
            guaranteeNonNullable(
              legendItem.location?.uri.toString(),
              `Legend tree item with ID ${legendItem.id} does not have a location URI`,
            ),
          )) ?? legendItem.id)
        : legendItem.id
      : '';
    const queryBuilderWebviewTypes = [
      SERVICE_QUERY_EDITOR,
      FUNCTION_QUERY_EDITOR,
    ];
    if (
      legendItem &&
      openedWebViews[normalizedEntityId] &&
      queryBuilderWebviewTypes.includes(
        openedWebViews[normalizedEntityId]?.viewType ?? '',
      )
    ) {
      openedWebViews[normalizedEntityId]?.webview.postMessage({
        command: LEGEND_REFRESH_QUERY_BUILDER,
        updatedEntityId: legendItem.id,
      });
    }
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
      e.affectsConfiguration('legend.language.server.vmargs') ||
      e.affectsConfiguration('legend.engine.server.remoteExecution')
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

const showDiagramWebView = async (
  diagramId: string,
  context: ExtensionContext,
): Promise<void> => {
  let diagramRendererWebView: WebviewPanel;
  if (openedWebViews[diagramId]) {
    diagramRendererWebView = openedWebViews[diagramId] as WebviewPanel;
    diagramRendererWebView.reveal();
  } else {
    diagramRendererWebView = window.createWebviewPanel(
      DIAGRAM_RENDERER,
      `Diagram Editor (${diagramId.split('::').pop()})`,
      ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );
    diagramRendererWebView.onDidDispose(() => {
      delete openedWebViews[diagramId];
    });
    openedWebViews[diagramId] = diagramRendererWebView;

    const entities = await client.entities(new LegendEntitiesRequest([]));
    renderDiagramRendererWebView(
      diagramRendererWebView,
      context,
      diagramId,
      entities,
      workspace.getConfiguration('legend').get('studio.forms.file', ''),
      client,
      legendConceptTreeProvider,
    );
  }
};

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

        case LEGEND_SHOW_DIAGRAM: {
          showDiagramWebView(args[2] as string, context);
          break;
        }

        default: {
          window.showWarningMessage(`${commandId} command is not supported`);
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

  const openReport = commands.registerCommand('legend.report', () => {
    const file = Uri.parse(
      `${LEGEND_VIRTUAL_FS_SCHEME}:/PCT_Report_Compatibility.md`,
    );
    commands.executeCommand('markdown.showPreview', file);
  });
  context.subscriptions.push(openReport);

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
    (...args: unknown[]) => {
      showDiagramWebView(
        (args[0] as LegendConceptTreeItem).id as string,
        context,
      );
    },
  );
  context.subscriptions.push(showDiagram);

  const editServiceQuery = commands.registerCommand(
    LEGEND_EDIT_SERVICE_QUERY,
    async (...args: unknown[]) => {
      const serviceId = (args[0] as LegendConceptTreeItem).id as string;
      const columnToShowIn = window.activeTextEditor
        ? window.activeTextEditor.viewColumn
        : undefined;
      if (openedWebViews[serviceId]) {
        openedWebViews[serviceId]?.reveal(columnToShowIn);
      } else {
        const serviceQueryEditorWebView = window.createWebviewPanel(
          SERVICE_QUERY_EDITOR,
          `Service Query Editor: ${(args[0] as LegendConceptTreeItem).label}`,
          ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
          },
        );
        openedWebViews[serviceId] = serviceQueryEditorWebView;
        serviceQueryEditorWebView.onDidDispose(
          () => {
            delete openedWebViews[serviceId];
          },
          null,
          context.subscriptions,
        );
        renderServiceQueryEditorWebView(
          serviceQueryEditorWebView,
          context,
          serviceId,
          workspace.getConfiguration('legend').get('studio.forms.file', ''),
          client,
          legendConceptTreeProvider,
        );
      }
    },
  );
  context.subscriptions.push(editServiceQuery);

  const editFunctionQuery = commands.registerCommand(
    LEGEND_EDIT_FUNCTION_QUERY,
    async (...args: unknown[]) => {
      const functionId = (args[0] as LegendConceptTreeItem).id as string;
      const functionUri = guaranteeNonNullable(
        (args[0] as LegendConceptTreeItem).location?.uri.toString(),
        `Legend tree item with ID ${(args[0] as LegendConceptTreeItem).id} does not have a location URI`,
      );
      const normalizedFunctionId =
        (await normalizeFunctionEntityId(functionUri)) ?? functionId;
      const normalizedFunctionName =
        (await normalizeFunctionEntityId(functionUri, false)) ??
        (args[0] as LegendConceptTreeItem).label;
      const columnToShowIn = window.activeTextEditor
        ? window.activeTextEditor.viewColumn
        : undefined;
      if (openedWebViews[normalizedFunctionId]) {
        openedWebViews[normalizedFunctionId]?.reveal(columnToShowIn);
      } else {
        const functionQueryEditorWebView = window.createWebviewPanel(
          FUNCTION_QUERY_EDITOR,
          `Function Query Editor: ${normalizedFunctionName}`,
          ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
          },
        );
        openedWebViews[normalizedFunctionId] = functionQueryEditorWebView;
        functionQueryEditorWebView.onDidDispose(
          () => {
            delete openedWebViews[normalizedFunctionId];
          },
          null,
          context.subscriptions,
        );
        renderFunctionQueryEditorWebView(
          functionQueryEditorWebView,
          context,
          functionId,
          workspace.getConfiguration('legend').get('studio.forms.file', ''),
          client,
          legendConceptTreeProvider,
        );
      }
    },
  );
  context.subscriptions.push(editFunctionQuery);

  const oneEntityPerFileRefactor = commands.registerCommand(
    ONE_ENTITY_PER_FILE_COMMAND_ID,
    () => {
      client.oneEntityPerFileRefactoring();
    },
  );
  context.subscriptions.push(oneEntityPerFileRefactor);
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
      } catch {
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
  const { disposables, treeDataProvider } =
    createLegendConceptTreeProvider(client);
  context.subscriptions.push(...disposables);
  legendConceptTreeProvider = treeDataProvider;
  enableLegendBook(context);
  context.globalState.update(
    'currentUserId',
    // eslint-disable-next-line no-process-env
    process.env.CODER_USERNAME || process.env.USER,
  );
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

      if (workspace.workspaceFolders) {
        items.push({
          label: '$(repl) Create Legend REPL Notebook',
          command: 'legend.createNotebook',
        });
      }

      items.push(
        {
          label: '$(list-tree) Show Legend Concept Tree',
          command: 'legend.conceptTree.show',
        },
        {
          label: '$(type-hierarchy) One Entity Per File Refactoring',
          command: 'legend.refactor.oneEntityPerFile',
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
          label: '$(go-to-file) View Pure Compatibility Testing (PCT) Report',
          command: 'legend.report',
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

const REPL_NAME = 'Legend REPL';

export function createReplTerminal(context: ExtensionContext): void {
  const workspaceFolders =
    workspace.workspaceFolders?.map(
      (workspaceFolder) => workspaceFolder.uri.fsPath,
    ) ?? [];
  const replHomeDir = path.join(context.storageUri!.fsPath, 'repl');
  // NOTE: when used in Coder, auto-forwarding is set up so an URL template is specified in the environment
  // See https://coder.com/docs/code-server/guide#using-your-own-proxy
  // eslint-disable-next-line no-process-env
  const coderVSCodeProxyURLTemplate = process.env.VSCODE_PROXY_URI;

  const extraVmArgs = workspace
    .getConfiguration('legend')
    .get('language.repl.vmargs', []);

  const shellArgs = [
    ...extraVmArgs,
    `-DstoragePath=${replHomeDir}`,
    coderVSCodeProxyURLTemplate
      ? `-Dlegend.repl.dataCube.urlTemplate=${coderVSCodeProxyURLTemplate}`
      : undefined,
    `-Dlegend.repl.dataCube.gridLicenseKey=${workspace
      .getConfiguration('legend')
      .get('agGridLicense', '')}`,
    `-Dlegend.repl.configuration.homeDir=${replHomeDir}`,
    `-Dlegend.planExecutor.configuration=${workspace
      .getConfiguration('legend')
      .get('planExecutor.configuration', '')}`,
    // '-agentlib:jdwp=transport=dt_socket,server=y,quiet=y,suspend=n,address=*:11292',
    'org.finos.legend.engine.ide.lsp.server.LegendREPLTerminal',
    ...workspaceFolders,
  ].filter((arg): arg is string => arg !== undefined);

  const provider = window.registerTerminalProfileProvider(
    'legend.terminal.repl',
    {
      provideTerminalProfile(
        token: CancellationToken,
      ): ProviderResult<TerminalProfile> {
        return (async () => {
          // So a progress bar while waiting for the classpath to be computed/the server going through post-initialization
          const classpath = await window.withProgress(
            {
              location: ProgressLocation.Notification,
              title: `Initializing ${REPL_NAME}`,
            },
            () => client.replClasspath(token),
          );
          // As we output while initializing the REPL, the IDE automatically switch to show the Output panel
          // we must force it back to Terminal panel
          window.activeTerminal?.show();
          return {
            options: {
              name: REPL_NAME,
              shellPath: 'java',
              shellArgs,
              env: {
                CLASSPATH: classpath,
              },
              // dim the text to make it similar to header of REPL
              message: `\x1b[90mLauching ${REPL_NAME}...\r\n[DEV] Log: ${Uri.file(
                path.join(
                  context.storageUri!.fsPath,
                  'repl',
                  'engine-lsp',
                  'log.txt',
                ),
              )}\x1b[0m`,
              iconPath: new ThemeIcon('compass'),
              isTransient: true,
            },
          };
        })();
      },
    },
  );

  context.subscriptions.push(provider);
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
