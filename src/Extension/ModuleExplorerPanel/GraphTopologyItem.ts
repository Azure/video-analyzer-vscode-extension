import * as vscode from "vscode";
import {
    MediaGraphInstance,
    MediaGraphTopology
} from "../../Common/Types/LVASDKTypes";
import { GraphTopologyData } from "../Data/GraphTolologyData";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import { ExtensionUtils } from "../Util/ExtensionUtils";
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
        private readonly _graphTopology?: MediaGraphTopology,
        private readonly _graphInstances?: MediaGraphInstance[],
        private _nameCheckCallback?: (name: string) => boolean
    ) {
        super(_graphTopology?.name ?? "", vscode.TreeItemCollapsibleState.Expanded);
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
        return this._instanceList;
    }

    public setGraphCommand(context: vscode.ExtensionContext) {
        const createGraphPanel = GraphEditorPanel.createOrShow(
            context.extensionPath,
            Localizer.localize(this._graphTopology ? "editGraphPageTile" : "createNewGraphPageTile")
        );
        if (createGraphPanel) {
            createGraphPanel.waitForPostMessage({
                name: Constants.PostMessageNames.closeWindow,
                callback: () => {
                    createGraphPanel.dispose();
                }
            });

            createGraphPanel.setupInitialMessage({ pageType: Constants.PageTypes.graphPage, graphData: this._graphTopology, editMode: !!this._graphTopology });

            createGraphPanel.setupNameCheckMessage((name) => {
                return this._nameCheckCallback == null || this._nameCheckCallback(name);
            });

            createGraphPanel.waitForPostMessage({
                name: Constants.PostMessageNames.saveGraph,
                callback: async (topology: MediaGraphTopology) => {
                    GraphTopologyData.putGraphTopology(this.iotHubData, this.deviceId, this.moduleId, topology).then(
                        (response) => {
                            TreeUtils.refresh();
                            createGraphPanel.dispose();
                        },
                        (error) => {
                            const errorList = GraphEditorPanel.parseDirectMethodError(error, topology);
                            createGraphPanel.postMessage({ name: Constants.PostMessageNames.failedOperationReason, data: errorList });
                            this._logger.logError(`${Localizer.localize("saveGraphFailedError")} "${topology.name}"`, errorList);
                        }
                    );
                }
            });
        }
    }

    public async deleteGraphCommand() {
        if (this._graphTopology) {
            const allowDelete = await ExtensionUtils.showConfirmation(Localizer.localize("deleteGraphConfirmation"));
            if (allowDelete) {
                GraphTopologyData.deleteGraphTopology(this.iotHubData, this.deviceId, this.moduleId, this._graphTopology.name).then(
                    (response) => {
                        TreeUtils.refresh();
                    },
                    (error) => {
                        const errorList = GraphEditorPanel.parseDirectMethodError(error);
                        this._logger.logError(`${Localizer.localize("deleteGraphFailedError")} "${this._graphTopology!.name}"`, errorList);
                    }
                );
            }
        }
    }

    public createNewGraphInstanceCommand(context: vscode.ExtensionContext) {
        const graphInstance = new InstanceItem(this.iotHubData, this.deviceId, this.moduleId, this._graphTopology!, undefined, (name) => {
            return (
                this._graphInstances == null ||
                this._graphInstances.length == 0 ||
                this._graphInstances.filter((instance) => {
                    return instance.name === name;
                }).length === 0
            );
        });
        graphInstance.setInstanceCommand(context);
    }
}
