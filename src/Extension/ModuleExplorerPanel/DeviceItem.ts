import { Device } from "azure-iothub";
import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import { TreeUtils } from "../Util/TreeUtils";
import { ModulesListItem } from "./ModulesListItem";
import { INode } from "./Node";

export class DeviceItem extends vscode.TreeItem implements INode {
    constructor(public iotHubData: IotHubData, public readonly deviceId: string, private _connectionState: Device.ConnectionState | undefined) {
        super(deviceId, vscode.TreeItemCollapsibleState.Expanded);

        const state = this._connectionState?.toLowerCase() === "connected" ? "on" : "off";
        this.iconPath = TreeUtils.getIconPath(`device-${state}`);
    }

    public getChildren(lvaHubConfig?: LvaHubConfig): Promise<INode[]> | INode[] {
        return [new ModulesListItem(this.iotHubData, this.deviceId, vscode.TreeItemCollapsibleState.Expanded)];
    }
}
