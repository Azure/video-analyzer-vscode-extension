import * as vscode from "vscode";
import {
    LivePipeline,
    PipelineTopology
} from "../../Common/Types/VideoAnalyzerSDKTypes";
import { IotHubData } from "../Data/IotHubData";
import { LivePipelineData } from "../Data/LivePipelineData";
import { TopologyData } from "../Data/TolologyData";
import { Constants } from "../Util/Constants";
import { AvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { ModuleDetails } from "./ModuleItem";
import { INode } from "./Node";
import { TopologyItem } from "./TopologyItem";

export class TopologyListItem extends vscode.TreeItem {
    private _logger: Logger;
    private _graphTopologies: any[] = [];
    private _graphInstances: any[] = [];
    constructor(
        public iotHubData: IotHubData,
        private readonly _moduleDetails: ModuleDetails,
        private readonly _collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
    ) {
        super(Localizer.localize(_moduleDetails.legacyModule ? "graphTopologyListTreeItem" : "topology.list.treeItem"), _collapsibleState);
        this.contextValue = `${this._moduleDetails.legacyModule ? "graph" : "topology"}ListContext`;
        this._logger = Logger.getOrCreateOutputChannel();
    }

    public async loadInstances() {
        try {
            this._graphInstances = await LivePipelineData.getLivePipeline(this.iotHubData, this._moduleDetails);
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
                                return new TopologyItem(this.iotHubData, this._moduleDetails, topology, this._graphInstances ?? [], undefined);
                            })
                        );
                    },
                    (error) => {
                        const errorString = this._moduleDetails.legacyModule ? "getAllGraphsFailedError" : "topologies.getAll.failedError";
                        const errorNode = new vscode.TreeItem(Localizer.localize(errorString), vscode.TreeItemCollapsibleState.None);
                        const errorList = GraphEditorPanel.parseDirectMethodError(error);
                        this._logger.logError(`${Localizer.localize(errorString)}`, errorList, false);
                        resolve([errorNode as INode]);
                    }
                );
        });
    }

    public createNewGraphCommand(context: vscode.ExtensionContext) {
        const graphItem = new TopologyItem(this.iotHubData, this._moduleDetails, undefined, undefined, (name) => {
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
