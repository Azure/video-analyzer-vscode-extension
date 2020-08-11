// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

"use strict";
import * as keytar from "keytar";
import { v4 as uuid } from "uuid";
import * as vscode from "vscode";
import { Constants } from "./constants";
import { DeviceConfig, LvaHubConfig } from "./ExtensionUtils";

interface CredentialLvaHubConfig {
    connectionStringKey: string;
    devices: DeviceConfig[];
}

export class CredentialStore {
    public static async getConnectionInfo(context: vscode.ExtensionContext): Promise<LvaHubConfig> {
        const connectionInfo: CredentialLvaHubConfig | undefined = context.globalState.get(Constants.LvaGlobalStateKey);
        if (!connectionInfo) {
            return (null as unknown) as LvaHubConfig;
        }
        let connectionString: string | undefined | null = "";
        try {
            connectionString = await keytar.getPassword(Constants.ExtensionId, connectionInfo.connectionStringKey);
        } catch (error) {
            connectionString = context.globalState.get(connectionInfo.connectionStringKey);
        }

        if (!connectionString) {
            return (null as unknown) as LvaHubConfig;
        }
        return { connectionString: connectionString as string, devices: connectionInfo.devices };
    }

    public static async setConnectionInfo(context: vscode.ExtensionContext, connectionInfo: LvaHubConfig) {
        const connectionKey = uuid();

        context.globalState.update(Constants.LvaGlobalStateKey, {
            connectionStringKey: connectionKey,
            devices: connectionInfo.devices
        });

        try {
            await keytar.setPassword(Constants.ExtensionId, connectionKey, connectionInfo.connectionString);
        } catch (error) {
            context.globalState.update(connectionKey, connectionInfo.connectionString);
        }
    }
}
