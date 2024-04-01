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
  type TreeDataProvider,
  commands,
  workspace,
  TreeItemCollapsibleState,
  TreeItem,
  window,
  Disposable,
  Event,
  EventEmitter,
  ThemeIcon,
  TreeDragAndDropController,
  DataTransfer,
  TextDocument,
  Uri,
  Location,
  DataTransferItem,
  SymbolKind,
  DocumentSymbol as VSCodeDocumentSymbol,
  SymbolInformation as VSCodeSymbolInformation,
} from 'vscode';

import { LegendLanguageClient } from './LegendLanguageClient';
import {
  DocumentSymbolRequest,
  DocumentSymbol,
  TextDocumentIdentifier,
  WorkspaceSymbolRequest,
  WorkspaceSymbol,
} from 'vscode-languageclient';

const TREE_ID = 'legendConceptTree';
const MIME_TYPE = 'application/vnd.code.tree.' + TREE_ID.toLowerCase();

type LegendWorkspaceSymbol = Omit<WorkspaceSymbol, 'data'> & {
  data: { classifier?: string };
};

class LegendConceptTreeProvider
  implements
    TreeDataProvider<LegendConceptTreeItem>,
    TreeDragAndDropController<LegendConceptTreeItem>
{
  readonly _onDidChangeTreeData = new EventEmitter<
    LegendConceptTreeItem | LegendConceptTreeItem[] | void
  >();
  readonly onDidChangeTreeData: Event<
    LegendConceptTreeItem | LegendConceptTreeItem[] | void
  > = this._onDidChangeTreeData.event;

  readonly dragMimeTypes = [MIME_TYPE];
  readonly dropMimeTypes = [];

  constructor(
    private client: LegendLanguageClient,
    private root: LegendConceptTreeItem = new LegendConceptTreeItem(
      'root',
      'root',
      SymbolKind.Package,
    ),
  ) {}

  handleDrag(
    source: readonly LegendConceptTreeItem[],
    dataTransfer: DataTransfer,
  ): void {
    dataTransfer.set(MIME_TYPE, new DataTransferItem(source));
  }

  getTreeItem(element: LegendConceptTreeItem): TreeItem {
    return element;
  }

  getChildren(
    element?: LegendConceptTreeItem,
  ): LegendConceptTreeItem[] | undefined {
    if (element) {
      return element.children();
    } else if (this.root.childrenMap.size !== 0) {
      return this.root.children();
    }
  }

  refresh(doc?: TextDocument) {
    if (!doc || this.root.childrenMap.size === 0) {
      this.client
        .sendRequest<LegendWorkspaceSymbol[]>(WorkspaceSymbolRequest.method, {
          query: '',
        })
        .then((x) => {
          this.root.childrenMap.clear();
          x
            ?.sort((l, r) => l.name.localeCompare(r.name))
            .forEach((s) => {
              this.addSymbol(this.client.protocol2CodeConverter.asSymbolInformation(s), s.data.classifier);
            });
          this._onDidChangeTreeData.fire();
        });
    } else {
      this.removeSymbolsFrom(new Map(), this.root, doc.uri);
      this.client
        .sendRequest<DocumentSymbol[]>(DocumentSymbolRequest.method, {
          textDocument: TextDocumentIdentifier.create(doc.uri.toString()),
        })
        .then((x) => {
          x
            ?.sort((l, r) => l.name.localeCompare(r.name))
            .forEach((s) => this.addDocumentSymbol(doc.uri, this.client.protocol2CodeConverter.asDocumentSymbol(s)), this);
          this._onDidChangeTreeData.fire();
        });
    }
  }

  removeSymbolsFrom(
    parentMap: Map<string, LegendConceptTreeItem>,
    treeItem: LegendConceptTreeItem,
    uri: Uri,
  ): LegendConceptTreeItem | LegendConceptTreeItem[] {
    if (treeItem.location?.uri.toString() === uri.toString()) {
      parentMap.delete(treeItem.label! as string);
      return treeItem;
    } else {
      return treeItem
        .children()
        .flatMap((v) => this.removeSymbolsFrom(treeItem.childrenMap, v, uri));
    }
  }

  addDocumentSymbol(docUri: Uri, s: VSCodeDocumentSymbol): void {
    this.addSymbol(
      new VSCodeSymbolInformation(s.name, s.kind, '', new Location(docUri, s.range)),
      s.detail,
    );
    s.children?.forEach((x) => this.addDocumentSymbol(docUri, x));
  }

  addSymbol(s: VSCodeSymbolInformation, description?: string): void {
    const parts = s.name.split('::');
    const name = parts.pop()!;
    const parentIds = parts.reverse();
    let currParent = this.root;
    while (parentIds.length !== 0) {
      const parentId = parentIds.pop()!;
      if (currParent.childrenMap.has(parentId)) {
        currParent = currParent.childrenMap.get(parentId)!;
      } else {
        const nextParent = new LegendConceptTreeItem(
          parentId,
          currParent.id !== '' ? currParent.id + '::' + parentId : parentId,
          SymbolKind.Package,
        );
        currParent.childrenMap.set(parentId, nextParent);
        currParent = nextParent;
      }
    }

    if (!name.includes('.')) {
      const element = new LegendConceptTreeItem(
        name,
        s.name,
        s.kind,
        description,
        s.location,
      );
      currParent.childrenMap.set(name, element);
    } else {
      const nameParts = name.split('.');
      const propertyName = nameParts.pop()!;
      const nameParentParts = nameParts.reverse();
      while (nameParentParts.length !== 0) {
        const nameParent = nameParentParts.pop()!;
        if (currParent.childrenMap.has(nameParent)) {
          currParent = currParent.childrenMap.get(nameParent)!;
        } else {
          this.client.error(
            `unabla to find concept parent for '${s.name}' among: ${currParent
              .children()
              .map((x) => x.id)
              .join(', ')}`,
          );
          return;
        }
      }
      currParent.collapsibleState = TreeItemCollapsibleState.Collapsed;
      currParent.childrenMap.set(
        propertyName,
        new LegendConceptTreeItem(
          propertyName,
          s.name,
          s.kind,
          description,
          s.location,
        ),
      );
    }
  }
}

