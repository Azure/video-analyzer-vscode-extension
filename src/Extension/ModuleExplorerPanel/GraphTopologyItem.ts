import * as vscode from "vscode";
import {
    MediaGraphInstance,
    MediaGraphTopology
} from "../../Types/LVASDKTypes";
import { GraphTopologyData } from "../Data/GraphTolologyData";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { InstanceListItem } from "./InstanceListItem";
import { INode } from "./Node";

export class GraphTopologyItem extends vscode.TreeItem {
    private _logger: Logger;
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        private readonly _graphTopology: MediaGraphTopology,
        private readonly _graphInstances?: MediaGraphInstance[]
    ) {
        super(_graphTopology.name, vscode.TreeItemCollapsibleState.Expanded);
        this.iconPath = TreeUtils.getIconPath(`graph`);
        this.contextValue = "graphItemContext";
        this._logger = Logger.getOrCreateOutputChannel();
    }

    public getChildren(): Promise<INode[]> | INode[] {
        return [new InstanceListItem(this.iotHubData, this.deviceId, this.moduleId, this._graphTopology, this._graphInstances)];
    }

    public editGraphCommand(context: vscode.ExtensionContext) {
        const createGraphPanel = GraphEditorPanel.createOrShow(context.extensionPath, Localizer.localize("editGraphPageTile"));
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
                    createGraphPanel.postMessage({
                        name: Constants.PostMessageNames.setInitialData,
                        data: { pageType: Constants.PageTypes.graphPage, graphData: this._graphTopology }
                    });
                }
            });

            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.saveGraph,
                callback: async (topology: MediaGraphTopology) => {
                    GraphTopologyData.putGraphTopology(this.iotHubData, this.deviceId, this.moduleId, topology).then(
                        (response) => {
                            TreeUtils.refresh();
                            createGraphPanel.dispose();
                        },
                        (error) => {
                            this._logger.logError(`Failed to save the graph "${topology.name}"`, error); // TODO. localize
                        }
                    );
                }
            });
        }
    }

    public deleteGraphCommand() {
        if (this._graphTopology) {
            // TODO we might need a confirmation before delete
            GraphTopologyData.deleteGraphTopology(this.iotHubData, this.deviceId, this.moduleId, this._graphTopology.name).then(
                (response) => {
                    TreeUtils.refresh();
                },
                (error) => {
                    this._logger.logError(`Failed to delete the graph "${this._graphTopology.name}"`, error); // TODO. localize
                }
            );
        }
    }
}
