import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { AvaHubConfig } from "../Util/ExtensionUtils";

export interface INode extends vscode.TreeItem {
    iotHubData?: IotHubData;
    getChildren(avaHubConfig: AvaHubConfig): Promise<INode[]> | INode[];
}
