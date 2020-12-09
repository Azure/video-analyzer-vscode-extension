# LVA Edge Graph Extension for VS Code

Live Video Analytics on IoT Edge (LVA Edge) support for Visual Studio Code is provided through this extension that makes it easy to edit and manage LVA Edge graph deployments.

## Suggested Pre-reading
* [Live Video Analytics on IoT Edge overview](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/overview)
* [Live Video Analytics on IoT Edge terminology](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/terminology)

## Prerequisites
* An Azure account that has an active subscription.
    * [Create an account](https://azure.microsoft.com/free/) for free if you don't already have one.
* [Azure IoT Tools extension](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools)
* This extension also requires the following Azure resources:
    * **IoT Hub**
    * **Storage account**
    * **Azure Media Services account**
    * A Linux VM in Azure, with [IoT Edge runtime](https://docs.microsoft.com/azure/iot-edge/how-to-install-iot-edge) installed which will act as an **IoT Edge device**
    * **IoT Edge modules** deployed to the IoT Edge device
        * edgeAgent
        * edgeHub
        * Live Video Analytics agent

## Usage

Ensure you can access internal resources with `npm run refreshVSToken`, then install the dependencies using `npm install`.
### Run in VS Code

Run `npm run compile` and press <kbd>F5</kbd> in VS Code. You should see the extension in the bottom right, expand it if needed.

> [!NOTE]
> On first run, you need to connect to an Azure IoT Hub using a connection string. You can then manage graph topologies and instances on the chosen device. You can get a connection string by following the instructions in the [Quickstart](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/get-started-detect-motion-emit-events-quickstart). Follow the steps up until *Configure the Azure IoT Tools extension* and use the connection string in this extension instead of Azure IoT Tools.
## Setup LVA edge graph extension

After successfully installing this extension and its prerequisites, you can follow the steps below to get started with Live Video on Analytics on IoT Edge devices.
### Connect to the IoT Hub
You will need to use the IoT Hub connection string to connect this extension to it.
1. In Explorer of VS Code, click the "Live Video Analytics" extension in the left pane.
1. Click on **"Enter Connection String"** button
    1. Enter the Iot Hub Connection string that you want use (It is one-time configuration, and please make sure it is IoT Hub Connection String and not Device Connection String. The format is **`HostName=<my-hub>.azure-devices.net;SharedAccessKeyName=<my-policy>;SharedAccessKey=<my-policy-key>`**)
1. The device list will be shown
    1. Choose the device you want to use to deploy the media graphs
1. A list of modules that are already deployed to the device will be displayed
    1. Choose the Live Video Analytics module from the list
1. Open the VS Code Explorer or press `Ctrl`+ `Shift` + `E` and search for the Azure IoT hub extension at the bottom left pane
1. Pull up the extension and find the IoT Hub
1. Right click the `...` button and select "**Start Monitoring Built-in Event Endpoint**" option

### Create Graph Topologies
1. Expand the Devices, Modules and the Live Video Analytics module nodes in the left pane
1. Click the `+` icon next to "**Graph Topologies**"
1. A panel will open on the right that will help you in creating a graph topology
1. You will start by providing a "**Topology name**"
1. You can either create a new topology by dragging and dropping the topology components available in the left panel
1. Or, you can try out some sample topologies that we have created by clicking the "**Try sample topologies**" in the top menu bar
1. Once you are done creating the topology and providing values for the required fields, save the topology by clicking the "**Save**" button
1. You should then see the topology name in the left pane

### Activate Graph Instances
1. Once a graph topology is created, you will then create an instance of the topology
    1. Here you will provide the values to the graph instance parameters
1. Once all the required parameters are filled in, you can "**Save**" the instance and activate it later or "**Save and activate**" the graph instance
1. Once the graph is activated, you will see a green icon next to the graph instance name
1. Open the Output console by pressing `Ctrl`+ `Shift` + `U` and observe the IoT Hub messages start flowing

### Run in Browser for Development

Run `npm run dev` and a new browser window should open with the editor. Changes to files will trigger a rebuild and refresh the browser. This view will only show the topology editor. To test all functionality, you need to run the actual extension as explained above.

## Notes

### Static Definition Files

To avoid redundant recalculation of the list of available nodes shown in the sidebar and the information about each, this information is pre-computed and stored on disk. The definitions are derived from the Swagger JSON for LVA. You should be able to find it in the [azure-rest-api-specs repo](https://github.com/Azure/azure-rest-api-specs/blob/master/specification/mediaservices/data-plane/LiveVideoAnalytics.Edge/preview/1.0/LiveVideoAnalytics.json).

During this pre-computation, two files are generated in the `src/definitions/data` folder: `nodes.json` and `i18n.en.json`. The second file contains all localizable description strings extracted from the node definitions. `nodes.json` only contains placeholders, the descriptions are localized when the editor runs.

If needed (for example when a new version is released), create a new folder in `tools/definition-generator` for the version you are introducing. Add a `LiveVideoAnalytics.json` file with the updated Swagger definitions and a list `usableNodes.json`. Update `tools/definition-generator/entry.ts` with the version you are targeting and run `npm run create-definitions` to create the a new set of pre-computed files.

Only new values are added to the `i18n.en.json` file. Already localized values are left unchanged. To regenerate this file from scratch, delete it and rerun the definition generator. You can also regenerate specific keys by deleting them from the file and running the command. The `nodes.json` file is overwritten each time.

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

When run in VS Code, the editor will automatically adapt to the user's theme. Avoid using pre-defined colors and try to use `var(--vscode-*)` CSS variables defined by VS Code to theme UI elements. You can also add new variables scoped to the user's theme kind (light, dark, high contrast) in `App.css`.

Since the VS Code theme variables are not available when run in the browser for development mode, variables from the default light theme have been predefined in `public/index.html`.

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit [https://cla.opensource.microsoft.com](https://cla.opensource.microsoft.com).

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repositories using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
