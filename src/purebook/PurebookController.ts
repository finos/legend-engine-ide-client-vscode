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
  commands,
  type NotebookCell,
  type NotebookDocument,
  NotebookCellOutput,
  NotebookCellOutputItem,
  type NotebookController,
  notebooks,
} from 'vscode';
import { LEGEND_COMMAND_V2, LEGEND_LANGUAGE_ID } from '../utils/Const';
import { LegendExecutionResult } from '../results/LegendExecutionResult';
import { type PlainObject } from '../utils/SerializationUtils';
import { LegendExecutionResultType } from '../results/LegendExecutionResultType';
import { withCancellationSupport } from '../utils/cancellationSupport';

export class PurebookController {
  readonly controllerId = 'legend-book-controller-id';
  readonly notebookType = 'legend-book';
  readonly label = 'Legend Notebook';
  readonly supportedLanguages = [LEGEND_LANGUAGE_ID];
  readonly description = 'Legend Notebook REPL';

  private readonly _controller: NotebookController;
  private _executionOrder = 0;

  constructor() {
    this._controller = notebooks.createNotebookController(
      this.controllerId,
      this.notebookType,
      this.label,
    );

    this._controller.supportedLanguages = this.supportedLanguages;
    this._controller.supportsExecutionOrder = true;
    this._controller.description = this.description;
    this._controller.executeHandler = this.executeCells.bind(this);
  }

  dispose = (): void => {};

  executeCells = async (
    cells: NotebookCell[],
    _document: NotebookDocument,
    controller: NotebookController,
  ): Promise<void> =>
    cells.reduce(
      (prev, cell) => prev.then(() => this.executeCell(cell, controller)),
      Promise.resolve(),
    );

  executeCell = async (
    cell: NotebookCell,
    controller: NotebookController,
  ): Promise<void> => {
    const execution = controller.createNotebookCellExecution(cell);
    execution.executionOrder = ++this._executionOrder;
    execution.start(Date.now());

    const requestId = withCancellationSupport(execution.token, () => {
      execution.replaceOutput(
        new NotebookCellOutput([
          NotebookCellOutputItem.stdout('Execution canceled!'),
        ]),
      );
      execution.end(undefined, Date.now());
    });

    return commands
      .executeCommand(
        LEGEND_COMMAND_V2,
        requestId,
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
          const funcResult = LegendExecutionResult.serialization.fromJson(
            r[0]!,
          );

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
              let output: NotebookCellOutputItem[];
              switch (funcResult.messageType) {
                case 'text':
                  output = [NotebookCellOutputItem.text(funcResult.message)];
                  break;
                case 'json':
                  output = [
                    NotebookCellOutputItem.json(JSON.parse(funcResult.message)),
                  ];
                  break;
                case 'cube':
                  output = [
                    NotebookCellOutputItem.json(
                      JSON.parse(funcResult.message),
                      'application/legend-relational-result',
                    ),
                  ];
                  break;
                default:
                  output = [
                    NotebookCellOutputItem.stderr(
                      `Not supported ${funcResult.messageType}`,
                    ),
                  ];
              }

              execution.replaceOutput([new NotebookCellOutput(output)]);
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
          if (!execution.token.isCancellationRequested) {
            execution.replaceOutput([
              new NotebookCellOutput([NotebookCellOutputItem.error(error)]),
            ]);

            execution.end(false, Date.now());
          } else {
            execution.replaceOutput(
              new NotebookCellOutput([
                NotebookCellOutputItem.stdout('Execution canceled!'),
              ]),
            );
            execution.end(undefined, Date.now());
          }
        },
      );
  };
}
