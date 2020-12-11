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

    public static ApiVersion = {
        version2: "2.0"
    };

    public static LvaGlobalStateKey = "lvaGlobalStateConfigKey";
    public static LvaGlobalStateGraphAlignKey = "lvaGlobalStateGraphAlignKey";
    public static ExtensionId = "azure-lva-edge-tools";

    public static TreeViewAutoRefreshIntervalInSecondsKey = "treeViewAutoRefreshIntervalInSeconds";

    // have a copy of this in react code.
    public static PostMessageNames = {
        closeWindow: "closeWindow",
        saveGraph: "saveGraph",
        saveInstance: "saveInstance",
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
