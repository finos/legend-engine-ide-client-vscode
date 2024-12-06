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
  commands,
  type ExtensionContext,
  NotebookCellData,
  NotebookCellKind,
  NotebookData,
  type NotebookSerializer,
  workspace,
  window,
  WorkspaceEdit,
  Uri,
} from 'vscode';
import { LEGEND_LANGUAGE_ID } from '../utils/Const';
import { PurebookController } from './PurebookController';

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

export function enableLegendBook(context: ExtensionContext): void {
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
