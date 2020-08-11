import * as vscode from "vscode";
import { GraphTopologyData } from "../Data/GraphTolologyData";
import { IotHubData } from "../Data/IotHubData";
import { MediaGraphInstance, MediaGraphTopology } from "../lva-sdk/lvaSDKtypes";
import { Constants } from "../Util/Constants";
import Localizer from "../Util/Localizer";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { InstanceItem } from "./InstanceItem";
import { INode } from "./Node";

export class GraphTopologyItem extends vscode.TreeItem {
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        public readonly graphTopology?: MediaGraphTopology,
        private readonly _graphInstances?: MediaGraphInstance[]
    ) {
        super(graphTopology?.name ?? Localizer.localize("createGraphButton"), vscode.TreeItemCollapsibleState.Expanded);
        if (graphTopology) {
            this.iconPath = new vscode.ThemeIcon("primitive-square");
        } else {
            this.iconPath = new vscode.ThemeIcon("add");
            this.command = { title: Localizer.localize("createGraphButton"), command: "lvaTopologyEditor.start", arguments: [this] };
            this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        }
    }

    public getChildren(): Promise<INode[]> | INode[] {
        if (this.graphTopology == null || this._graphInstances == null) {
            return [];
        }
        return (
            this._graphInstances
                ?.filter((instance) => {
                    return instance?.properties?.topologyName === this.graphTopology?.name;
                })
                ?.map((instance) => {
                    return new InstanceItem(instance);
                }) ?? []
        );
    }

    public createNewGraphCommand(context: vscode.ExtensionContext) {
        const createGraphPanel = GraphEditorPanel.createOrShow(context.extensionPath);
        if (createGraphPanel) {
            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.closeWindow,
                callback: () => {
                    createGraphPanel.dispose();
                }
            });

            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.saveGraph,
                callback: async (topology: any) => {
                    GraphTopologyData.putGraphTopology(this.iotHubData, this.deviceId, this.moduleId, topology).then(
                        (response) => {
                            vscode.commands.executeCommand("moduleExplorer.refresh");
                            createGraphPanel.dispose();
                        },
                        (error) => {
                            // show errors
                        }
                    );
                }
            });
        }
    }
}
