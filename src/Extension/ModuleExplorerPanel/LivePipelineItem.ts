import * as vscode from "vscode";
import {
    LivePipeline,
    MediaGraphInstanceState,
    PipelineTopology
} from "../../Common/Types/LVASDKTypes";
import { IotHubData } from "../Data/IotHubData";
import { LivePipelineData } from "../Data/LivePipelineData";
import { Constants } from "../Util/Constants";
import { ExtensionUtils, LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { ModuleDetails } from "./ModuleItem";
import { INode } from "./Node";

export class LivePipelineItem extends vscode.TreeItem {
    private _logger: Logger;

    constructor(
        public iotHubData: IotHubData,
        private readonly _moduleDetails: ModuleDetails,
        private readonly _topology: PipelineTopology,
        private readonly _livePipeline?: LivePipeline,
        private _nameCheckCallback?: (name: string) => boolean
    ) {
        super(
            _livePipeline?.name ?? Localizer.localize(_moduleDetails.legacyModule ? "createGraphInstanceButton" : "livePipeline.create"),
            vscode.TreeItemCollapsibleState.None
        );
        this._logger = Logger.getOrCreateOutputChannel();
        const contextPrefix = this._moduleDetails.legacyModule ? "Instance" : "livePipeline";
        if (_livePipeline) {
            switch (_livePipeline.properties?.state) {
                case MediaGraphInstanceState.Active:
                    this.contextValue = `${contextPrefix}ItemContextActive`;
                    this.iconPath = TreeUtils.getIconPath(`Graph-Instance-Active`);
                    break;
                case MediaGraphInstanceState.Inactive:
                    this.contextValue = `${contextPrefix}ItemContextInactive`;
                    this.iconPath = TreeUtils.getIconPath(`Graph-Instance-Inactive`);
                    break;
                default:
                    this.contextValue = `${contextPrefix}ItemContextProgress`;
                    this.iconPath = TreeUtils.getIconPath(`Graph-Instance-Inactive`);
            }
        }
    }

    public getChildren(lvaHubConfig: LvaHubConfig): Promise<INode[]> | INode[] {
        return [];
    }

    public setInstanceCommand(context: vscode.ExtensionContext) {
        const logger = Logger.getOrCreateOutputChannel();
        const pageTitle = this._moduleDetails.legacyModule
            ? this._livePipeline
                ? "editInstancePageTile"
                : "createNewInstancePageTile"
            : this._livePipeline
            ? "livePipeline.edit.pageTitle"
            : "livePipeline.new.pageTitle";
        const createGraphPanel = GraphEditorPanel.createOrShow(context, Localizer.localize(pageTitle), this._moduleDetails);
        if (createGraphPanel) {
            createGraphPanel.waitForPostMessage({
                name: Constants.PostMessageNames.closeWindow,
                callback: () => {
                    createGraphPanel.dispose();
                }
            });

            createGraphPanel.setupInitialMessage({
                pageType: Constants.PageTypes.instancePage,
                graphData: this._topology,
                isHorizontal: createGraphPanel.isGraphAlignedToHorizontal(context),
                graphInstanceData: this._livePipeline,
                editMode: !!this._livePipeline
            });

            createGraphPanel.setupNameCheckMessage((name) => {
                return this._nameCheckCallback == null || this._nameCheckCallback(name);
            });

            createGraphPanel.waitForPostMessage({
                name: Constants.PostMessageNames.saveLivePipeline,
                callback: async (livePipeline: any) => {
                    this.saveInstance(createGraphPanel, livePipeline);
                }
            });
            createGraphPanel.waitForPostMessage({
                name: Constants.PostMessageNames.saveAndActivate,
                callback: async (instance: LivePipeline) => {
                    this.saveInstance(createGraphPanel, instance).then(() => {
                        return this.activateInstanceCommand(instance.name);
                    });
                }
            });
        }
    }

    public saveInstance(createGraphPanel: GraphEditorPanel, instance: LivePipeline) {
        return LivePipelineData.putLivePipeline(this.iotHubData, this._moduleDetails, instance).then(
            (response) => {
                TreeUtils.refresh();
                createGraphPanel.dispose();
                this._logger.showInformationMessage(
                    `${Localizer.localize(this._moduleDetails.legacyModule ? "saveInstanceSuccessMessage" : "livePipeline.save.successMessage")} "${instance?.name}"`
                );
                return Promise.resolve();
            },
            (error) => {
                const errorList = GraphEditorPanel.parseDirectMethodError(error, this._topology);
                const errorString = this._moduleDetails.legacyModule ? "saveInstanceFailedError" : "livePipeline.save.failedError";
                createGraphPanel.postMessage({ name: Constants.PostMessageNames.failedOperationReason, data: errorList });
                this._logger.logError(`${Localizer.localize(errorString)} "${instance?.name}"`, errorList);
                return Promise.reject();
            }
        );
    }

    public activateInstanceCommand(graphInstanceName?: string) {
        const instanceName = graphInstanceName || this._livePipeline?.name;
        if (instanceName) {
            LivePipelineData.startLivePipeline(this.iotHubData, this._moduleDetails, instanceName).then(
                (response) => {
                    TreeUtils.refresh();
                    this._logger.showInformationMessage(
                        `${Localizer.localize(
                            this._moduleDetails.legacyModule ? "activateInstanceSuccessMessage" : "livePipeline.activate.SuccessMessage"
                        )} "${instanceName}"`
                    );
                },
                (error) => {
                    const errorList = GraphEditorPanel.parseDirectMethodError(error);
                    const errorString = this._moduleDetails.legacyModule ? "activateInstanceFailedError" : "livePipeline.activate.failedError";
                    this._logger.logError(`${Localizer.localize(errorString)} "${instanceName}"`, errorList);
                }
            );
        }
    }

    public deactivateInstanceCommand() {
        if (this._livePipeline) {
            LivePipelineData.stopLivePipeline(this.iotHubData, this._moduleDetails, this._livePipeline.name).then(
                (response) => {
                    TreeUtils.refresh();
                    this._logger.showInformationMessage(
                        `${Localizer.localize(this._moduleDetails.legacyModule ? "deactivateInstanceSuccessMessage" : "livePipeline.deactivate.successMessage")} "${
                            this._livePipeline?.name
                        }"`
                    );
                },
                (error) => {
                    const errorList = GraphEditorPanel.parseDirectMethodError(error);
                    const errorString = this._moduleDetails.legacyModule ? "deactivateInstanceFailedError" : "livePipeline.deactivate.failedError";
                    this._logger.logError(`${Localizer.localize(errorString)} "${this._livePipeline?.name}"`, errorList);
                }
            );
        }
    }

    public async deleteInstanceCommand() {
        if (this._livePipeline) {
            const allowDelete = await ExtensionUtils.showConfirmation(
                Localizer.localize(this._moduleDetails.legacyModule ? "deleteInstanceConfirmation" : "livePipeline.delete.confirmation")
            );
            if (allowDelete) {
                LivePipelineData.deleteLivePipeline(this.iotHubData, this._moduleDetails, this._livePipeline.name).then(
                    (response) => {
                        TreeUtils.refresh();
                        this._logger.showInformationMessage(
                            `${Localizer.localize(this._moduleDetails.legacyModule ? "deleteInstanceSuccessMessage" : "livePipeline.delete.successMessage")} "${
                                this._livePipeline?.name
                            }"`
                        );
                    },
                    (error) => {
                        const errorList = GraphEditorPanel.parseDirectMethodError(error);
                        this._logger.logError(
                            `${Localizer.localize(this._moduleDetails.legacyModule ? "deleteInstanceFailedError" : "livePipeline.delete.failedError")} "${
                                this._livePipeline?.name
                            }"`,
                            errorList
                        );
                    }
                );
            }
        }
    }

    public async showLivePipelineJson() {
        if (this._livePipeline) {
            vscode.workspace.openTextDocument({ language: "json", content: JSON.stringify(this._livePipeline, undefined, 4) }).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        }
    }
}
