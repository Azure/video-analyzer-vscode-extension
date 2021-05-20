import { Device } from "azure-iothub";
import * as vscode from "vscode";
import { LivePipeline } from "../../Common/Types/VideoAnalyzerSDKTypes";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import { AvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { INode } from "./Node";
import { TopologyListItem } from "./TopologyListItem";

export interface ModuleDetails {
    deviceId: string;
    moduleId: string;
    apiVersion: string;
    legacyModule: boolean;
    versionFolder: string;
}

export class ModuleItem extends vscode.TreeItem {
    private _logger: Logger;
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        private _connectionState: Device.ConnectionState | undefined,
        private readonly _collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
    ) {
        super(moduleId, _collapsibleState);

        const state = this._connectionState?.toLowerCase() === "connected" ? "on" : "off";
        this.iconPath = TreeUtils.getIconPath(`module-${state}`);
        this._logger = Logger.getOrCreateOutputChannel();
    }

    public getChildren(avaHubConfig?: AvaHubConfig, graphInstances?: LivePipeline[]): Promise<INode[]> | INode[] {
        return this.iotHubData.getVersion(this.deviceId, this.moduleId).then(
            async (versionDetails) => {
                try {
                    if (
                        versionDetails &&
                        ((versionDetails.legacy && Constants.LegacySupportedApiVersions.find((version) => version === versionDetails.apiVersion)) ||
                            (!versionDetails.legacy && Constants.SupportedApiVersions.find((version) => version === versionDetails.apiVersion)))
                    ) {
                        const topologyListItem = new TopologyListItem(
                            this.iotHubData,
                            {
                                deviceId: this.deviceId,
                                moduleId: this.moduleId,
                                apiVersion: versionDetails.apiVersion,
                                legacyModule: versionDetails.legacy,
                                versionFolder: versionDetails.versionFolder
                            },
                            this._collapsibleState
                        );
                        await topologyListItem.loadInstances();
                        return [topologyListItem];
                    } else {
                        return [new vscode.TreeItem(Localizer.localize("iotHub.connectionString.moduleNotLVA"), vscode.TreeItemCollapsibleState.None) as INode];
                    }
                } catch (error) {
                    const errorString = versionDetails?.legacy ? "getAllGraphsFailedError" : "topologies.getAll.failedError";
                    const errorNode = new vscode.TreeItem(Localizer.localize(errorString), vscode.TreeItemCollapsibleState.None);
                    const errorList = GraphEditorPanel.parseDirectMethodError(error);
                    this._logger.logError(`${Localizer.localize(errorString)}`, errorList, false);
                    return [errorNode as INode];
                }
            },
            () => {
                return [];
            }
        );
    }
}
