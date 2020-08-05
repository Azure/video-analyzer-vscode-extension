import * as vscode from "vscode";
import { MediaGraphInstance } from "../lva-sdk/lvaSDKtypes";
import { LvaHubConfig } from "../Util/ExtensionUtils";
import { INode } from "./Node";

export class InstanceItem extends vscode.TreeItem {
    constructor(public readonly graphInstance: MediaGraphInstance) {
        super(graphInstance.name, vscode.TreeItemCollapsibleState.None);
    }

    get tooltip(): string {
        return `Graph instance ${this.label}: ${this.description}`;
    }

    iconPath = new vscode.ThemeIcon("primitive-dot");

    public getChildren(lvaHubConfig: LvaHubConfig): Promise<INode[]> | INode[] {
        return Promise.resolve([]);
    }
}
