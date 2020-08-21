import * as vscode from "vscode";
import { MediaGraphInstance } from "../../Types/LVASDKTypes";
import { GraphTopologyData } from "../Data/GraphTolologyData";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { GraphTopologyItem } from "./GraphTopologyItem";
import { INode } from "./Node";

export class GraphTopologyListItem extends vscode.TreeItem {
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        private readonly _collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
    ) {
        super(Localizer.localize("graphTopologyListTreeItem"), _collapsibleState);
        this.contextValue = "graphListContext";
    }

    public getChildren(lvaHubConfig?: LvaHubConfig, graphInstances?: MediaGraphInstance[]): Promise<INode[]> | INode[] {
        return new Promise((resolve, reject) => {
            GraphTopologyData.getGraphTopologies(this.iotHubData, this.deviceId, this.moduleId).then((graphTopologies) => {
                resolve(
                    graphTopologies?.map((topology) => {
                        return new GraphTopologyItem(this.iotHubData, this.deviceId, this.moduleId, topology, graphInstances ?? []);
                    })
                );
            });
        });
    }

    public createNewGraphCommand(context: vscode.ExtensionContext) {
        const createGraphPanel = GraphEditorPanel.createOrShow(context.extensionPath, Localizer.localize("createNewGraphPageTile"));
        if (createGraphPanel) {
            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.closeWindow,
                callback: () => {
                    createGraphPanel.dispose();
                }
            });

            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.getInitialData,
                callback: () => {
                    createGraphPanel.postMessage({ name: Constants.PostMessageNames.setInitialData, data: { pageType: Constants.PageTypes.graphPage } });
                }
            });

            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.saveGraph,
                callback: async (topology: any) => {
                    GraphTopologyData.putGraphTopology(this.iotHubData, this.deviceId, this.moduleId, topology).then(
                        (response) => {
                            TreeUtils.refresh();
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
