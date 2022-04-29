# Deprecated. Azure Video Analyzer Extension for VSCode

Deprecated. We’re retiring the Azure Video Analyzer preview service, you're advised to transition your applications off of Video Analyzer by 01 December 2022. This extension is no longer being maintained.

The Azure Video Analyzer extension makes it easy to edit and manage Video Analyzer pipelines. The steps below closely mirror our how-to guide on how to [use the Visual Studio Code extension for Azure Video Analyzer](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/edge/use-visual-studio-code-extension).

If you have already connected to your IoT Hub and are looking for reference on how to use the extension, please go to our reference guide on the [Visual Studio Code extension for Azure Video Analyzer](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/visual-studio-code-extension).

## Suggested Pre-reading

-   [Video Analyzer overview](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/overview)
-   [Video Analyzer terminology](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/terminology)

## Prerequisites

-   An Azure account that includes an active subscription. [Create an account](https://azure.microsoft.com/free/) for free if you don't already have one.
-   Either the [Quickstart: Get started with Azure Video Analyzer](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/edge/get-started-detect-motion-emit-events) or [Continuous video recording and playback](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/edge/use-continuous-video-recording) tutorial

> [!NOTE]
> The images in this article are based on the [Continuous video recording and playback](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/edge/use-continuous-video-recording) tutorial.

## Set up Azure resources

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://aka.ms/ava-click-to-deploy)

The deployment process will take about **20 minutes**. Upon completion, you will have certain Azure resources deployed in the Azure subscription, including:

1. **Video Analyzer account** - This [cloud service](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/overview) is used to register the Video Analyzer edge module, and for playing back recorded video and video analytics.
1. **Storage account** - For storing recorded video and video analytics.
1. **Managed Identity** - This is the user assigned [managed identity](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview) used to manage access to the above storage account.
1. **Virtual machine** - This is a virtual machine that will serve as your simulated edge device.
1. **IoT Hub** - This acts as a central message hub for bi-directional communication between your IoT application, IoT Edge modules and the devices it manages.

If you run into issues with Azure resources that get created, please view our [troubleshooting guide](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/troubleshoot) to resolve some commonly encountered issues.

## Set up your development environment

### Obtain your IoT Hub connection string

To make calls to the Video Analyzer Edge module, a connection string is first needed to connect the Visual Studio Code extension to the IoT Hub.

1. In the Azure portal, go to your IoT Hub account.
1. Look for **Shared access policies** in the left pane and select it.
1. Select the policy named **iothubowner**.
1. Copy the **Primary connection string** value. It will look like `HostName=xxx.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=XXX`.

### Connect the Visual Studio Code extension to the IoT Hub

Using your IoT Hub connection string, connect the Visual Studio Code extension to the Video Analyzer module.

1. In Visual Studio Code, select the **Azure Video Analyzer** icon from the activity bar on the far left-hand side.
1. In the Video Analyzer extension pane, click on the **Enter Connection String** button.
1. At the top, paste the IoT Hub connection string.
1. Select the device where AVA is deployed. The default is named `avasample-iot-edge-device`.
1. Select the Video Analyzer module. The default is named `avaedge`.

    ![Gif showing how to enter the connection string](https://github.com/Azure/lva-edge-vscode-extension/raw/main/resources/gifs/EnterConnectionString.gif)

The Video Analyzer extension pane should now show the connected device with all of its modules. Below the modules are where pipeline topologies are listed. By default, there are no pipeline topologies deployed.

## Create a pipeline topology

A [pipeline topology](https://docs.microsoft.com/en-us/azure/azure-video-analyzer/video-analyzer-docs/pipeline) enables you to describe how live video or recorded videos should be processed and analyzed for your custom needs through a set of interconnected nodes.

1. On the left under **Modules**, right click on **Pipeline topologies** and select **Create pipeline topology**.
1. Along the top, under **Try sample topologies**, under **Continuous Video Recording**, select **Record to Azure Video Analyzer video**. When prompted, click **Proceed**.
1. Click **Save** in the top right.

    ![Gif showing how to add a topology](https://github.com/Azure/lva-edge-vscode-extension/raw/main/resources/gifs/AddToplogy.gif)

Notice that there is now an entry in the **Pipeline topologies** list on the left labeled **CVRToVideoSink**. This is a pipeline topology, where some of the parameters are defined as variables.

## Create a live pipeline

A live pipeline is an instance of a pipeline topology. The variables in a pipeline topology are filled when a live pipeline is created.

1. On the left under **Pipeline topologies**, right click on **CVRToVideoSink** and select **Create live pipeline**.
1. For **Instance name**, put in `livePipeline1`.
1. In the **Parameters** section, under the **rtspUrl** parameter, put in `rtsp://rtspsim:554/media/camera-300s.mkv`.
1. In the top right, click **Save and activate**.

    ![Gif showing how to create and activate a live pipeline](https://github.com/Azure/lva-edge-vscode-extension/raw/main/resources/gifs/CreateAndActivate.gif)

Now that a live pipeline has been activated, operational events can be viewed by clicking on the **Start Monitoring Built-in Event Endpoint** button on the IoT Hub extension, as shown in the [Continuous video recording and playback](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/edge/use-continuous-video-recording#prepare-to-monitor-the-modules) tutorial.

If you are looking for more instructions on the extension, please go to our reference doc on the [Visual Studio Code extension for Azure Video Analyzer](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/visual-studio-code-extension).

## Contributing

Have a suggestion for the Azure Video Analyzer extension? Submit a new issue and a PR with an updated `package.json` and `README.md` and we'll take a look!

Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

[MIT](LICENSE)
