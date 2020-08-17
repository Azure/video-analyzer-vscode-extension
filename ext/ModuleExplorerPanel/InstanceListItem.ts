import * as vscode from "vscode";
import { GraphInstanceData } from "../Data/GraphInstanceData";
import { IotHubData } from "../Data/IotHubData";
import { MediaGraphInstance, MediaGraphTopology } from "../lva-sdk/lvaSDKtypes";
import { Constants } from "../Util/Constants";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { DeviceItem } from "./DeviceItem";
import { InstanceItem } from "./InstanceItem";
import { INode } from "./Node";

export class InstanceListItem extends vscode.TreeItem implements INode {
    private _instanceList: InstanceItem[] = [];
    private _logger: Logger;
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        private readonly _graphTopology: MediaGraphTopology,
        private readonly _graphInstances?: MediaGraphInstance[]
    ) {
        super(Localizer.localize("graphInstanceListTreeItem"), vscode.TreeItemCollapsibleState.Expanded);
        this.contextValue = "instanceListContext";
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

    public getChildren(lvaHubConfig: LvaHubConfig): Promise<INode[]> | INode[] {
        return this._instanceList;
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
