import * as vscode from "vscode";
import {
    MediaGraphInstance,
    MediaGraphInstanceState,
    MediaGraphTopology
} from "../../Common/Types/LVASDKTypes";
import { GraphInstanceData } from "../Data/GraphInstanceData";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "../Util/Constants";
import { ExtensionUtils, LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { INode } from "./Node";

export class InstanceItem extends vscode.TreeItem {
    private _logger: Logger;

    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        public readonly moduleId: string,
        private readonly _graphTopology: MediaGraphTopology,
        private readonly _graphInstance?: MediaGraphInstance,
        private _nameCheckCallback?: (name: string) => boolean
    ) {
        super(_graphInstance?.name ?? Localizer.localize("createGraphInstanceButton"), vscode.TreeItemCollapsibleState.None);
        this._logger = Logger.getOrCreateOutputChannel();
        if (_graphInstance) {
            switch (_graphInstance.properties?.state) {
                case MediaGraphInstanceState.Active:
                    this.contextValue = "InstanceItemContextActive";
                    this.iconPath = TreeUtils.getIconPath(`Graph-Instance-Active`);
                    break;
                case MediaGraphInstanceState.Inactive:
                    this.contextValue = "InstanceItemContextInactive";
                    this.iconPath = TreeUtils.getIconPath(`Graph-Instance-Inactive`);
                    break;
                default:
                    this.contextValue = "InstanceItemContextProgress";
                    this.iconPath = TreeUtils.getIconPath(`Graph-Instance-Inactive`);
            }
        }
    }

    public getChildren(lvaHubConfig: LvaHubConfig): Promise<INode[]> | INode[] {
        return [];
    }

    public setInstanceCommand(context: vscode.ExtensionContext) {
        const logger = Logger.getOrCreateOutputChannel();
        const createGraphPanel = GraphEditorPanel.createOrShow(context, Localizer.localize(this._graphInstance ? "editInstancePageTile" : "createNewInstancePageTile"));
        if (createGraphPanel) {
            createGraphPanel.waitForPostMessage({
                name: Constants.PostMessageNames.closeWindow,
                callback: () => {
                    createGraphPanel.dispose();
                }
            });

            createGraphPanel.setupInitialMessage({
                pageType: Constants.PageTypes.instancePage,
                graphData: this._graphTopology,
                isHorizontal: createGraphPanel.isGraphAlignedToHorizontal(context),
                graphInstanceData: this._graphInstance,
                editMode: !!this._graphInstance
            });

            createGraphPanel.setupNameCheckMessage((name) => {
                return this._nameCheckCallback == null || this._nameCheckCallback(name);
            });

            createGraphPanel.waitForPostMessage({
                name: Constants.PostMessageNames.saveInstance,
                callback: async (instance: any) => {
                    this.saveInstance(createGraphPanel, instance);
                }
            });
            createGraphPanel.waitForPostMessage({
                name: Constants.PostMessageNames.saveAndActivate,
                callback: async (instance: MediaGraphInstance) => {
                    this.saveInstance(createGraphPanel, instance).then(() => {
                        return this.activateInstanceCommand(instance.name);
                    });
                }
            });
        }
    }

    public saveInstance(createGraphPanel: GraphEditorPanel, instance: MediaGraphInstance) {
        return GraphInstanceData.putGraphInstance(this.iotHubData, this.deviceId, this.moduleId, instance).then(
            (response) => {
                TreeUtils.refresh();
                createGraphPanel.dispose();
                this._logger.showInformationMessage(`${Localizer.localize("saveInstanceSuccessMessage")} "${instance?.name}"`);
                return Promise.resolve();
            },
            (error) => {
                const errorList = GraphEditorPanel.parseDirectMethodError(error, this._graphTopology);
                createGraphPanel.postMessage({ name: Constants.PostMessageNames.failedOperationReason, data: errorList });
                this._logger.logError(`${Localizer.localize("saveInstanceFailedError")} "${instance?.name}"`, errorList);
                return Promise.reject();
            }
        );
    }

    public activateInstanceCommand(graphInstanceName?: string) {
        const instanceName = graphInstanceName || this._graphInstance?.name;
        if (instanceName) {
            GraphInstanceData.activateGraphInstance(this.iotHubData, this.deviceId, this.moduleId, instanceName).then(
                (response) => {
                    TreeUtils.refresh();
                    this._logger.showInformationMessage(`${Localizer.localize("activateInstanceSuccessMessage")} "${instanceName}"`);
                },
                (error) => {
                    const errorList = GraphEditorPanel.parseDirectMethodError(error);
                    this._logger.logError(`${Localizer.localize("activateInstanceFailedError")} "${instanceName}"`, errorList);
                }
            );
        }
    }

    public deactivateInstanceCommand() {
        if (this._graphInstance) {
            GraphInstanceData.deactivateGraphInstance(this.iotHubData, this.deviceId, this.moduleId, this._graphInstance.name).then(
                (response) => {
                    TreeUtils.refresh();
                    this._logger.showInformationMessage(`${Localizer.localize("deactivateInstanceSuccessMessage")} "${this._graphInstance?.name}"`);
                },
                (error) => {
                    const errorList = GraphEditorPanel.parseDirectMethodError(error);
                    this._logger.logError(`${Localizer.localize("deactivateInstanceFailedError")} "${this._graphInstance?.name}"`, errorList);
                }
            );
        }
    }

    public async deleteInstanceCommand() {
        if (this._graphInstance) {
            const allowDelete = await ExtensionUtils.showConfirmation(Localizer.localize("deleteInstanceConfirmation"));
            if (allowDelete) {
                GraphInstanceData.deleteGraphInstance(this.iotHubData, this.deviceId, this.moduleId, this._graphInstance.name).then(
                    (response) => {
                        TreeUtils.refresh();
                        this._logger.showInformationMessage(`${Localizer.localize("deleteInstanceSuccessMessage")} "${this._graphInstance?.name}"`);
                    },
                    (error) => {
                        const errorList = GraphEditorPanel.parseDirectMethodError(error);
                        this._logger.logError(`${Localizer.localize("deleteInstanceFailedError")} "${this._graphInstance?.name}"`, errorList);
                    }
                );
            }
        }
    }

    public async showGraphInstanceJson() {
        if (this._graphInstance) {
            vscode.workspace.openTextDocument({ language: "json", content: JSON.stringify(this._graphInstance, undefined, 4) }).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        }
    }
}
