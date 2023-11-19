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

import * as path from 'path';
import { workspace, type ExtensionContext, languages } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  Executable,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  languages.setLanguageConfiguration('legend', {
    wordPattern:
      /(-?\d*\.\d\w*)|([^`~!@#%^$&*()\-=+[{\]}\\|;:'",.<>/?\s][^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]*)/,
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
  });

  const serverOptions: Executable = {
    command: 'java',
    args: [
      '-jar',
      context.asAbsolutePath(path.join('jars', 'language-server.jar')),
    ],
  };

  /*	const serverOptions: ServerOptions = {
		run:   { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc }
	};*/

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'legend' }],
    synchronize: { fileEvents: workspace.createFileSystemWatcher('**/*.pure') },
  };

  client = new LanguageClient('Legend', 'Legend', serverOptions, clientOptions);

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
