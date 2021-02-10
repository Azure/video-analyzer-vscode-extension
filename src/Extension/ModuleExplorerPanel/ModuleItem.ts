import { Device } from "azure-iothub";
import * as vscode from "vscode";
import { MediaGraphInstance } from "../../Common/Types/LVASDKTypes";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { GraphTopologyListItem } from "./GraphTopologyListItem";
import { INode } from "./Node";

export interface ModuleDetails {
    deviceId: string;
    moduleId: string;
    lvaVersion: string;
    apiVersion: string;
    legacyModule: boolean;
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

    public getChildren(lvaHubConfig?: LvaHubConfig, graphInstances?: MediaGraphInstance[]): Promise<INode[]> | INode[] {
        return this.iotHubData.getVersion(this.deviceId, this.moduleId).then(
            async (versionDetails) => {
                try {
                    if (versionDetails && Constants.SupportedApiVersions.find((version) => version === versionDetails.apiVersion)) {
                        const topologyListItem = new GraphTopologyListItem(
                            this.iotHubData,
                            {
                                deviceId: this.deviceId,
                                moduleId: this.moduleId,
                                lvaVersion: versionDetails.version,
                                apiVersion: versionDetails.apiVersion,
                                legacyModule: versionDetails.legacy
                            },
                            this._collapsibleState
                        );
                        await topologyListItem.loadInstances();
                        return [topologyListItem];
                    } else {
                        return [new vscode.TreeItem(Localizer.localize("iotHub.connectionString.moduleNotLVA"), vscode.TreeItemCollapsibleState.None) as INode];
                    }
                } catch (error) {
                    const errorNode = new vscode.TreeItem(Localizer.localize("getAllGraphsFailedError"), vscode.TreeItemCollapsibleState.None);
                    const errorList = GraphEditorPanel.parseDirectMethodError(error);
                    this._logger.logError(`${Localizer.localize("getAllGraphsFailedError")}`, errorList, false);
                    return [errorNode as INode];
                }
            },
            () => {
                return [];
            }
        );
    }
}
