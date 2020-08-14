// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as path from "path";
import { Constants } from "./Constants";

export class TreeUtils {
    public static getIconPath(iconName: string): string {
        return path.join(Constants.ResourcesFolderPath, `${iconName}.svg`);
    }

    public static getThemedIconPath(iconName: string) {
        return {
            light: path.join(Constants.ResourcesFolderPath, "light", `${iconName}.svg`),
            dark: path.join(Constants.ResourcesFolderPath, "dark", `${iconName}.svg`)
        };
    }
}
