import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import Localizer from "../Util/Localizer";
import { ModuleItem } from "./ModuleItem";
import { INode } from "./Node";

export class ModulesListItem extends vscode.TreeItem implements INode {
    constructor(
        public iotHubData: IotHubData,
        public readonly deviceId: string,
        private readonly _collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
    ) {
        super(Localizer.localize("modulesListTreeItem"), _collapsibleState);
    }

    public getChildren(lvaHubConfig: LvaHubConfig): Promise<INode[]> | INode[] {
        return new Promise((resolve, reject) => {
            const deviceConfigList = lvaHubConfig?.devices?.filter((device) => {
                return device.deviceId === this.deviceId;
            });
            if (!deviceConfigList || deviceConfigList!.length !== 1) {
                return reject("device Id unknown");
            }

            const deviceConfig = deviceConfigList[0];
            const moduleList: INode[] = [];
            const promiseList: Promise<void>[] = [];

            deviceConfig?.modules?.forEach(async (currentModuleId) => {
                const devicePromise = this.iotHubData.getModule(deviceConfig.deviceId, currentModuleId).then((module) => {
                    if (module) {
                        moduleList.push(
                            new ModuleItem(this.iotHubData, module.deviceId, module.moduleId, module.connectionState, vscode.TreeItemCollapsibleState.Expanded)
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
