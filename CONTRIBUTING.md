# Contributing

Thank you so much for being interested in contributing to our project! Before submitting your contribution, please read the following guidelines.

## Initial project setup

1. Ensure you have `yarn` setup on your machine (see more details [here](https://yarnpkg.com/getting-started/install))
2. Run `yarn install` to install dependencies.
3. Run `yarn bundle` to bundle all the code in the `shared` package for use in the `client` and `extension` packages.
4. Run `yarn mvn:prepare` to collect necessary build artifacts (download the LSP jars, etc.).

## How to debug the VSCode extension during development

1. Make necessary changes to the code.
    - If you changed any code in the `shared` package, make sure to run `yarn bundle` again.
2. If there are new versions of the LSP jars you need to use, make sure to run `yarn mvn:prepare` again.
3. Run `yarn webpack` to generate the output files for running the extension.
4. Navigate to `packages/extension/dist/extension.js` and press `F5` in your VSCode IDE to launch a debugging session of the extension. Ensure that your VSCode IDE is using the [launch.json](.vscode/launch.json) file provided in the repo.

> Note that `extension.js` must be opened in the active editor, else VSCode will not be able to find the extension to debug

> Alternatively, you can use the `Run and Debug` menu in VSCode, ensure the `Launch Legend Extension` configuration is selected, and click the `Start Debugging` button.

> If the extension errors out related to `storageUri.fsPath`, make sure in the debug workspace, open a folder: _the above error usually happens the first time debug is on and no workspace folder is specified._

5. You can now [place breakpoints](https://code.visualstudio.com/api/get-started/your-first-extension#debugging-the-extension) on any code in the `extension` package..

> Any `console.log` will output in `DEBUG CONSOLE` tab in VSCode; while runtime log message will be output to corresponding channels in the debugger instance.

> Any `console.log` from the files in the `client` package will show up in the Developer Tools console. Go to Help > Toggle Developer Tools in the VS Code menu to open the developer tools.

6. If you make changes to the code, rerun `yarn webpack` and restart the debugger to have the changes in effect.

## Project Structure

The project is structured into 3 packages within the repo:

- [extension](packages/extension): This package contains code that runs exclusively on the extension host and interacts directly with the VS Code APIs. Nothing in this directory should import anything from [@finos/legend-vscode-extension-dependencies](https://github.com/finos/legend-studio/tree/master/packages/legend-vscode-extension-dependencies) unless it is simply a `type` import, as doing so will cause the webpack bundling to break, since components from the [@finos/legend-vscode-extension-dependencies](https://github.com/finos/legend-studio/tree/master/packages/legend-vscode-extension-dependencies) library require polyfills that we don't provide when bundling the extension code.
- [client](packages/client): This package contains code that runs within iframes in VS Code. Most of the core UI logic lives here, and all the components that we import from [@finos/legend-vscode-extension-dependencies](https://github.com/finos/legend-studio/tree/master/packages/legend-vscode-extension-dependencies) are implemented here. You can safely import from [@finos/legend-vscode-extension-dependencies](https://github.com/finos/legend-studio/tree/master/packages/legend-vscode-extension-dependencies) in this directory.
- [shared](packages/shared): This package contains code that is shared between the [extension](packages/extension) and [client](packages/client) packages. Because code here is used within the [extension](packages/extension) package, nothing in the [shared](packages/shared) package should import anything from [@finos/legend-vscode-extension-dependencies](https://github.com/finos/legend-studio/tree/master/packages/legend-vscode-extension-dependencies) unless it is simply a `type` import.
