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
  type Disposable,
  type Event,
  EventEmitter,
  ThemeIcon,
  type TreeDragAndDropController,
  type DataTransfer,
  type TextDocument,
  type Location,
  DataTransferItem,
  type ProviderResult,
} from 'vscode';

import {
  LegendEntitiesRequest,
  type LegendLanguageClient,
} from './LegendLanguageClient';
import {
  type DocumentUri,
  TextDocumentIdentifier,
} from 'vscode-languageclient';
import type { LegendEntity } from './model/LegendEntity';
import { LEGEND_LANGUAGE_ID } from '../shared/utils/Const';

const TREE_ID = 'legendConceptTree';
const MIME_TYPE = `application/vnd.code.tree.${TREE_ID.toLowerCase()}`;

const CMD_CONCEPT_TREE_NAVIGATE = 'legend.conceptTree.navigate';
const CMD_CONCEPT_TREE_REFRESH = 'legend.conceptTree.refresh';
const CMD_CONCEPT_TREE_FOCUS_ELEMENT = 'legend.conceptTree.focusOnElement';
const CMD_CONCEPT_TREE_FOCUS = `${TREE_ID}.focus`;
const CMD_CONCEPT_TREE_SHOW = 'legend.conceptTree.show';

export class LegendConceptTreeItem extends TreeItem {
  constructor(
    private readonly _parent: LegendConceptTreeItem | undefined,
    label: string,
    id: string,
    classifier: string,
    private readonly _location?: Location,
    private _childrenMap: Map<string, LegendConceptTreeItem> = new Map(),
  ) {
    super(
      label,
      classifier === 'package'
        ? TreeItemCollapsibleState.Collapsed
        : TreeItemCollapsibleState.None,
    );

    switch (classifier) {
      case 'package':
        this.contextValue = 'package';
        this.iconPath = new ThemeIcon('symbol-package');
        break;
      case 'meta::pure::metamodel::type::Enumeration':
        this.iconPath = new ThemeIcon('symbol-enum');
        break;
      case 'meta::pure::metamodel::type::Class':
        this.iconPath = new ThemeIcon('symbol-class');
        break;
      case 'meta::pure::metamodel::relationship::Association':
        this.iconPath = new ThemeIcon('symbol-interface');
        break;
      case 'meta::pure::metamodel::function::ConcreteFunctionDefinition':
        this.iconPath = new ThemeIcon('symbol-function');
        break;
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
      default:
        // do nothing
        break;
    }

    this.id = id;
    if (classifier) {
      this.contextValue = classifier;
      this.description = classifier;
    }
    this.tooltip = id;
  }

  public get parent(): LegendConceptTreeItem | undefined {
    return this._parent;
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

export class LegendConceptTreeProvider
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

  readonly dragMimeTypes = [MIME_TYPE, 'text/uri-list'];
  readonly dropMimeTypes = [MIME_TYPE];

  constructor(
    private client: LegendLanguageClient,
    private root: LegendConceptTreeItem = new LegendConceptTreeItem(
      undefined,
      'root',
      'root',
      'package',
    ),
  ) {}

  handleDrag(
    source: readonly LegendConceptTreeItem[],
    dataTransfer: DataTransfer,
  ): void {
    dataTransfer.set(MIME_TYPE, new DataTransferItem(source));
    //dataTransfer.set('text/uri-list', new DataTransferItem(source.map(s => s.id).join(',')));
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
    } else {
      return undefined;
    }
  }

  getParent(
    element: LegendConceptTreeItem,
  ): ProviderResult<LegendConceptTreeItem> {
    return element.parent;
  }

  async refresh(doc?: TextDocument): Promise<void> {
    if (!doc || this.root.childrenMap.size === 0) {
      const entities = await this.client.entities(
        new LegendEntitiesRequest([], []),
      );
      this.root.childrenMap.clear();
      entities
        ?.sort((l, r) => l.path.localeCompare(r.path))
        .forEach((s) => {
          this.addEntity(s);
        });
      this._onDidChangeTreeData.fire();
    } else {
      const docUri = doc.uri.toString();
      const entities = await this.client.entities(
        new LegendEntitiesRequest([TextDocumentIdentifier.create(docUri)], []),
      );
      this.removeEntitiesFrom(new Map(), this.root, docUri);
      entities
        ?.sort((l, r) => l.path.localeCompare(r.path))
        .forEach((s) => {
          this.addEntity(s);
        });
      this._onDidChangeTreeData.fire();
    }
  }

