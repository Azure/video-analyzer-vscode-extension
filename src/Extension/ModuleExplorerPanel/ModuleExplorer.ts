import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import { CredentialStore } from "../Util/CredentialStore";
import { ExtensionUtils, LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { DeviceListItem } from "./DeviceListItem";
import { IoTHubLabelNode } from "./IoTHubLabelNode";
import { INode } from "./Node";

export default class ModuleExplorer implements vscode.TreeDataProvider<INode> {
    private _onDidChangeTreeData: vscode.EventEmitter<INode | undefined> = new vscode.EventEmitter<INode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<INode | undefined> = this._onDidChangeTreeData.event;

    private _connectionConfig?: LvaHubConfig;
    private _iotHubData?: IotHubData;
    private _autoRefreshIntervalID?: NodeJS.Timer;

    constructor(private context: vscode.ExtensionContext) {}

    public async setConnectionString(connectionConfig?: LvaHubConfig) {
        if (connectionConfig && connectionConfig.connectionString) {
            this._connectionConfig = connectionConfig;
            this._iotHubData = new IotHubData(connectionConfig.connectionString);
        } else {
            const connectionInfo = await ExtensionUtils.setConnectionString();
            if (connectionInfo) {
                this._iotHubData = connectionInfo.iotHubData;
                this._connectionConfig = connectionInfo.lvaHubConfig;
                CredentialStore.setConnectionInfo(this.context, this._connectionConfig);
            }
        }
        if (this._iotHubData && this._connectionConfig) {
            this._iotHubData = new IotHubData(this._connectionConfig.connectionString);
            this.refresh();
        }
    }

    public async resetConnectionString() {
        const allowDelete = await ExtensionUtils.showConfirmation(Localizer.localize("deleteConnectionToHubConfirmation"));
        if (allowDelete) {
            this._connectionConfig = (null as unknown) as LvaHubConfig;
            this._iotHubData = (null as unknown) as IotHubData;
            await CredentialStore.resetConnectionInfo(this.context);
            this.refresh();
        }
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: INode): Promise<INode[]> | INode[] {
        if (!this._connectionConfig || !this._iotHubData) {
            return [];
        }
        if (!element) {
            if (this._autoRefreshIntervalID) {
                clearInterval(this._autoRefreshIntervalID);
            }
            this._autoRefreshIntervalID = this.generateAutoRefreshInterval();

            return [new IoTHubLabelNode(this._iotHubData, ExtensionUtils.getIoTHubName(this._connectionConfig.connectionString)), new DeviceListItem(this._iotHubData)];
        }
        return element.getChildren(this._connectionConfig);
    }

    private generateAutoRefreshInterval(): NodeJS.Timer {
        const treeViewAutoRefreshIntervalInSeconds = ExtensionUtils.getConfig<number>(Constants.TreeViewAutoRefreshIntervalInSecondsKey);
        return setInterval(() => {
            this._onDidChangeTreeData.fire();
        }, treeViewAutoRefreshIntervalInSeconds! * 1000);
    }
}
