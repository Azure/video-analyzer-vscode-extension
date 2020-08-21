// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { IotHubData } from "../Data/IotHubData";
import { TreeUtils } from "../Util/TreeUtils";
import { INode } from "./Node";

export class IoTHubLabelNode extends vscode.TreeItem implements INode {
    constructor(public iotHubData: IotHubData, private readonly _hubName: string) {
        super(_hubName, vscode.TreeItemCollapsibleState.None);
        this.iconPath = TreeUtils.getThemedIconPath("iothub");
        this.contextValue = "hubItemContext";
    }

    public getChildren(): Promise<INode[]> | INode[] {
        return [];
    }
}
