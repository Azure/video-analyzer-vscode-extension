import * as vscode from "vscode";
import {
    MediaGraphInstance,
    MediaGraphTopology
} from "../../Common/Types/LVASDKTypes";
import { GraphTopologyData } from "../Data/GraphTolologyData";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { InstanceItem } from "./InstanceItem";
import { INode } from "./Node";

export class GraphTopologyItem extends vscode.TreeItem {
    private _logger: Logger;
    private _instanceList: InstanceItem[] = [];
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

        if (this._graphTopology && this._graphInstances) {
            const instanceItems =
                this._graphInstances
                    .filter((instance) => {
                        return instance?.properties?.topologyName === this._graphTopology?.name;
                    })
                    .map((instance) => {
                        return new InstanceItem(this.iotHubData, this.deviceId, this.moduleId, this._graphTopology!, instance);
                    }) ?? [];
            if (instanceItems.length === 0) {
                this.collapsibleState = vscode.TreeItemCollapsibleState.None;
            }
            this._instanceList.push(...instanceItems);
        }
    }

    public getChildren(): Promise<INode[]> | INode[] {
        //return [new InstanceListItem(this.iotHubData, this.deviceId, this.moduleId, this._graphTopology, this._graphInstances)];
        return this._instanceList;
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

    public createNewGraphInstanceCommand(context: vscode.ExtensionContext) {
        const createGraphPanel = GraphEditorPanel.createOrShow(context.extensionPath, Localizer.localize("createNewInstancePageTile"));
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
                        data: {
                            pageType: Constants.PageTypes.instancePage,
                            graphData: this._graphTopology
                        }
                    });
                }
            });
            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.saveInstance,
                callback: async (instance: MediaGraphInstance) => {
                    const graphInstance = new InstanceItem(this.iotHubData, this.deviceId, this.moduleId, this._graphTopology, instance);
                    graphInstance.saveGraph(createGraphPanel, instance);
                }
            });

            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.saveAndActivate,
                callback: async (instance: MediaGraphInstance) => {
                    const graphInstance = new InstanceItem(this.iotHubData, this.deviceId, this.moduleId, this._graphTopology, instance);
                    graphInstance.saveGraph(createGraphPanel, instance).then(() => {
                        graphInstance.activateInstanceCommand(instance.name);
                    });
                }
            });
        }
    }
}
