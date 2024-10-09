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
  CancellationToken,
  commands,
  ExtensionContext,
  NotebookCell,
  NotebookCellData,
  NotebookCellKind,
  NotebookCellOutput,
  NotebookCellOutputItem,
  NotebookController,
  NotebookData,
  NotebookDocument,
  notebooks,
  NotebookSerializer,
  workspace,
} from 'vscode';
import { LEGEND_COMMAND, LEGEND_LANGUAGE_ID } from '../utils/Const';
import { PlainObject } from '@finos/legend-vscode-extension-dependencies';
import { LegendExecutionResult } from '../results/LegendExecutionResult';
import { LegendExecutionResultType } from '../results/LegendExecutionResultType';

export function enableLegendBook(context: ExtensionContext) {
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
    (cells, _document, controller) => executeCells(cells, controller),
  );

  context.subscriptions.push(controller);
}

interface RawNotebookCell {
  source: string[];
  cell_type: 'code' | 'markdown';
}

class LegendBookSerializer implements NotebookSerializer {
  async deserializeNotebook(
    content: Uint8Array,
    _token: CancellationToken,
  ): Promise<NotebookData> {
    var contents = new TextDecoder().decode(content);

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
    let contents: RawNotebookCell[] = [];

    for (const cell of data.cells) {
      contents.push({
        cell_type: cell.kind === NotebookCellKind.Code ? 'code' : 'markdown',
        source: cell.value.split(/\r?\n/g),
      });
    }

    return new TextEncoder().encode(JSON.stringify(contents, undefined, 1));
  }
}

async function executeCells(
  cells: NotebookCell[],
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
            execution.replaceOutput([
              new NotebookCellOutput([
                NotebookCellOutputItem.json(JSON.parse(funcResult.message)),
              ]),
            ]);
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
