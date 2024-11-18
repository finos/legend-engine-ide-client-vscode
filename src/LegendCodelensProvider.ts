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

export class LegendCodelensProvider implements CodeLensProvider {
  private client: LegendLanguageClient;
  private codeLenses: CodeLens[] = [];

  constructor(client: LegendLanguageClient) {
    this.client = client;
  }

  private addServiceCodeLens(entity: LegendEntity): void {
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
      new LegendEntitiesRequest([
        TextDocumentIdentifier.create(document.uri.toString()),
      ]),
      _token,
    );
    entities.forEach((entity) => {
      if (
        entity.classifierPath === 'meta::legend::service::metamodel::Service'
      ) {
        this.addServiceCodeLens(entity);
      }
    });
    return this.codeLenses;
  }
}
