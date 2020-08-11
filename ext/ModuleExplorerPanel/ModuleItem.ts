import { Device } from "azure-iothub";
import * as vscode from "vscode";
import { GraphTopologyData } from "../Data/GraphTolologyData";
import { IotHubData } from "../Data/IotHubData";
import { MediaGraphInstance } from "../lva-sdk/lvaSDKtypes";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import { GraphTopologyItem } from "./GraphTopologyItem";
import { INode } from "./Node";

export class ModuleItem extends vscode.TreeItem {
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        private connectionState: Device.ConnectionState | undefined,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
    ) {
        super(moduleId, vscode.TreeItemCollapsibleState.Expanded);
        this.iconPath = new vscode.ThemeIcon("plug");
    }

    public getChildren(lvaHubConfig?: LvaHubConfig, graphInstances?: MediaGraphInstance[]): Promise<INode[]> | INode[] {
        return new Promise((resolve, reject) => {
            GraphTopologyData.getGraphTopologies(this.iotHubData, this.deviceId, this.moduleId).then((graphTopologies) => {
                resolve([
                    new GraphTopologyItem(this.iotHubData, this.deviceId, this.moduleId),
                    ...graphTopologies?.map((topology) => {
                        return new GraphTopologyItem(this.iotHubData, this.deviceId, this.moduleId, topology, graphInstances ?? []);
                    })
                ]);
            });
        });
    }
}
