import * as vscode from "vscode";

export class Constants {
    public static DeviceConnectionStringKey = "deviceConnectionString";
    public static IotHubConnectionStringKey = "iotHubConnectionString";
    public static ConnectionStringFormat = {
        [Constants.IotHubConnectionStringKey]: "HostName=<my-hostname>;SharedAccessKeyName=<my-policy>;SharedAccessKey=<my-policy-key>",
        [Constants.DeviceConnectionStringKey]: "HostName=<my-hostname>;DeviceId=<known-device-id>;SharedAccessKey=<known-device-key>"
    };
    public static ConnectionStringRegex = {
        [Constants.IotHubConnectionStringKey]: /^HostName=.+;SharedAccessKeyName=.+;SharedAccessKey=.+$/,
        [Constants.DeviceConnectionStringKey]: /^HostName=.+;DeviceId=.+;SharedAccessKey=.+$/
    };

    public static LegacySupportedApiVersions = ["2.0"];
    public static SupportedApiVersions = ["1.0", "1.1"];

    public static VideoAnalyzerGlobalStateKey = "videoAnalyzerGlobalStateConfigKey";
    public static VideoAnalyzerGlobalStateGraphAlignKey = "videoAnalyzerGlobalStateGraphAlignKey";
    public static ExtensionId = "azure-video-analyzer";
    public static ExtensionName = "Azure Video Analyzer";

    public static TreeViewAutoRefreshIntervalInSecondsKey = "treeViewAutoRefreshIntervalInSeconds";

    // have a copy of this in react code.
    public static PostMessageNames = {
        closeWindow: "closeWindow",
        saveGraph: "saveGraph",
        saveLivePipeline: "saveInstance",
        saveAndActivate: "saveAndActivate",
        getInitialData: "getInitialData",
        setInitialData: "setInitialData",
        nameAvailableCheck: "nameAvailableCheck",
        failedOperationReason: "failedOperationReason",
        setGraphAlignment: "setGraphAlignment"
    };

    public static PageTypes = {
        graphPage: "graphPage",
        instancePage: "instancePage"
    };

    public static ResourcesFolderPath: string;

    public static initialize(context: vscode.ExtensionContext) {
        Constants.ResourcesFolderPath = context.asAbsolutePath("resources");
    }
}
