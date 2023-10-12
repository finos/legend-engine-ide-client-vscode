

import * as path from 'path';
import { workspace, ExtensionContext, languages } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
	Executable
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {

	languages.setLanguageConfiguration('legend', {
		wordPattern: /(-?\d*\.\d\w*)|([^`~!@#%^$&*()\-=+[{\]}\\|;:'",.<>/?\s][^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]*)/,
		comments: {
			lineComment: '//',
			blockComment: ['/*', '*/']
		}
	});

	const serverOptions: Executable = {
		command: 'java', 
		args: [ '-jar', context.asAbsolutePath(path.join('jars','language-server.jar'))]
	};

/*	const serverOptions: ServerOptions = {
		run:   { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc }
	};*/

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'legend' }],
		synchronize: { fileEvents: workspace.createFileSystemWatcher('**/*.pure')
		}
	};

	client = new LanguageClient(
		'Legend',
		'Legend',
		serverOptions,
		clientOptions
	);

	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}