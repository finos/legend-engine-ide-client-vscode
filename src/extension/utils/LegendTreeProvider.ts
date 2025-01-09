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
  type TreeDataProvider,
  EventEmitter,
  type Event,
  TreeItem,
  type ThemeIcon,
  TreeItemCollapsibleState,
  type Command,
} from 'vscode';
import { guaranteeNonNullable } from './AssertionUtils';

export const buildTreeNodeId = (ids: string[]): string => {
  let nodeId = ids[0]!;
  ids.slice(1).forEach((id) => (nodeId = `${nodeId}:${id}`));
  return nodeId;
};

export class TreeNodeData extends TreeItem {
  childrenIds: string[] = [];

  constructor(id: string, label: string, icon: ThemeIcon, command?: Command) {
    super(label);
    this.id = id;
    this.iconPath = icon;
    if (command) {
      this.command = command;
    }
  }

  addChildren(id: string): void {
    this.childrenIds.push(id);
  }
}

export class TreeRootNodeData extends TreeNodeData {}

export class TreeChildNodeData extends TreeNodeData {
  parentId: string;
  constructor(
    parentId: string,
    id: string,
    label: string,
    icon: ThemeIcon,
    command?: Command,
  ) {
    super(id, label, icon, command);
    this.parentId = parentId;
  }
}

export interface TreeData<T extends TreeNodeData> {
  rootIds: string[];
  nodes: Map<string, T>;
}

export class LegendTreeDataProvider implements TreeDataProvider<TreeNodeData> {
  treeData: TreeData<TreeNodeData> = {
    rootIds: [],
    nodes: new Map<string, TreeNodeData>(),
  };

  private _onDidChangeTreeData: EventEmitter<TreeNodeData | undefined | null> =
    new EventEmitter<TreeNodeData | undefined | null>();

  readonly onDidChangeTreeData: Event<TreeNodeData | undefined | null> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeNodeData): TreeNodeData {
    return element;
  }

  getLastTreeNode(): TreeNodeData {
    return Array.from(this.treeData.nodes.values()).pop()!;
  }

  selectTreeItem(nodeId: string): void {
    const node = this.treeData.nodes.get(nodeId);
    if (node) {
      this._onDidChangeTreeData.fire(node);
    }
  }

  resetTreeData(): void {
    this.treeData = {
      rootIds: [],
      nodes: new Map<string, TreeNodeData>(),
    };
  }

  addRootNode(node: TreeRootNodeData): void {
    const nodeId = guaranteeNonNullable(node.id);
    if (this.treeData.nodes.get(nodeId) === undefined) {
      this.treeData.rootIds.push(nodeId);
      this.treeData.nodes.set(nodeId, node);
    }
  }

  updateNodeIcon(id: string, icon: ThemeIcon): void {
    const node = this.treeData.nodes.get(id);
    node!.iconPath = icon;
  }

  addChildNode(node: TreeChildNodeData): void {
    const nodeId = guaranteeNonNullable(node.id);
    if (this.treeData.nodes.get(nodeId) === undefined) {
      const parentNode = this.treeData.nodes.get(node.parentId);
      if (parentNode) {
        parentNode.collapsibleState = TreeItemCollapsibleState.Expanded;
        parentNode.childrenIds.push(nodeId);
        this.treeData.nodes.set(nodeId, node);
      }
    }
  }

  getChildren(element?: TreeNodeData): Thenable<TreeNodeData[]> {
    if (element) {
      const childNodes: TreeNodeData[] = [];
      element.childrenIds.forEach((id) => {
        const treeNode = this.treeData.nodes.get(id);
        if (treeNode) {
          childNodes.push(treeNode);
        }
      });
      return Promise.resolve(childNodes || []);
    } else {
      const nodes: TreeNodeData[] = [];
      this.treeData.rootIds.forEach((id) => {
        const treeNode = this.treeData.nodes.get(id);
        if (treeNode) {
          nodes.push(treeNode);
        }
      });
      return Promise.resolve(nodes);
    }
  }
}
