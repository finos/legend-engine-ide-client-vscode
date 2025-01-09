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
  type CancellationToken,
  type ExtensionContext,
  type NotebookSerializer,
  type WebviewPanel,
  commands,
  NotebookCellData,
  NotebookCellKind,
  NotebookData,
  workspace,
  window,
  WorkspaceEdit,
  Uri,
  notebooks,
  ViewColumn,
} from 'vscode';
import {
  DATACUBE,
  LEGEND_LANGUAGE_ID,
  OPEN_DATACUBE_IN_NEW_TAB_COMMAND_ID,
} from '../../shared/utils/Const';
import { PurebookController } from './PurebookController';
import { type LegendLanguageClient } from '../LegendLanguageClient';
import { type LegendConceptTreeProvider } from '../conceptTree';
import { handleV1LSPEngineMessage } from '../graph/utils';
import { renderDataCubeWebView } from '../webviews/DataCubeWebView';
import {
  type PlainObject,
  type V1_RawLambda,
} from '@finos/legend-vscode-extension-dependencies';

interface RawNotebookCell {
  source: string[];
  cell_type: 'code' | 'markdown';
}

class LegendBookSerializer implements NotebookSerializer {
  private encoder: TextEncoder = new TextEncoder();
  private decoder: TextDecoder = new TextDecoder();

  async deserializeNotebook(
    content: Uint8Array,
    _token: CancellationToken,
  ): Promise<NotebookData> {
    const contents = this.decoder.decode(content);

    let raw: RawNotebookCell[];
    try {
      raw = JSON.parse(contents) as RawNotebookCell[];
    } catch {
      raw = []; // todo...
    }

    const cells = raw.map(
      (item) =>
        new NotebookCellData(
          item.cell_type === 'code'
            ? NotebookCellKind.Code
            : NotebookCellKind.Markup,
          item.source.join('\n'),
          item.cell_type === 'code' ? LEGEND_LANGUAGE_ID : 'markdown',
        ),
    );

    return new NotebookData(cells);
  }

  async serializeNotebook(
    data: NotebookData,
    _token: CancellationToken,
  ): Promise<Uint8Array> {
    const contents: RawNotebookCell[] = [];

    for (const cell of data.cells) {
      contents.push({
        cell_type: cell.kind === NotebookCellKind.Code ? 'code' : 'markdown',
        source: cell.value.split(/\r?\n/g),
      });
    }

    return this.encoder.encode(JSON.stringify(contents, undefined, 1));
  }
}

const openedWebViews: Record<string, WebviewPanel> = {};

const showDatacubeWebView = async (
  context: ExtensionContext,
  client: LegendLanguageClient,
  legendConceptTree: LegendConceptTreeProvider,
  cellUri: string,
  lambda: PlainObject<V1_RawLambda>,
): Promise<void> => {
  if (openedWebViews[cellUri]) {
    openedWebViews[cellUri]?.reveal();
  } else {
    const dataCubeWebView = window.createWebviewPanel(
      DATACUBE,
      'DataCube',
      ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );
    openedWebViews[cellUri] = dataCubeWebView;
    dataCubeWebView.onDidDispose(
      () => {
        delete openedWebViews[cellUri];
      },
      null,
      context.subscriptions,
    );
    renderDataCubeWebView(
      dataCubeWebView,
      context,
      client,
      legendConceptTree,
      cellUri,
      lambda,
      workspace.getConfiguration('legend').get('studio.forms.file', ''),
    );
  }
};

export function enableLegendBook(
  context: ExtensionContext,
  client: LegendLanguageClient,
  legendConceptTree: LegendConceptTreeProvider,
): void {
  const controller = new PurebookController();

  context.subscriptions.push(
    workspace.registerNotebookSerializer(
      controller.notebookType,
      new LegendBookSerializer(),
    ),
  );

  context.subscriptions.push(
    commands.registerCommand('legend.createNotebook', createNotebook),
  );

  const messageChannel = notebooks.createRendererMessaging(
    'legend-cube-renderer',
  );
  messageChannel.onDidReceiveMessage(async (e) => {
    if (
      await handleV1LSPEngineMessage(
        messageChannel.postMessage,
        {
          documentUri: e.message.cellUri,
          sectionIndex: 0,
          entityId: 'notebook_cell',
        },
        client,
        context,
        legendConceptTree,
        e.message,
      )
    ) {
      return;
    } else if (e.message.command === OPEN_DATACUBE_IN_NEW_TAB_COMMAND_ID) {
      showDatacubeWebView(
        context,
        client,
        legendConceptTree,
        e.message.cellUri,
        e.message.lambda,
      );
    }
  });
}

async function createNotebook(): Promise<void> {
  if (workspace.workspaceFolders) {
    window
      .showInputBox({
        prompt: 'Name for purebook to create',
      })
      .then((name) => {
        if (name) {
          const wsPath = workspace.workspaceFolders![0]!.uri.fsPath;
          const filePath = Uri.file(`${wsPath}/${name}.purebook`);
          const wsedit = new WorkspaceEdit();
          wsedit.createFile(filePath);
          workspace.applyEdit(wsedit).then((applied) => {
            if (applied) {
              workspace.openNotebookDocument(filePath).then((doc) => {
                window.showNotebookDocument(doc);
              });
            } else {
              window.showWarningMessage(`Failed to create ${filePath.fsPath}`);
            }
          });
        }
      });
  }
}
