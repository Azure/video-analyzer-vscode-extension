import { Device, Module } from "azure-iothub";
import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "./Constants";
import Localizer from "./Localizer";

export interface LvaHubConfig {
    connectionString: string;
    devices: DeviceConfig[];
}

export interface DeviceConfig {
    deviceId: string;
    modules: string[];
}

interface DeviceQuickPickItem extends vscode.QuickPickItem {
    device: Device;
}

interface ModuleQuickPickItem extends vscode.QuickPickItem {
    module: Module;
}

export class ExtensionUtils {
    public static async setConnectionString() {
        return new Promise<{ iotHubData: IotHubData; lvaHubConfig: LvaHubConfig }>((resolve, reject) => {
            const inputBox = vscode.window.createInputBox();
            inputBox.ignoreFocusOut = true;
            inputBox.placeholder = Constants.ConnectionStringFormat[Constants.IotHubConnectionStringKey];
            inputBox.prompt = Localizer.localize("connectionString.prompt");
            inputBox.onDidAccept(async () => {
                const connectionString = inputBox.value;
                if (this.isValidConnectionString(Constants.IotHubConnectionStringKey, connectionString)) {
                    const iotHubData = new IotHubData(connectionString);
                    const device = await this.showDevicesInListDialog(iotHubData);

                    if (device) {
                        const module = await this.showModulesInListDialog(iotHubData, device.deviceId);
                        if (module) {
                            const lvaVersion = await iotHubData.getVersion(device.deviceId, module.moduleId);
                            if (lvaVersion) {
                                resolve({
                                    iotHubData: iotHubData,
                                    lvaHubConfig: { connectionString, devices: [{ deviceId: device.deviceId, modules: [module.moduleId] }] }
                                });
                            } else {
                                inputBox.validationMessage = Localizer.localize("iotHub.connectionString.moduleNotLVA");
                                inputBox.show();
                                reject();
                            }
                        }
                    }
                } else {
                    // TODO show readme how to get connection string from portal similar to what iot tools does.
                    inputBox.validationMessage =
                        Localizer.localize("iotHub.connectionString.validationMessageFormat") + Constants.ConnectionStringFormat[Constants.IotHubConnectionStringKey];
                    reject();
                    // TODO ideally, we should use formatted strings like {0} in the loc strings to replace these.
                }
            });

            inputBox.show();
        });
    }

    public static async showDevicesInListDialog(iotHubData: IotHubData) {
        const devices = await iotHubData.getDevices();
        if (!devices?.length) {
            vscode.window.showQuickPick<DeviceQuickPickItem>([], {
                placeHolder: Localizer.localize("deviceList.NoItems")
            });
            return null;
        }
        return vscode.window
            .showQuickPick<DeviceQuickPickItem>(
                devices.map((device) => {
                    return { label: device.deviceId, device: device };
                }),
                { canPickMany: false, ignoreFocusOut: true, placeHolder: Localizer.localize("deviceList.prompt") }
            )
            .then((selection) => {
                if (!selection) {
                    return;
                }
                return selection.device;
            });
    }

    public static async showModulesInListDialog(iotHubData: IotHubData, deviceId: string) {
        const modules = await iotHubData.getModules(deviceId);
        if (!modules) {
            vscode.window.showQuickPick<DeviceQuickPickItem>([], {
                placeHolder: Localizer.localize("moduleList.NoItems")
            });
            return null;
        }
        return vscode.window
            .showQuickPick<ModuleQuickPickItem>(
                modules.map((module) => {
                    return { label: module.moduleId, module: module };
                }),
                { canPickMany: false, ignoreFocusOut: true, placeHolder: Localizer.localize("moduleList.prompt") }
            )
            .then((selection) => {
                if (!selection) {
                    return;
                }
                return selection.module;
            });
    }

    public static getIoTHubName(iotHubConnectionString: string): string {
        const result = /^HostName=([^.]+)./.exec(iotHubConnectionString);
        return result ? result[1] : "";
    }

    private static isValidConnectionString(id: string, value: string): boolean {
        if (!value) {
            return false;
        }
        return Constants.ConnectionStringRegex[id].test(value);
    }
}
