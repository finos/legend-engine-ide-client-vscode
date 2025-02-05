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

import {
  type CancellationToken,
  type CodeLensProvider,
  type TextDocument,
  CodeLens,
  Range,
} from 'vscode';
import {
  type LegendLanguageClient,
  LegendEntitiesRequest,
} from './LegendLanguageClient';
import { TextDocumentIdentifier } from 'vscode-languageclient';
import { type LegendEntity } from './model/LegendEntity';
import {
  ACTIVATE_FUNCTION_ID,
  CLASSIFIER_PATH,
  EXEC_FUNCTION_ID,
  LEGEND_SHOW_DIAGRAM_CODELENS,
  type TextLocation,
} from '@finos/legend-engine-ide-client-vscode-shared';

export class LegendCodelensProvider implements CodeLensProvider {
  private client: LegendLanguageClient;
  private codeLenses: CodeLens[] = [];

  constructor(client: LegendLanguageClient) {
    this.client = client;
  }

  private addActivateFunctionCodeLens(entityLocation: TextLocation): void {
    this.codeLenses.push(
      new CodeLens(
        new Range(
          entityLocation.textInterval.start.line,
          entityLocation.textInterval.start.column,
          entityLocation.textInterval.end.line,
          entityLocation.textInterval.end.column,
        ),
        {
          title: 'Activate',
          command: ACTIVATE_FUNCTION_ID,
          arguments: [entityLocation],
        },
      ),
    );
  }

  private addExecuteFunctionCodeLens(entityLocation: TextLocation): void {
    this.codeLenses.push(
      new CodeLens(
        new Range(
          entityLocation.textInterval.start.line,
          entityLocation.textInterval.start.column,
          entityLocation.textInterval.end.line,
          entityLocation.textInterval.end.column,
        ),
        {
          title: 'Execute',
          command: EXEC_FUNCTION_ID,
          arguments: [entityLocation],
        },
      ),
    );
  }

  private addViewEditDiagramCodeLens(entity: LegendEntity): void {
    this.codeLenses.push(
      new CodeLens(
        new Range(
          entity.location.textInterval.start.line,
          entity.location.textInterval.start.column,
          entity.location.textInterval.end.line,
          entity.location.textInterval.end.column,
        ),
        {
          title: 'View/Edit Diagram',
          command: LEGEND_SHOW_DIAGRAM_CODELENS,
          arguments: [entity],
        },
      ),
    );
  }

  private addQueryBuilderCodeLens(entity: LegendEntity): void {
    this.codeLenses.push(
      new CodeLens(
        new Range(
          entity.location.textInterval.start.line,
          entity.location.textInterval.start.column,
          entity.location.textInterval.end.line,
          entity.location.textInterval.end.column,
        ),
        {
          title: 'Edit/Execute in QueryBuilder',
          command: 'legend.editInQueryBuilder',
          arguments: [entity, 'codelens'],
        },
      ),
    );
  }

  public async provideCodeLenses(
    document: TextDocument,
    _token: CancellationToken,
  ): Promise<CodeLens[]> {
    this.codeLenses = [];
    const entities = await this.client.entities(
      new LegendEntitiesRequest(
        [TextDocumentIdentifier.create(document.uri.toString())],
        [],
      ),
      _token,
    );
    entities.forEach((entity) => {
      if (entity.classifierPath === CLASSIFIER_PATH.SERVICE) {
        this.addExecuteFunctionCodeLens(entity.location);
        this.addQueryBuilderCodeLens(entity);
      }
      if (entity.classifierPath === CLASSIFIER_PATH.FUNCTION) {
        this.addActivateFunctionCodeLens(entity.location);
        this.addExecuteFunctionCodeLens(entity.location);
        this.addQueryBuilderCodeLens(entity);
      }
      if (entity.classifierPath === CLASSIFIER_PATH.DIAGRAM) {
        this.addViewEditDiagramCodeLens(entity);
      }
    });
    return this.codeLenses;
  }
}
