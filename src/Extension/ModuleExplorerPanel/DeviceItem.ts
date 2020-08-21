import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import { ModulesListItem } from "./ModulesListItem";
import { INode } from "./Node";

export class DeviceItem extends vscode.TreeItem implements INode {
    constructor(public iotHubData: IotHubData, public readonly deviceId: string) {
        super(deviceId, vscode.TreeItemCollapsibleState.Expanded);
        this.iconPath = new vscode.ThemeIcon("device-desktop");
    }

    public getChildren(lvaHubConfig?: LvaHubConfig): Promise<INode[]> | INode[] {
        return [new ModulesListItem(this.iotHubData, this.deviceId, vscode.TreeItemCollapsibleState.Expanded)];
    }
}
