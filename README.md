# LVA Edge Graph Extension for VS Code

⚠️ _This extension has been deprecated. Please use our updated extension instead: [Azure Video Analyzer](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.azure-video-analyzer)_

Live Video Analytics on IoT Edge (LVA Edge) support for Visual Studio Code is provided through this extension that makes it easy to edit and manage LVA Edge media graphs.

# What's New (v0.1.3)

## Added

-   Added a deprecation notice when the extension is activated

# What's New (v0.1.2)

## Changed

-   Fixed a bug, where manually adding parameters is causing failures saving a graph
-   Fixed bug when changing orientation on the graph
-   Allowing negative values for some properties

# What's New (v0.1.1)

## Changed

-   Fixed a bug, where node name updates was affecting other nodes with same name

# What's New (v0.1.0)

## Added

-   Create and manage LVA Edge 2.0.0 module media graphs

## Suggested Pre-reading

-   [Live Video Analytics on IoT Edge overview](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/overview)
-   [Live Video Analytics on IoT Edge terminology](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/terminology)

## Prerequisites

-   An Azure account that has an active subscription.
    -   [Create an account](https://azure.microsoft.com/free/) for free if you don't already have one.
-   [Azure IoT Tools extension](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools)
-   This extension also requires the following Azure resources:
    -   **IoT Hub**
    -   **Storage account**
    -   **Azure Media Services account**
    -   A Linux VM in Azure, with [IoT Edge runtime](https://docs.microsoft.com/azure/iot-edge/how-to-install-iot-edge) installed which will act as an **IoT Edge device**
    -   **IoT Edge modules** deployed to the IoT Edge device
        -   edgeAgent
        -   edgeHub
        -   Live Video Analytics agent

> On first run, you need to connect to an Azure IoT Hub using a connection string. You can then manage graph topologies and instances on the chosen device. You can get a connection string by following the instructions in the [Quickstart](https://docs.microsoft.com/azure/media-services/live-video-analytics-edge/get-started-detect-motion-emit-events-quickstart). Follow the steps up until _Configure the Azure IoT Tools extension_ and use the connection string in this extension instead of Azure IoT Tools.

## Setup LVA edge graph extension

After successfully installing this extension and its prerequisites, you can follow the steps below to get started with Live Video on Analytics on IoT Edge devices.

### Connect to the IoT Hub

You will need to use the IoT Hub connection string to connect this extension to it.

1. In Explorer of VS Code, click the "Live Video Analytics" extension in the left pane.
1. Click on **"Enter Connection String"** button

    - Enter the Iot Hub Connection string that you want use (It is one-time configuration, and please make sure it is IoT Hub Connection String and not Device Connection String. The format is **`HostName=<my-hub>.azure-devices.net;SharedAccessKeyName=<my-policy>;SharedAccessKey=<my-policy-key>`**)

![Setup IoT Hub Connection String](https://github.com/Azure/lva-edge-vscode-extension/raw/main/resources/gifs/addConnectionString.gif)

1. The device list will be shown
    - Choose the device you want to use to deploy the media graphs
1. A list of modules that are already deployed to the device will be displayed
    - Choose the Live Video Analytics module from the list
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

![Create a graph topology](https://github.com/Azure/lva-edge-vscode-extension/raw/main/resources/gifs/createTopology.gif)

### Activate Graph Instances

1. Once a graph topology is created, you need to create an instance of the topology
    - Here you will provide the values to the graph instance parameters
1. Once all the required parameters are filled in, you can "**Save**" the instance and activate it later or "**Save and activate**" the graph instance
1. Once the graph is activated, you will see a green icon next to the graph instance name
1. Open the Output console by pressing `Ctrl`+ `Shift` + `U` and observe the IoT Hub messages start flowing

![Activate an graph instance](https://github.com/Azure/lva-edge-vscode-extension/raw/main/resources/gifs/activateTopology.gif)

## Contributing

Got a suggestion for the Azure IoT Tools extension? Submit a new issue and a PR with an updated `package.json` and `README.md` and we'll take a look!

Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

[MIT](LICENSE)
