import { Device, Module } from "azure-iothub";
import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { Constants } from "./Constants";

export interface LvaHubConfig {
    connectionString: string;
    devices: DeviceConfig[];
}

interface DeviceConfig {
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
            inputBox.prompt = "Enter an IoT Hub extension string"; //TODO localize;
            inputBox.onDidAccept(async () => {
                const connectionString = inputBox.value;
                if (!connectionString) {
                    return;
                }
                if (ExtensionUtils.isValidConnectionString(Constants.IotHubConnectionStringKey, connectionString)) {
                    const iotHubData = new IotHubData(connectionString);
                    const device = await ExtensionUtils.showDevicesInListDialog(iotHubData);

                    if (device) {
                        const module = await ExtensionUtils.showModulesInListDialog(iotHubData, device.deviceId);
                        if (module) {
                            resolve({
                                iotHubData: iotHubData,
                                lvaHubConfig: { connectionString, devices: [{ deviceId: device.deviceId, modules: [module.moduleId] }] }
                            });
                        }
                    }
                } else {
                    // TODO show readme how to get connection string from portal similar to what iot tools does.
                    inputBox.validationMessage = `The format should be "${Constants.ConnectionStringFormat[Constants.IotHubConnectionStringKey]}"`; // TODO localize
                }
            });
            inputBox.show();
        });
    }

    public static async showDevicesInListDialog(iotHubData: IotHubData) {
        const devices = await iotHubData.getDevices();
        if (!devices) {
            return;
        }
        return vscode.window
            .showQuickPick<DeviceQuickPickItem>(
                devices.map((device) => {
                    return { label: device.deviceId, device: device };
                }),
                { canPickMany: false, ignoreFocusOut: true, placeHolder: "Select a device" } //TODO localize
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
            return;
        }
        return vscode.window
            .showQuickPick<ModuleQuickPickItem>(
                modules.map((module) => {
                    return { label: module.moduleId, module: module };
                }),
                { canPickMany: false, ignoreFocusOut: true, placeHolder: "Select the live video analytics module" } // TODO localize
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
