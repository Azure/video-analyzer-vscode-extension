import * as vscode from "vscode";
import {
    LivePipeline,
    MediaGraphInstanceState,
    PipelineTopology,
    RemoteDeviceAdapter
} from "../../Common/Types/VideoAnalyzerSDKTypes";
import { IotHubData } from "../Data/IotHubData";
import { LivePipelineData } from "../Data/LivePipelineData";
import { RemoteDeviceAdapterData } from "../Data/RemoteDeviceAdapterData";
import { Constants } from "../Util/Constants";
import { AvaHubConfig, ExtensionUtils } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { ModuleDetails } from "./ModuleItem";
import { INode } from "./Node";

export class RemoteDeviceAdapterItem extends vscode.TreeItem {
    private _logger: Logger;

    constructor(public iotHubData: IotHubData, private readonly _moduleDetails: ModuleDetails, private readonly _remoteDeviceAdapter?: RemoteDeviceAdapter) {
        super(_remoteDeviceAdapter?.name ?? "", vscode.TreeItemCollapsibleState.None);
        this._logger = Logger.getOrCreateOutputChannel();
        this.contextValue = `remoteDeviceAdapterContext`;
        this.iconPath = TreeUtils.getThemedIconPath("iothub");
    }

    public getChildren(avaHubConfig: AvaHubConfig): Promise<INode[]> | INode[] {
        return [];
    }

    public async deleteRemoteDeviceAdapterCommand() {
        if (this._remoteDeviceAdapter) {
            const allowDelete = await ExtensionUtils.showConfirmation(Localizer.localize("remoteDeviceAdapter.delete.confirmation"));
            if (allowDelete) {
                RemoteDeviceAdapterData.deleteRemoteDeviceAdapter(this.iotHubData, this._moduleDetails, this._remoteDeviceAdapter.name).then(
                    (response) => {
                        TreeUtils.refresh();
                        this._logger.showInformationMessage(`${Localizer.localize("remoteDeviceAdapter.delete.successMessage")} "${this._remoteDeviceAdapter?.name}"`);
                    },
                    (error) => {
                        const errorList = GraphEditorPanel.parseDirectMethodError(error);
                        this._logger.logError(`${Localizer.localize("remoteDeviceAdapter.delete.failedError")} "${this._remoteDeviceAdapter?.name}"`, errorList);
                    }
                );
            }
        }
    }

    public async showRemoteDeviceAdapterJson() {
        if (this._remoteDeviceAdapter) {
            vscode.workspace.openTextDocument({ language: "json", content: JSON.stringify(this._remoteDeviceAdapter, undefined, 4) }).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        }
    }
}
