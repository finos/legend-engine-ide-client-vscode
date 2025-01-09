<img src="https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-incubating.png" width="150"/>

![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/FINOS.legend-engine-ide-client-vscode.png?label=Visual%20Studio%20Marketplace)
![Open VSX Marketplace](https://img.shields.io/open-vsx/v/finos/legend-engine-ide-client-vscode.png?label=Open%20VSX%20Marketplace)

The **_Legend VSCode_** extension provides an easy and quick way to develop using _Legend_ data modeling language.

An overview of the language can be found [here](https://legend.finos.org/docs/overview/legend-overview).

This extension leverages the [Legend LSP server](https://github.com/finos/legend-engine-ide-lsp).

For more things _Legend_, visit our GitHub [here](https://github.com/finos/legend).

## Available Features

- Parse and Compile
- Code navigation (goTo, find usage)
- Execute functions (through CodeLens commands)
- DataCube vizualization for tabular results
- Testing integration
- Legend Concept Tree
- Snippets for common element types
- Legend REPL Terminal
- Diagram vizualization

### Hello World

![Hello World](docs/demo.gif)

To start using the extension, create a `hello.pure` file in your workspace, and copy/paste the content of one of our showcases

- Relational Database Showcase (using in-memory H2) - https://raw.githubusercontent.com/finos/legend-studio/master/packages/legend-server-showcase-deployment/data/showcases/Stores/Relational%20Database/Mapping/code.pure
- Model to Model transformation (consume JSON input, transform to new model) - https://raw.githubusercontent.com/finos/legend-studio/master/packages/legend-server-showcase-deployment/data/showcases/Stores/Model%20Store/Mapping/code.pure

## Contributing

Please read our [contributing guide](./CONTRIBUTING.md).

## Project Structure

The project is structured into 3 main parts within the `src` directory:

- `extension`: This directory contains code that runs exclusively on the extension host and interacts directly with the VS Code APIs. Nothing in this directory should import anything from `@finos/legend-vscode-extension-dependencies` unless it is simply a `type` import, as doing so will cause the webpack bundling to break, since components from the `@finos/legend-vscode-extension-dependencies` library require polyfills that we don't provide when bundling the extension code.
- `client`: This directory contains code that runs within iframes in VS Code. Most of the core UI logic lives here, and all the components that we import from `@finos/legend-vscode-extension-dependencies` are implemented here. You can safely import from `@finos/legend-vscode-extension-dependencies` in this directory.
- `shared`: This directory contains code that is shared between the `extension` and `client` directories. Because code here is used within the `extension` directory, nothing in the `shared` directory should import anything from `@finos/legend-vscode-extension-dependencies` unless it is simply a `type` import.

## License

Copyright 2020 Goldman Sachs

Distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: [Apache-2.0](https://spdx.org/licenses/Apache-2.0)
