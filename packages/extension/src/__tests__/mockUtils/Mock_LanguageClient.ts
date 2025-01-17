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

import { stub } from 'sinon';
import {
  type Event,
  type Extension,
  type ExtensionContext,
  ExtensionMode,
  type GlobalEnvironmentVariableCollection,
  type Memento,
  type SecretStorage,
  type SecretStorageChangeEvent,
  Uri,
  EventEmitter,
  ExtensionKind,
  type EnvironmentVariableCollection,
  type EnvironmentVariableMutator,
  type EnvironmentVariableMutatorOptions,
  type MarkdownString,
  type EnvironmentVariableScope,
  type Webview,
} from 'vscode';

class Mock_Memento implements Memento {
  keys(): readonly string[] {
    throw new Error('Method not implemented.');
  }
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: unknown, defaultValue?: unknown): T | T | undefined {
    throw new Error('Method not implemented.');
  }
  update(key: string, value: unknown): Thenable<void> {
    throw new Error('Method not implemented.');
  }
  setKeysForSync(_keys: string[]): void {}
}

class Mock_SecretStorage implements SecretStorage {
  didChange!: EventEmitter<SecretStorageChangeEvent>;
  constructor() {
    this.didChange = new EventEmitter<SecretStorageChangeEvent>();
    this.onDidChange = this.didChange.event;
  }
  get(key: string): Thenable<string | undefined> {
    throw new Error('Method not implemented.');
  }
  store(key: string, value: string): Thenable<void> {
    throw new Error('Method not implemented.');
  }
  delete(key: string): Thenable<void> {
    throw new Error('Method not implemented.');
  }
  onDidChange: Event<SecretStorageChangeEvent>;
}

class Mock_Extension<T> implements Extension<T> {
  id: string;
  extensionUri: Uri;
  extensionPath: string;
  isActive: boolean;
  packageJSON: unknown;
  extensionKind: ExtensionKind;
  exports: T;
  activate(): Thenable<T> {
    throw new Error('Method not implemented.');
  }

  constructor(type: { new (): T }) {
    this.id = '';
    this.extensionPath = '';
    this.extensionUri = Uri.file(this.extensionPath);
    this.isActive = false;
    this.extensionKind = ExtensionKind.Workspace;
    this.exports = new type();
  }
}

class Mock_EnvironmentVariableCollection
  implements GlobalEnvironmentVariableCollection
{
  persistent: boolean;
  constructor() {
    this.persistent = false;
  }
  getScoped(scope: EnvironmentVariableScope): EnvironmentVariableCollection {
    throw new Error('Method not implemented.');
  }
  description: string | MarkdownString | undefined;
  replace(
    variable: string,
    value: string,
    options?: EnvironmentVariableMutatorOptions | undefined,
  ): void {
    throw new Error('Method not implemented.');
  }
  append(
    variable: string,
    value: string,
    options?: EnvironmentVariableMutatorOptions | undefined,
  ): void {
    throw new Error('Method not implemented.');
  }
  prepend(
    variable: string,
    value: string,
    options?: EnvironmentVariableMutatorOptions | undefined,
  ): void {
    throw new Error('Method not implemented.');
  }
  get(variable: string): EnvironmentVariableMutator | undefined {
    throw new Error('Method not implemented.');
  }
  forEach(
    callback: (
      variable: string,
      mutator: EnvironmentVariableMutator,
      collection: EnvironmentVariableCollection,
    ) => unknown,
    thisArg?: unknown,
  ): void {
    throw new Error('Method not implemented.');
  }
  delete(variable: string): void {
    throw new Error('Method not implemented.');
  }
  clear(): void {
    throw new Error('Method not implemented.');
  }
  [Symbol.iterator](): Iterator<
    [variable: string, mutator: EnvironmentVariableMutator],
    unknown,
    undefined
  > {
    throw new Error('Method not implemented.');
  }
}

class Mock_Class {}

export class Mock_ExecutionContext implements ExtensionContext {
  subscriptions: { dispose(): unknown }[];
  workspaceState: Memento;
  globalState: Memento & { setKeysForSync(keys: readonly string[]): void };
  secrets: SecretStorage;
  extensionUri: Uri;
  extensionPath: string;
  environmentVariableCollection: GlobalEnvironmentVariableCollection;
  asAbsolutePath(relativePath: string): string {
    return relativePath;
  }
  storageUri: Uri | undefined;
  storagePath: string | undefined;
  globalStorageUri: Uri;
  globalStoragePath: string;
  logUri: Uri;
  logPath: string;
  extensionMode: ExtensionMode;
  extension: Extension<unknown>;

  constructor() {
    this.subscriptions = [];
    this.workspaceState = new Mock_Memento();
    this.globalState = new Mock_Memento();
    this.secrets = new Mock_SecretStorage();

    this.extensionPath = '';
    this.storagePath = '';
    this.storagePath = '';
    this.storageUri = Uri.file(this.storagePath);
    this.logPath = '';
    this.logUri = Uri.file(this.logPath);
    this.globalStoragePath = '';
    this.globalStorageUri = Uri.file(this.globalStoragePath);
    this.extensionUri = Uri.file(this.extensionPath);
    this.environmentVariableCollection =
      new Mock_EnvironmentVariableCollection();
    this.extensionMode = ExtensionMode.Test;
    this.extension = new Mock_Extension(Mock_Class);
  }
}

export const Mock_Webview: Webview = {
  onDidReceiveMessage: () => ({ dispose: () => {} }),
  postMessage: stub(),
  html: '',
  options: {},
  asWebviewUri: stub(),
  cspSource: '',
};