  removeEntitiesFrom(
    parentMap: Map<string, LegendConceptTreeItem>,
    treeItem: LegendConceptTreeItem,
    uri: DocumentUri,
  ): LegendConceptTreeItem | LegendConceptTreeItem[] {
    if (treeItem.location?.uri.toString() === uri) {
      parentMap.delete(treeItem.label! as string);
      return treeItem;
    } else {
      return treeItem
        .children()
        .flatMap((v) => this.removeEntitiesFrom(treeItem.childrenMap, v, uri));
    }
  }

  getConceptsFrom(uri: DocumentUri): LegendConceptTreeItem[] {
    return this.getConceptsFrom_recursive(this.root, uri);
  }

  getConceptsFrom_recursive(
    treeItem: LegendConceptTreeItem,
    uri: DocumentUri,
  ): LegendConceptTreeItem[] {
    if (treeItem.location?.uri.toString() === uri) {
      return [treeItem];
    } else {
      return treeItem
        .children()
        .flatMap((v) => this.getConceptsFrom_recursive(v, uri));
    }
  }

  getTreeItemById(id: string): LegendConceptTreeItem | undefined {
    return this.getTreeItemById_recursive(this.root, id);
  }

  getTreeItemById_recursive(
    treeItem: LegendConceptTreeItem,
    id: string,
  ): LegendConceptTreeItem | undefined {
    if (treeItem.id === id) {
      return treeItem;
    } else {
      return treeItem
        .children()
        .flatMap((v) => this.getTreeItemById_recursive(v, id))
        .find((v) => v !== undefined);
    }
  }

  addEntity(entity: LegendEntity): void {
    const parts = entity.path.split('::');
    const name = parts.pop()!;
    const parentIds = parts.reverse();
    let currParent = this.root;
    while (parentIds.length !== 0) {
      const parentId = parentIds.pop()!;
      if (currParent.childrenMap.has(parentId)) {
        currParent = currParent.childrenMap.get(parentId)!;
      } else {
        const nextParent = new LegendConceptTreeItem(
          currParent,
          parentId,
          currParent.id !== '' ? `${currParent.id}::${parentId}` : parentId,
          'package',
        );
        currParent.childrenMap.set(parentId, nextParent);
        currParent = nextParent;
      }
    }

    const element = new LegendConceptTreeItem(
      currParent,
      name,
      entity.path,
      entity.classifierPath,
      entity.location.toLocation(),
    );
    currParent.childrenMap.set(name, element);
  }
}

export function createLegendConceptTreeProvider(client: LegendLanguageClient): {
  disposables: Disposable[];
  treeDataProvider: LegendConceptTreeProvider;
} {
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
      if (e.document.languageId === LEGEND_LANGUAGE_ID) {
        setTimeout(() => provider.refresh(e.document), 500);
      }
    },
    undefined,
    disposables,
  );

  const navigateRegistration = commands.registerCommand(
    CMD_CONCEPT_TREE_NAVIGATE,
    (node: LegendConceptTreeItem) => {
      const location = node.location;
      if (location) {
        window.showTextDocument(location.uri, { selection: location.range });
      }
    },
  );
  disposables.push(navigateRegistration);

  const refreshRegistration = commands.registerCommand(
    CMD_CONCEPT_TREE_REFRESH,
    () => provider.refresh(),
  );
  disposables.push(refreshRegistration);

  const focusOnElementRegistration = commands.registerCommand(
    CMD_CONCEPT_TREE_FOCUS_ELEMENT,
    () => {
      commands.executeCommand(CMD_CONCEPT_TREE_REFRESH).then(() => {
        if (
          window.activeTextEditor?.document.languageId === LEGEND_LANGUAGE_ID
        ) {
          const cursorPos = window.activeTextEditor.selection.active;
          const conceptAtCursoPos = provider
            .getConceptsFrom(window.activeTextEditor.document.uri.toString())
            .filter((c) => c.location?.range.contains(cursorPos));

          if (conceptAtCursoPos.length > 0) {
            const item = conceptAtCursoPos.at(0)!;
            providerRegistration.reveal(item, { focus: true, select: true });
          }
        }
      });
    },
  );
  disposables.push(focusOnElementRegistration);

  const showRegistration = commands.registerCommand(
    CMD_CONCEPT_TREE_SHOW,
    () => {
      commands
        .executeCommand(CMD_CONCEPT_TREE_FOCUS)
        .then(() => commands.executeCommand(CMD_CONCEPT_TREE_FOCUS_ELEMENT));
    },
  );
  disposables.push(showRegistration);

  return { disposables, treeDataProvider: provider };
}
