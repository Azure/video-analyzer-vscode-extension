# Azure Video Analyzer Extension for VS Code

Azure Video Analyzer support for Visual Studio Code is provided through this extension that makes it easy to edit and manage Video Analyzer pipelines. The getting started walk through below closely mirrors what you can find in our online quickstart for the extension [here](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/create-pipeline-vs-code-extension).

If you have already connected to your IoT Hub and are looking for reference on how to use the extension, please go to our doc on how to [use the Video Analyzer Visual Studio Code extension](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/visual-studio-code-extension).

## Suggested Pre-reading

-   [Video Analyzer overview](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/overview)
-   [Video Analyzer terminology](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/terminology)

## Prerequisites

-   An Azure account that includes an active subscription. [Create an account](https://azure.microsoft.com/free/) for free if you don't already have one.
-   A deployed Video Analyzer edge module. If you didn't complete the [Get started - Azure Video Analyzer](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/get-started-detect-motion-emit-events) quickstart, you can deploy a sample set up in the [set up Azure resources](#set-up-azure-resources) section.

## Set up Azure resources

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://aka.ms/ava-click-to-deploy)

The deployment process will take about **20 minutes**. Upon completion, you will have certain Azure resources deployed in the Azure subscription, including:

1. **Video Analyzer account** - This [cloud service](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/overview) is used to register the Video Analyzer edge module, and for playing back recorded video and video analytics.
1. **Storage account** - For storing recorded video and video analytics.
1. **Managed Identity** - This is the user assigned [managed identity](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview) used to manage access to the above storage account.
1. **Virtual machine** - This is a virtual machine that will serve as your simulated edge device.
1. **IoT Hub** - This acts as a central message hub for bi-directional communication between your IoT application, IoT Edge modules and the devices it manages.

If you run into issues with Azure resources that get created, please view our [troubleshooting guide](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/troubleshoot) to resolve some commonly encountered issues.

## Connect the Azure Video Analyzer Visual Studio Code extension to your IoT Hub

To connect the extension to the edge module, you first need to retrieve your connection string. Follow these steps to do so.

1. Go to the [Azure portal](https://portal.azure.com) and select your IoT Hub.
1. On the left under `Settings`, select `Shared access policies`.
1. Select the Policy Name `iothubowner`.
1. From the window on the right, copy the `Primary connection string`.

Now that you have the connection string, the below steps will connect the extension to the edge module.

1. In Visual Studio Code, select the `Azure Video Analyzer` icon on the left.
1. Click on the `Enter Connection String` button.
1. At the top, paste the connection string from the portal.
1. Select the device – default is `avasample-iot-edge-device`.
1. Select the Video Analyzer module – default is `avaedge`.

    ![Setup IoT Hub Connection String](https://github.com/Azure/lva-edge-vscode-extension/raw/main/resources/gifs/addConnectionString.gif)

Along the left, you will now see your connected device with the underlying module. By default, there are no pipeline topologies deployed.

## Create a topology and live pipeline

Pipeline topologies are the basic building block which Video Analyzer uses to define how work happens. You can learn more about [pipeline topologies here](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/pipeline.md). In this section you will deploy a pipeline topology which is a template and then create an instance of the topology, or live pipeline. The live pipeline is connected to the actual video stream.

1. On the left under `Modules`, right click on `Pipeline topologies` and select `Create pipeline topology``.
1. Along the top, under `Try sample topologies`, under `Motion Detection`, select `Publish motion events to IoT Hub`. When prompted, click `Proceed`.
1. Click `Save` in the top right.

    ![Create a graph topology](https://github.com/Azure/lva-edge-vscode-extension/raw/main/resources/gifs/createTopology.gif)

You should now see an entry in the `Pipeline topologies` list on the left labeled `MotionDetection`. This is a pipeline topology, where some of the parameters are defined as variables that you can feed in when you create a live pipeline. Next we will create a live pipeline.

1. On the left under `Pipeline topologies`, right click on `MotionDetection` and select `Create live pipeline`.
1. For `Live pipeline name`, put in `mdpipeline1`.
1. In the `Parameters` section:
    - For “rtspPassword” put in “testuser”.
    - For “rtspUrl” put in “rtsp://rtspsim:554/media/camera-300s.mkv”.
    - For “rtspUserName” put in “testpassword”.
1. In the top right, click “Save and activate”.

    ![Activate an graph instance](https://github.com/Azure/lva-edge-vscode-extension/raw/main/resources/gifs/activateTopology.gif)

This gets a starting topology deployed and a live pipeline up and running on your edge device. If you have the Azure IoT Hub extension installed from the Get Started quickstart, you can monitor the build-in event endpoint in the Azure IoT-Hub Visual Studio Code extension to monitor this as shown in the [Observe Results](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/get-started-detect-motion-emit-events.md#observe-results) section. This will require you to install the [Azure IoT Tools extension](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.azure-iot-tools) as well.

If you are looking for more instructions on the extension, please go to our reference doc on how to [use the Video Analyzer Visual Studio Code extension](https://docs.microsoft.com/azure/azure-video-analyzer/video-analyzer-docs/visual-studio-code-extension).

## Clean up resources

If you intend to try the Video Analyzer quickstarts or tutorials, keep the resources you created. Otherwise, go to the Azure portal, go to your resource groups, select the resource group where you ran this quickstart, and delete all the resources.

## Contributing

Have a suggestion for the Azure Video Analyzer extension? Submit a new issue and a PR with an updated `package.json` and `README.md` and we'll take a look!

Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

[MIT](LICENSE)
