# Contributing

Thank you so much for being interested in contributing to our project! Before submitting your contribution, please read the following guidelines.

## How to debug the VSCode extension during development

1. Making necessary changes to the code
2. Run the following command to collect necessary build artifacts (download the LSP jars, etc.) and generate the `vsix` extension file

> You should only need to run this when there are changes to the setup, such as there are new versions of the LSP jars.

```sh
npm run dev:setup
```

3. Run the following script to re-compile code on changes

```sh
npm run dev
```

4. Hit `F5` when opening `extension.ts` file

> Note that this file must be opened in the active editor, else VSCode will not be able to find the extension to debug

> If the extension errors out related to `storageUri.fsPath`, make sure in the debug workspace, open a folder: _the above error usually happens the first time debug is on and no workspace folder is specified._

5. You can now [place breakpoints](https://code.visualstudio.com/api/get-started/your-first-extension#debugging-the-extension).

> Any `console.log` will output in `DEBUG CONSOLE` tab in VSCode; while runtime log message will be output to corresponding channels in the debugger instance.

6. If you make changes to the code, restart the debugger to have the changes in effect.
