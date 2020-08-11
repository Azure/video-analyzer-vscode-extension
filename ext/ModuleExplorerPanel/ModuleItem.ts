import { Device } from "azure-iothub";
import * as vscode from "vscode";
import { GraphTopologyData } from "../Data/GraphTolologyData";
import { IotHubData } from "../Data/IotHubData";
import { MediaGraphInstance } from "../lva-sdk/lvaSDKtypes";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import { INode } from "./Node";
import { TopologyItem } from "./TopologyItem";

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
                const createGraphItem = new vscode.TreeItem("Create graph");
                createGraphItem.iconPath = new vscode.ThemeIcon("add");
                resolve([
                    createGraphItem as any, // Testing in line command
                    ...graphTopologies?.map((topology) => {
                        return new TopologyItem(this.iotHubData, this.deviceId, this.moduleId, topology, graphInstances ?? []);
                    })
                ]);
            });
        });
    }
}
