import * as vscode from "vscode";
import { GraphInstanceData } from "../Data/GraphInstanceData";
import { IotHubData } from "../Data/IotHubData";
import { MediaGraphInstance, MediaGraphTopology } from "../lva-sdk/lvaSDKtypes";
import { Constants } from "../Util/Constants";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { INode } from "./Node";

export class InstanceItem extends vscode.TreeItem {
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        public readonly graphTopology: MediaGraphTopology,
        public readonly graphInstance?: MediaGraphInstance
    ) {
        super(graphInstance?.name ?? Localizer.localize("createGraphInstanceButton"), vscode.TreeItemCollapsibleState.None);
        if (graphInstance) {
            this.iconPath = new vscode.ThemeIcon("primitive-dot");
            this.contextValue = "InstanceItemContext";
        } else {
            this.iconPath = new vscode.ThemeIcon("add");
            this.command = { title: Localizer.localize("createGraphInstanceButton"), command: "lvaTopologyEditor.createInstance", arguments: [this] };
        }
    }

    public getChildren(lvaHubConfig: LvaHubConfig): Promise<INode[]> | INode[] {
        return [];
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
                            graphData: this.graphTopology
                        }
                    });
                }
            });
            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.saveInstance,
                callback: async (instance: any) => {
                    GraphInstanceData.putGraphInstance(this.iotHubData, this.deviceId, this.moduleId, instance).then(
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

            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.saveAndActivate,
                callback: async (instance: any) => {
                    // TODO save and activate
                }
            });
        }
    }

    public editInstanceCommand(context: vscode.ExtensionContext) {
        const createGraphPanel = GraphEditorPanel.createOrShow(context.extensionPath, Localizer.localize("editInstancePageTile"));
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
                        data: { pageType: Constants.PageTypes.instancePage, graphData: this.graphTopology, graphInstance: this.graphInstance }
                    });
                }
            });

            createGraphPanel.registerPostMessage({
                name: Constants.PostMessageNames.saveGraph,
                callback: async (instance: any) => {
                    GraphInstanceData.putGraphInstance(this.iotHubData, this.deviceId, this.moduleId, instance).then(
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

    public deleteInstanceCommand() {
        if (this.graphInstance) {
            // TODO we might need a confirmation before delete
            GraphInstanceData.deleteGraphInstance(this.iotHubData, this.deviceId, this.moduleId, this.graphInstance.name).then(
                (response) => {
                    vscode.commands.executeCommand("moduleExplorer.refresh");
                },
                (error) => {
                    // show errors
                }
            );
        }
    }
}
