import * as vscode from "vscode";
import { GraphInstanceData } from "../Data/GraphInstanceData";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import { ExtensionUtils, LvaHubConfig } from "../Util/ExtensionUtils";
import { HubItem } from "./HubItem";
import { ModuleItem } from "./ModuleItem";
import { INode } from "./Node";

export default class ModuleExplorer implements vscode.TreeDataProvider<INode> {
    private _onDidChangeTreeData: vscode.EventEmitter<INode | undefined | void> = new vscode.EventEmitter<INode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<INode | undefined | void> = this._onDidChangeTreeData.event;

    private _connectionConfig?: LvaHubConfig;
    private _iotHubData?: IotHubData;
    constructor(private context: vscode.ExtensionContext) {}

    public async setConnectionString(connectionConfig?: LvaHubConfig) {
        if (connectionConfig && connectionConfig.connectionString) {
            this._connectionConfig = connectionConfig;
            this._iotHubData = new IotHubData(connectionConfig.connectionString);
            // TODO add a command to clear connections
        } else {
            const connectionInfo = await ExtensionUtils.setConnectionString();
            this._iotHubData = connectionInfo.iotHubData;
            this._connectionConfig = connectionInfo.lvaHubConfig;
            this.context.globalState.update(Constants.LvaGlobalStateKey, this._connectionConfig);
        }
        if (this._iotHubData && this._connectionConfig) {
            this._iotHubData = new IotHubData(this._connectionConfig.connectionString);
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
            return [new HubItem(this._iotHubData, ExtensionUtils.getIoTHubName(this._connectionConfig.connectionString))];
        }

        if (element instanceof ModuleItem) {
            return GraphInstanceData.getGraphInstances(this._iotHubData, element.deviceId, element.moduleId).then((graphInstances) => {
                return element.getChildren(this._connectionConfig, graphInstances);
            });
        }
        return element.getChildren(this._connectionConfig);
    }
}
