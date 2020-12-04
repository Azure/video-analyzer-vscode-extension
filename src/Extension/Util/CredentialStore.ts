// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

"use strict";
import * as keytarType from "keytar";
import { v4 as uuid } from "uuid";
import * as vscode from "vscode";
import { Constants } from "./Constants";
import { DeviceConfig, LvaHubConfig } from "./ExtensionUtils";

interface CredentialLvaHubConfig {
    connectionStringKey: string;
    devices: DeviceConfig[];
}

export class CredentialStore {
    private static keytar: typeof keytarType = CredentialStore.getCoreNodeModule("keytar");

    public static async getConnectionInfo(context: vscode.ExtensionContext): Promise<LvaHubConfig> {
        const connectionInfo: CredentialLvaHubConfig | undefined = context.globalState.get(Constants.LvaGlobalStateKey);
        if (!connectionInfo) {
            return (null as unknown) as LvaHubConfig;
        }
        let connectionString: string | undefined | null = "";
        try {
            if (this.keytar == null) {
                this.keytar = CredentialStore.getCoreNodeModule("keytar");
            }
            connectionString = await this.keytar.getPassword(Constants.ExtensionId, connectionInfo.connectionStringKey);
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
            if (this.keytar == null) {
                this.keytar = CredentialStore.getCoreNodeModule("keytar");
            }
            await this.keytar.setPassword(Constants.ExtensionId, connectionKey, connectionInfo.connectionString);
        } catch (error) {
            context.globalState.update(connectionKey, connectionInfo.connectionString);
        }
    }

    public static async resetConnectionInfo(context: vscode.ExtensionContext) {
        const connectionInfo: CredentialLvaHubConfig | undefined = context.globalState.get(Constants.LvaGlobalStateKey);
        context.globalState.update(Constants.LvaGlobalStateKey, null);
        if (connectionInfo) {
            try {
                if (this.keytar == null) {
                    this.keytar = CredentialStore.getCoreNodeModule("keytar");
                }
                await this.keytar.deletePassword(Constants.ExtensionId, connectionInfo.connectionStringKey);
            } catch (error) {
                context.globalState.update(connectionInfo.connectionStringKey, null);
            }
        }
    }

    /**
     * Helper function that returns a node module installed with VSCode, or null if it fails.
     */
    private static getCoreNodeModule(moduleName: string) {
        try {
            return require(`${vscode.env.appRoot}/node_modules.asar/${moduleName}`);
        } catch (err) {}

        try {
            return require(`${vscode.env.appRoot}/node_modules/${moduleName}`);
        } catch (err) {}

        return null;
    }
}