class LegendConceptTreeItem extends TreeItem {
  constructor(
    label: string,
    id: string,
    kind: SymbolKind,
    classifier?: string | undefined,
    private readonly _location?: Location,
    private _childrenMap: Map<string, LegendConceptTreeItem> = new Map(),
  ) {
    super(
      label,
      kind == SymbolKind.Package
        ? TreeItemCollapsibleState.Collapsed
        : TreeItemCollapsibleState.None,
    );

    switch (kind) {
      case SymbolKind.Package:
        this.contextValue = 'package';
        this.iconPath = new ThemeIcon('symbol-package');
        break;
      case SymbolKind.Enum:
        this.iconPath = new ThemeIcon('symbol-enum');
        break;
      case SymbolKind.EnumMember:
        this.iconPath = new ThemeIcon('symbol-enum-member');
        break;
      case SymbolKind.Class:
        this.iconPath = new ThemeIcon('symbol-class');
        break;
      case SymbolKind.Interface:
        this.iconPath = new ThemeIcon('symbol-interface');
        break;
      case SymbolKind.Function:
        this.iconPath = new ThemeIcon('symbol-function');
        break;
      case SymbolKind.Property:
        this.iconPath = new ThemeIcon('symbol-property');
        break;
      case SymbolKind.Field:
        this.iconPath = new ThemeIcon('symbol-field');
        break;
      case SymbolKind.Method:
        this.iconPath = new ThemeIcon('symbol-method');
        break;
      default:
        this.contextValue = 'struct';
        switch (classifier) {
          case 'meta::pure::mapping::Mapping':
            this.iconPath = new ThemeIcon('compass-active');
            break;
          case 'meta::relational::metamodel::Database':
            this.iconPath = new ThemeIcon('database');
            break;
          case 'meta::relational::metamodel::Schema':
            this.iconPath = new ThemeIcon('multiple-windows');
            break;
          case 'meta::relational::metamodel::relation::Table':
            this.iconPath = new ThemeIcon('window');
            break;
          case 'meta::relational::metamodel::Column':
            this.iconPath = new ThemeIcon('layout-centered');
            break;
          case 'meta::relational::metamodel::Filter':
            this.iconPath = new ThemeIcon('filter');
            break;
          case 'meta::relational::metamodel::join::Join':
            this.iconPath = new ThemeIcon('merge');
            break;
          case 'meta::pure::metamodel::diagram::Diagram':
            this.iconPath = new ThemeIcon('circuit-board');
            break;
          case 'meta::external::function::activator::hostedService::HostedService':
          case 'meta::external::function::activator::snowflakeApp::SnowflakeApp':
            this.iconPath = new ThemeIcon('zap');
            break;
        }
    }

    this.id = id;
    if (classifier) {
      this.contextValue = classifier;
      this.description = classifier;
    }
    this.tooltip = id;
  }

  public get location(): Location | undefined {
    return this._location;
  }

  public get childrenMap(): Map<string, LegendConceptTreeItem> {
    return this._childrenMap;
  }

  public children(): LegendConceptTreeItem[] {
    return Array.from(this._childrenMap.values()).sort((a, b) =>
      (a.label as string).localeCompare(b.label as string),
    );
  }
}

export function createLegendConceptTreeProvider(
  client: LegendLanguageClient,
): Disposable[] {
  const provider = new LegendConceptTreeProvider(client);
  const providerRegistration = window.createTreeView(TREE_ID, {
    treeDataProvider: provider,
    dragAndDropController: provider,
    canSelectMany: true,
  });

  const disposables: Disposable[] = [providerRegistration];

  // delayed by 500ms to allow language server to ack the change
  // before we request a refresh of concepts
  workspace.onDidChangeTextDocument(
    (e) => {
      if (e.document.uri.path.endsWith('.pure')) {
        setTimeout(() => {
          return provider.refresh(e.document);
        }, 500);
      }
    },
    undefined,
    disposables,
  );

  const navigateRegistration = commands.registerCommand(
    'legend.conceptTree.navigate',
    (node: LegendConceptTreeItem) => {
      const location = node.location;
      if (location) {
        window.showTextDocument(
          location.uri,
          { selection: location.range, },
        );
      }
    },
  );
  disposables.push(navigateRegistration);

  const refreshRegistration = commands.registerCommand(
    'legend.conceptTree.refresh',
    () => provider.refresh(),
  );
  disposables.push(refreshRegistration);

  return disposables;
}
