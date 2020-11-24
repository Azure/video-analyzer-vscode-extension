// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as path from "path";
import * as vscode from "vscode";
import { Constants } from "./Constants";

export class TreeUtils {
    public static getIconPath(iconName: string): string {
        return path.join(Constants.ResourcesFolderPath, "images", `${iconName}.svg`);
    }

    public static getThemedIconPath(iconName: string) {
        return {
            light: path.join(Constants.ResourcesFolderPath, "images", "light", `${iconName}.svg`),
            dark: path.join(Constants.ResourcesFolderPath, "images", "dark", `${iconName}.svg`)
        };
    }

    public static refresh() {
        vscode.commands.executeCommand("moduleExplorer.refresh");
    }
}
