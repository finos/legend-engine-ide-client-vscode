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
  type NotebookCell,
  type NotebookDocument,
  NotebookCellData,
  NotebookCellKind,
  NotebookCellOutput,
  NotebookCellOutputItem,
  type NotebookController,
  NotebookData,
  notebooks,
  type NotebookSerializer,
  workspace,
  window,
  WorkspaceEdit,
  Uri,
} from 'vscode';
import { LEGEND_COMMAND, LEGEND_LANGUAGE_ID } from '../utils/Const';
import type { PlainObject } from '@finos/legend-vscode-extension-dependencies';
import { LegendExecutionResult } from '../results/LegendExecutionResult';
import { LegendExecutionResultType } from '../results/LegendExecutionResultType';

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
  context.subscriptions.push(
    workspace.registerNotebookSerializer(
      'legend-book',
      new LegendBookSerializer(),
    ),
  );

  const controller = notebooks.createNotebookController(
    'legend-book-controller-id',
    'legend-book',
    'Legend Notebook',
    executeCells,
  );

  controller.supportedLanguages = [LEGEND_LANGUAGE_ID];
  controller.supportsExecutionOrder = true;
  controller.description = 'Legend Notebook REPL';

  context.subscriptions.push(controller);

  context.subscriptions.push(
    commands.registerCommand('legend.createNotebook', createNotebook),
  );
}

async function executeCells(
  cells: NotebookCell[],
  _document: NotebookDocument,
  controller: NotebookController,
): Promise<void> {
  await Promise.all(cells.map((cell) => executeCell(cell, controller)));
}

let executionOrder = 0;

async function executeCell(
  cell: NotebookCell,
  controller: NotebookController,
): Promise<void> {
  const execution = controller.createNotebookCellExecution(cell);
  execution.executionOrder = ++executionOrder;
  execution.start(Date.now());

  return commands
    .executeCommand(
      LEGEND_COMMAND,
      cell.document.uri.toString(),
      0,
      'notebook_cell',
      'executeCell',
      {},
      {},
    )
    .then(
      (result) => {
        const r = result as PlainObject<LegendExecutionResult>[];
        const funcResult = LegendExecutionResult.serialization.fromJson(r[0]!);

        if (funcResult.type !== LegendExecutionResultType.SUCCESS) {
          execution.replaceOutput([
            new NotebookCellOutput([
              NotebookCellOutputItem.stdout(funcResult.message!),
              NotebookCellOutputItem.stderr(funcResult.logMessage!),
            ]),
          ]);
          execution.end(false, Date.now());
        } else {
          try {
            let output: NotebookCellOutputItem;
            switch (funcResult.messageType) {
              case 'text':
                output = NotebookCellOutputItem.text(funcResult.message);
                break;
              case 'json':
                output = NotebookCellOutputItem.json(
                  JSON.parse(funcResult.message),
                );
                break;
              default:
                output = NotebookCellOutputItem.stderr(
                  `Not supported ${funcResult.messageType}`,
                );
            }

            execution.replaceOutput([new NotebookCellOutput([output])]);
            execution.end(true, Date.now());
          } catch (e) {
            execution.replaceOutput([
              new NotebookCellOutput([
                NotebookCellOutputItem.error(e as Error),
              ]),
            ]);
            execution.end(false, Date.now());
          }
        }
      },
      (error) => {
        execution.replaceOutput([
          new NotebookCellOutput([NotebookCellOutputItem.error(error)]),
        ]);

        execution.end(false, Date.now());
      },
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
