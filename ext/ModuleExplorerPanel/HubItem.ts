import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import { DeviceItem } from "./DeviceItem";
import { INode } from "./Node";

export class HubItem extends vscode.TreeItem implements INode {
    constructor(public iotHubData: IotHubData, public readonly hubName: string) {
        super(hubName, vscode.TreeItemCollapsibleState.Expanded);
    }

    get tooltip(): string {
        return `Device ${this.label}`;
    }

    iconPath = new vscode.ThemeIcon("device-desktop");

    public getChildren(lvaHubConfig?: LvaHubConfig): Promise<INode[]> | INode[] {
        return new Promise((resolve, reject) => {
            const deviceList: INode[] = [];
            const promiseList: Promise<void>[] = [];
            lvaHubConfig?.devices?.forEach(async (currentDevice) => {
                const devicePromise = this.iotHubData.getDevice(currentDevice.deviceId).then((device) => {
                    if (device) {
                        deviceList.push(new DeviceItem(this.iotHubData, device.deviceId));
                    } else {
                        //TODO device not found error.
                    }
                });
                promiseList.push(devicePromise);
            });
            Promise.all(promiseList).finally(() => {
                resolve(deviceList);
            });
        });
    }
}
