import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { LvaHubConfig } from "../Util/ExtensionUtils";

export interface INode extends vscode.TreeItem {
    iotHubData?: IotHubData;
    getChildren(lvaHubConfig: LvaHubConfig): Promise<INode[]> | INode[];
}
