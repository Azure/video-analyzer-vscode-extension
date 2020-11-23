import * as vscode from "vscode";
import {
    MediaGraphInstance,
    MediaGraphTopology
} from "../../Common/Types/LVASDKTypes";
import { GraphTopologyData } from "../Data/GraphTolologyData";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { GraphTopologyItem } from "./GraphTopologyItem";
import { INode } from "./Node";

export class GraphTopologyListItem extends vscode.TreeItem {
    private _logger: Logger;
    private _graphTopologies: MediaGraphTopology[] = [];
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        private readonly _collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
    ) {
        super(Localizer.localize("graphTopologyListTreeItem"), _collapsibleState);
        this.contextValue = "graphListContext";
        this._logger = Logger.getOrCreateOutputChannel();
    }

    public getChildren(lvaHubConfig?: LvaHubConfig, graphInstances?: MediaGraphInstance[]): Promise<INode[]> | INode[] {
        return new Promise((resolve, reject) => {
            GraphTopologyData.getGraphTopologies(this.iotHubData, this.deviceId, this.moduleId).then(
                (graphTopologies) => {
                    this._graphTopologies = graphTopologies;
                    resolve(
                        graphTopologies?.map((topology) => {
                            return new GraphTopologyItem(this.iotHubData, this.deviceId, this.moduleId, topology, graphInstances ?? []);
                        })
                    );
                },
                (error) => {
                    const errorNode = new vscode.TreeItem(Localizer.localize("getAllGraphsFailedError"), vscode.TreeItemCollapsibleState.None);
                    this._logger.logError(`${Localizer.localize("getAllGraphsFailedError")}`, [error.responseBody], false);
                    resolve([errorNode as INode]);
                }
            );
        });
    }

    public createNewGraphCommand(context: vscode.ExtensionContext) {
        const graphItem = new GraphTopologyItem(this.iotHubData, this.deviceId, this.moduleId, undefined, undefined, (name) => {
            return (
                this._graphTopologies.length === 0 ||
                this._graphTopologies.filter((graph) => {
                    return graph.name === name;
                }).length === 0
            );
        });
        graphItem.setGraphCommand(context);
    }
}
