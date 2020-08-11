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
        version1: "1.0"
    };

    public static LvaGlobalStateKey = "lvaGlobalStateConfigKey";
    public static ExtensionId = "lva-edge-vscode-extension";

    // have a copy of this in react code.
    public static PostMessageNames = {
        closeWindow: "closeWindow",
        saveGraph: "saveGraph"
    };
}
