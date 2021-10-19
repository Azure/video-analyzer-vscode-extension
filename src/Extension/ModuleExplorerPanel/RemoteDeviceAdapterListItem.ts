import { Device } from "azure-iothub";
import * as vscode from "vscode";
import {
    LivePipeline,
    PipelineTopology
} from "../../Common/Types/VideoAnalyzerSDKTypes";
import { IotHubData } from "../Data/IotHubData";
import { LivePipelineData } from "../Data/LivePipelineData";
import { RemoteDeviceAdapterData } from "../Data/RemoteDeviceAdapterData";
import { TopologyData } from "../Data/TolologyData";
import { Constants } from "../Util/Constants";
import { AvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { Logger } from "../Util/Logger";
import { MultiStepInput } from "../Util/MultiStepInput";
import { TreeUtils } from "../Util/TreeUtils";
import { GraphEditorPanel } from "../Webview/GraphPanel";
import { ModuleDetails } from "./ModuleItem";
import { INode } from "./Node";
import { RemoteDeviceAdapterItem } from "./RemoteDeviceAdapterItem";
import { TopologyItem } from "./TopologyItem";

interface RemoteDeviceAdapterCreateModel {
    name: string;
    device: any;
    newDeviceId: string;
    host: string;
}

export class RemoteDeviceAdapterListItem extends vscode.TreeItem {
    private _logger: Logger;
    private _remoteDeviceAdapters: any[] = [];
    constructor(
        public iotHubData: IotHubData,
        private readonly _moduleDetails: ModuleDetails,
        private readonly _collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    ) {
        super(Localizer.localize("remoteDeviceAdapter.list.treeItem"), _collapsibleState);
        this.contextValue = `remoteAdapterListContext`;
        this._logger = Logger.getOrCreateOutputChannel();
        RemoteDeviceAdapterData.getRemoteDeviceAdapters(this.iotHubData, this._moduleDetails).then((adapters) => {
            this._remoteDeviceAdapters = adapters;
        });
    }

    public getChildren(): Promise<INode[]> | INode[] {
        return new Promise((resolve) => {
            if (!this._remoteDeviceAdapters?.length) {
                RemoteDeviceAdapterData.getRemoteDeviceAdapters(this.iotHubData, this._moduleDetails).then(
                    (adapters) => {
                        this._remoteDeviceAdapters = adapters;
                        resolve(
                            adapters?.map((remoteDeviceAdapter) => {
                                return new RemoteDeviceAdapterItem(this.iotHubData, this._moduleDetails, remoteDeviceAdapter);
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
            } else {
                resolve(
                    this._remoteDeviceAdapters.map((remoteDeviceAdapter) => {
                        return new RemoteDeviceAdapterItem(this.iotHubData, this._moduleDetails, remoteDeviceAdapter);
                    })
                );
            }
        });
    }

    public async createNewRemoteDeviceAdapterCommand(context: vscode.ExtensionContext) {
        const dataModel = (await this.collectRemoteDeviceAdapterCreateInputs(context)) as RemoteDeviceAdapterCreateModel;
        if (dataModel) {
            if (dataModel.newDeviceId) {
                await this.iotHubData.addDevice(dataModel.newDeviceId);
                dataModel.device = await this.iotHubData.getDevice(dataModel.newDeviceId);
            }
            const remoteDeviceAdapter = {
                name: dataModel.name,
                properties: {
                    target: { host: dataModel.host },
                    iotHubDeviceConnection: {
                        deviceId: (dataModel.device as any).deviceId,
                        credentials: {
                            "@type": "#Microsoft.VideoAnalyzer.SymmetricKeyCredentials",
                            key: (dataModel.device as any).authentication.symmetricKey.primaryKey
                        }
                    }
                }
            };
            return RemoteDeviceAdapterData.putRemoteDeviceAdapter(this.iotHubData, this._moduleDetails, remoteDeviceAdapter).then(
                () => {
                    TreeUtils.refresh();
                    this._logger.showInformationMessage(`${Localizer.localize("remoteDeviceAdapter.save.successMessage")} "${remoteDeviceAdapter?.name}"`);
                    return Promise.resolve();
                },
                (error) => {
                    const errorList = GraphEditorPanel.parseDirectMethodError(error, remoteDeviceAdapter);
                    this._logger.logError(`${Localizer.localize("remoteDeviceAdapter.save.failedError")} "${remoteDeviceAdapter.name}`, errorList);
                    return Promise.reject();
                }
            );
        }
    }

    private async collectRemoteDeviceAdapterCreateInputs(context: vscode.ExtensionContext) {
        const title = Localizer.localize("remoteDeviceAdapter.create");

        class MyButton implements vscode.QuickInputButton {
            constructor(public iconPath: { light: vscode.Uri; dark: vscode.Uri }, public tooltip: string) {}
        }

        const createNewDeviceButton = new MyButton(TreeUtils.getThemedIconPath("add") as any, Localizer.localize("remoteDeviceAdapter.create.deviceId.new.button"));

        const inputRemoteAdapterName = async (inputStep: MultiStepInput, dataModel: Partial<RemoteDeviceAdapterCreateModel>) => {
            dataModel.name = await inputStep.showInputBox({
                title,
                prompt: Localizer.localize("remoteDeviceAdapter.create.name.prompt"),
                step: 1,
                totalSteps: 3,
                validate: (value) =>
                    Promise.resolve(
                        this._remoteDeviceAdapters.find((adapter) => adapter.name === value)
                            ? Localizer.localize("remoteDeviceAdapter.create.name.existing.validation.error")
                            : ""
                    ),
                value: typeof dataModel.name === "string" ? dataModel.name : ""
            });

            return (input: MultiStepInput) => pickDeviceId(input, dataModel);
        };

        const pickDeviceId = async (inputStep: MultiStepInput, dataModel: Partial<RemoteDeviceAdapterCreateModel>) => {
            const devices = await this.iotHubData.getDevices();
            const iotDevices = devices?.filter((device) => !device.capabilities?.iotEdge);

            if (!iotDevices?.length) {
                return (input: MultiStepInput) => inputNewDeviceId(input, dataModel);
            }

            const pick = await inputStep.showQuickPick({
                title,
                step: 2,
                totalSteps: 3,
                placeholder: Localizer.localize("remoteDeviceAdapter.create.deviceId.pick.placeHolder"),
                items:
                    iotDevices?.map((device) => {
                        return { label: device.deviceId, device: device };
                    }) ?? [],
                activeItem: typeof dataModel.device !== "string" ? dataModel.device : undefined,
                buttons: [createNewDeviceButton]
            });

            if (pick instanceof MyButton) {
                return (input: MultiStepInput) => inputNewDeviceId(input, dataModel);
            }
            dataModel.device = (pick as any).device;
            return (input: MultiStepInput) => inputHostName(input, dataModel);
        };

        const inputNewDeviceId = async (inputStep: MultiStepInput, dataModel: Partial<RemoteDeviceAdapterCreateModel>) => {
            dataModel.newDeviceId = await inputStep.showInputBox({
                title,
                prompt: Localizer.localize("remoteDeviceAdapter.create.newDevice.prompt"),
                step: 3,
                totalSteps: 3,
                validate: (value) => {
                    return new Promise((resolve) => {
                        this.iotHubData.getDevices().then((devices) => {
                            if (devices?.find((adapter) => adapter.deviceId === value)) {
                                resolve(Localizer.localize("remoteDeviceAdapter.create.newDevice.existing.validation.error"));
                            } else if (!/^[A-Za-z0-9-:.+%_#*?!(),=@$']{0,128}$/.test(value)) {
                                resolve(Localizer.localize("remoteDeviceAdapter.create.newDevice.regex.validation.error"));
                            } else {
                                resolve("");
                            }
                        });
                    });
                },
                value: typeof dataModel.newDeviceId === "string" ? dataModel.newDeviceId : ""
            });

            return (input: MultiStepInput) => inputHostName(input, dataModel);
        };
        const inputHostName = async (inputStep: MultiStepInput, dataModel: Partial<RemoteDeviceAdapterCreateModel>) => {
            const extraSteps = dataModel.newDeviceId ? 1 : 0;
            dataModel.host = await inputStep.showInputBox({
                title,
                prompt: Localizer.localize("remoteDeviceAdapter.create.host.prompt"),
                step: 3 + extraSteps,
                totalSteps: 3 + extraSteps,
                validate: (value) => Promise.resolve(""),
                value: typeof dataModel.host === "string" ? dataModel.host : ""
            });
        };

        const dataModel = {} as Partial<RemoteDeviceAdapterCreateModel>;
        await MultiStepInput.run((input) => inputRemoteAdapterName(input, dataModel));
        return dataModel;
    }
}
