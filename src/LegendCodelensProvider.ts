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
import { CLASSIFIER_PATH } from './utils/Const';

export class LegendCodelensProvider implements CodeLensProvider {
  private client: LegendLanguageClient;
  private codeLenses: CodeLens[] = [];

  constructor(client: LegendLanguageClient) {
    this.client = client;
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
      if (
        entity.classifierPath === CLASSIFIER_PATH.SERVICE ||
        entity.classifierPath === CLASSIFIER_PATH.FUNCTION
      ) {
        this.addQueryBuilderCodeLens(entity);
      }
    });
    return this.codeLenses;
  }
}
