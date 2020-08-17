import * as vscode from "vscode";
import { GraphInstanceData } from "../Data/GraphInstanceData";
import { IotHubData } from "../Data/IotHubData";
import {
    MediaGraphInstance,
    MediaGraphInstanceState,
    MediaGraphTopology
} from "../lva-sdk/lvaSDKtypes";
import { Constants } from "../Util/Constants";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { TreeUtils } from "../Util/treeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { INode } from "./Node";

export class InstanceItem extends vscode.TreeItem {
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        private readonly _graphTopology: MediaGraphTopology,
        private readonly _graphInstance?: MediaGraphInstance
    ) {
        super(_graphInstance?.name ?? Localizer.localize("createGraphInstanceButton"), vscode.TreeItemCollapsibleState.None);
        if (_graphInstance) {
            this.iconPath = TreeUtils.getIconPath(`instance`);
            switch (_graphInstance.properties?.state) {
                case MediaGraphInstanceState.Active:
                    this.contextValue = "InstanceItemContextActive";
                    break;
                case MediaGraphInstanceState.Inactive:
                    this.contextValue = "InstanceItemContextInactive";
                    break;
                default:
                    this.contextValue = "InstanceItemContextProgress";
            }
        } else {
            this.iconPath = new vscode.ThemeIcon("add");
            this.command = { title: Localizer.localize("createGraphInstanceButton"), command: "moduleExplorer.createInstance", arguments: [this] };
        }
    }

    public getChildren(lvaHubConfig: LvaHubConfig): Promise<INode[]> | INode[] {
        return [];
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
                        data: { pageType: Constants.PageTypes.instancePage, graphData: this._graphTopology, graphInstance: this._graphInstance }
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

    public activateInstanceCommand() {
        if (this._graphInstance) {
            GraphInstanceData.activateGraphInstance(this.iotHubData, this.deviceId, this.moduleId, this._graphInstance.name).then(
                (response) => {
                    vscode.commands.executeCommand("moduleExplorer.refresh");
                },
                (error) => {
                    // show errors
                }
            );
        }
    }

    public deactivateInstanceCommand() {
        if (this._graphInstance) {
            GraphInstanceData.deactivateGraphInstance(this.iotHubData, this.deviceId, this.moduleId, this._graphInstance.name).then(
                (response) => {
                    vscode.commands.executeCommand("moduleExplorer.refresh");
                },
                (error) => {
                    // show errors
                }
            );
        }
    }

    public deleteInstanceCommand() {
        if (this._graphInstance) {
            // TODO we might need a confirmation before delete
            GraphInstanceData.deleteGraphInstance(this.iotHubData, this.deviceId, this.moduleId, this._graphInstance.name).then(
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
