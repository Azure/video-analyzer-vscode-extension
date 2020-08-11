import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { MediaGraphInstance, MediaGraphTopology } from "../lva-sdk/lvaSDKtypes";
import { InstanceItem } from "./InstanceItem";
import { INode } from "./Node";

export class TopologyItem extends vscode.TreeItem {
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        public readonly graphTopology: MediaGraphTopology,
        private readonly _graphInstances: MediaGraphInstance[]
    ) {
        super(graphTopology.name, vscode.TreeItemCollapsibleState.Expanded);
        this.iconPath = new vscode.ThemeIcon("primitive-square");
    }

    public getChildren(): Promise<INode[]> | INode[] {
        return (
            this._graphInstances
                ?.filter((instance) => {
                    return instance?.properties?.topologyName === this.graphTopology.name;
                })
                ?.map((instance) => {
                    return new InstanceItem(instance);
                }) ?? []
        );
    }
}
