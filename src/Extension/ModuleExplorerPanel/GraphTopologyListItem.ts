import * as vscode from "vscode";
import {
    MediaGraphInstance,
    MediaGraphTopology
} from "../../Common/Types/LVASDKTypes";
import { IotHubData } from "../Data/IotHubData";
import { StreamData } from "../Data/StreamData";
import { TopologyData } from "../Data/TolologyData";
import { Constants } from "../Util/Constants";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { GraphTopologyItem } from "./GraphTopologyItem";
import { ModuleDetails } from "./ModuleItem";
import { INode } from "./Node";

export class GraphTopologyListItem extends vscode.TreeItem {
    private _logger: Logger;
    private _graphTopologies: MediaGraphTopology[] = [];
    private _graphInstances: MediaGraphInstance[] = [];
    constructor(
        public iotHubData: IotHubData,
        private readonly _moduleDetails: ModuleDetails,
        private readonly _collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
    ) {
        super(Localizer.localize("graphTopologyListTreeItem"), _collapsibleState);
        this.contextValue = "graphListContext";
        this._logger = Logger.getOrCreateOutputChannel();
    }

    public async loadInstances() {
        try {
            this._graphInstances = await StreamData.getStream(this.iotHubData, this._moduleDetails);
        } catch (error) {
            Promise.reject(error);
        }
    }

    public getChildren(): Promise<INode[]> | INode[] {
        return new Promise((resolve, reject) => {
            if (this._graphInstances)
                TopologyData.getTopologies(this.iotHubData, this._moduleDetails).then(
                    (graphTopologies) => {
                        this._graphTopologies = graphTopologies;
                        resolve(
                            graphTopologies?.map((topology) => {
                                return new GraphTopologyItem(this.iotHubData, this._moduleDetails, topology, this._graphInstances ?? [], undefined);
                            })
                        );
                    },
                    (error) => {
                        const errorNode = new vscode.TreeItem(Localizer.localize("getAllGraphsFailedError"), vscode.TreeItemCollapsibleState.None);
                        const errorList = GraphEditorPanel.parseDirectMethodError(error);
                        this._logger.logError(`${Localizer.localize("getAllGraphsFailedError")}`, errorList, false);
                        resolve([errorNode as INode]);
                    }
                );
        });
    }

    public createNewGraphCommand(context: vscode.ExtensionContext) {
        const graphItem = new GraphTopologyItem(this.iotHubData, this._moduleDetails, undefined, undefined, (name) => {
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
