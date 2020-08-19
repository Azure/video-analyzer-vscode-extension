# LVA Graph Topology Editor

## Usage

Install dependencies using `npm install` and then run `npm run create-definitions` to generate static graph definitions.

### Run in Browser for Development

Run `npm run dev` and a new browser window should open with the editor. Changes to files will trigger a rebuild and refresh the browser.

### Run in VS Code

Run `npm run compile` and press <kbd>F5</kbd> in VS Code. Then press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> and run `LVA Graph Topology Editor: Open sample graph in editor` from the menu to see a preview.

## Notes

### Static Definition Files

To avoid redundant recalculation of the list of available nodes shown in the sidebar and the information about each, this information is pre-computed and stored on disk. The definitions are derived from the Swagger JSON for LVA. You should be able to find it in the [azure-rest-api-specs repo](https://github.com/Azure/azure-rest-api-specs/blob/master/specification/mediaservices/data-plane/LiveVideoAnalytics.Edge/preview/1.0/LiveVideoAnalytics.json).

During this pre-computation, two files are generated in the `src/definitions/data` folder: `nodes.json` and `i18n.en.json`. The second file contains all localizable description strings extracted from the node definitions. `nodes.json` only contains placeholders, the descriptions are localized when the editor runs.

If needed (for example when a new version is released), replace `src/definitions/definition.json` with the updated Swagger definition and run `npm run create-definitions` to create the updated pre-computed files. By default, only new values are added to the `i18n.en.json` file. Already localized values are left unchanged. The `nodes.json` file is overwritten each time.

### Type Definitions

`src/data/index.ts` contains type TypeScript definitions automatically generated using [AutoRest](https://github.com/Azure/AutoRest). See [this document](https://microsoft.sharepoint.com/teams/AMSPortalandApplicationsEngineering/_layouts/OneNote.aspx?id=%2Fteams%2FAMSPortalandApplicationsEngineering%2FShared%20Documents%2FGeneral%2FPortal%26SDK&wd=target%28Portal.one%7CFDD0EEF3-EAF9-4ADB-95D0-89F9D3DE36D3%2FUpdate%20Portal%20SDK%20typescripts%7C3AF23385-1893-4B0A-BF51-4F1C396F5C11%2F%29) for more information on how to generate them.

-   Install AutoRest: `npm install -g autorest`
-   Download a copy of [azure-rest-api-specs](https://github.com/Azure/azure-rest-api-specs) (clone or download as ZIP). You can just unzip the needed folder (`LiveVideoAnalytics.Edge`).
-   Navigate into the folder containing the LVA Swagger definition (probably `cd specification/mediaservices/data-plane/LiveVideoAnalytics.Edge/BRANCH/VERSION`),
-   Run `autorest --typescript --input-file="LiveVideoAnalytics.json" --output-folder="output" --generate-metadata --enum-types=true --model-date-time-as-string=true`
-   Open the generated `index.ts` file in `output\src\models` and make the following changes to fix errors:
    -   Remove the import statements
    -   Remove type definitions including references to `msRest.HttpResponse`
    -   Remove `extends ServiceClientOptions`

### Theme

When run in VS Code, the editor will automatically adapt to the user's theme. Avoid using pre-defined colors and try to use `var(--vscode-*)` variables defined by VS Code to theme UI elements.

Since these variables are not available when run in the browser for development mode, variables from the default light theme have been predefined in `public/index.html`.

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
