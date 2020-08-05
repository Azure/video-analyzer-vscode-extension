import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import { ModuleItem } from "./ModuleItem";
import { INode } from "./Node";

export class DeviceItem extends vscode.TreeItem implements INode {
    constructor(public iotHubData: IotHubData, public readonly deviceId: string) {
        super(deviceId, vscode.TreeItemCollapsibleState.Expanded);
    }

    get tooltip(): string {
        return `Device ${this.label}`;
    }

    iconPath = new vscode.ThemeIcon("device-desktop");

    public getChildren(lvaHubConfig?: LvaHubConfig): Promise<INode[]> | INode[] {
        return new Promise((resolve, reject) => {
            const deviceConfig = lvaHubConfig?.devices?.filter((device) => {
                return device.deviceId === this.deviceId;
            })?.[0];

            const moduleList: INode[] = [];
            const promiseList: Promise<void>[] = [];
            deviceConfig?.modules?.forEach(async (currentModuleId) => {
                const devicePromise = this.iotHubData.getModule(deviceConfig.deviceId, currentModuleId).then((module) => {
                    if (module) {
                        moduleList.push(
                            new ModuleItem(this.iotHubData, module.deviceId, module.moduleId, module.connectionState, vscode.TreeItemCollapsibleState.Collapsed)
                        );
                    } else {
                        //TODO module not found error.
                    }
                });
                promiseList.push(devicePromise);
            });
            Promise.all(promiseList).finally(() => {
                resolve(moduleList);
            });
        });
    }
}
