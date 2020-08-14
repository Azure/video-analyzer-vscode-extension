import { Device } from "azure-iothub";
import * as vscode from "vscode";
import { GraphTopologyData } from "../Data/GraphTolologyData";
import { IotHubData } from "../Data/IotHubData";
import { MediaGraphInstance } from "../lva-sdk/lvaSDKtypes";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import { TreeUtils } from "../Util/treeUtils";
import { GraphTopologyItem } from "./GraphTopologyItem";
import { GraphTopologyListItem } from "./GraphTopologyListItem";
import { INode } from "./Node";

export class ModuleItem extends vscode.TreeItem {
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        private _connectionState: Device.ConnectionState | undefined,
        private readonly _collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
    ) {
        super(moduleId, _collapsibleState);

        const state = this._connectionState?.toLowerCase() === "connected" ? "on" : "off";
        this.iconPath = TreeUtils.getIconPath(`module-${state}`);
    }

    public getChildren(lvaHubConfig?: LvaHubConfig, graphInstances?: MediaGraphInstance[]): Promise<INode[]> | INode[] {
        return [new GraphTopologyListItem(this.iotHubData, this.deviceId, this.moduleId, this._collapsibleState)];
    }
}
