import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { DeviceItem } from "./DeviceItem";
import { INode } from "./Node";

export class DeviceListItem extends vscode.TreeItem implements INode {
    constructor(public iotHubData: IotHubData) {
        super(Localizer.localize("devicesListTreeItem"), vscode.TreeItemCollapsibleState.Expanded);
    }

    public getChildren(lvaHubConfig: LvaHubConfig): Promise<INode[]> | INode[] {
        return new Promise((resolve, reject) => {
            const deviceList: INode[] = [];
            const promiseList: Promise<void>[] = [];
            lvaHubConfig.devices?.forEach(async (currentDevice) => {
                const devicePromise = this.iotHubData.getDevice(currentDevice.deviceId).then((device) => {
                    if (device) {
                        deviceList.push(new DeviceItem(this.iotHubData, device.deviceId, device.connectionState));
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
