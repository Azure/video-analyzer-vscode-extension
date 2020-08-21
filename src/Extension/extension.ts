import * as vscode from "vscode";
import { GraphTopologyItem } from "./ModuleExplorerPanel/GraphTopologyItem";
import { GraphTopologyListItem } from "./ModuleExplorerPanel/GraphTopologyListItem";
import { InstanceItem } from "./ModuleExplorerPanel/InstanceItem";
import { InstanceListItem } from "./ModuleExplorerPanel/InstanceListItem";
import ModuleExplorer from "./ModuleExplorerPanel/ModuleExplorer";
import { Constants } from "./Util/Constants";
import { CredentialStore } from "./Util/CredentialStore";
import Localizer from "./Util/Localizer";

export async function activate(context: vscode.ExtensionContext) {
    const locale = JSON.parse(process.env.VSCODE_NLS_CONFIG || "{}")["locale"];
    Localizer.loadLocalization(locale, context.extensionPath);

    const moduleExplorer = new ModuleExplorer(context);
    vscode.window.registerTreeDataProvider("moduleExplorer", moduleExplorer);

    const config = await CredentialStore.getConnectionInfo(context);
    if (config) {
        moduleExplorer.setConnectionString(config);
    }

    Constants.initialize(context);

    context.subscriptions.push(
        vscode.commands.registerCommand("moduleExplorer.setConnectionString", () => {
            moduleExplorer.setConnectionString();
        }),
        vscode.commands.registerCommand("moduleExplorer.createGraph", (graphListItem: GraphTopologyListItem) => {
            graphListItem.createNewGraphCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.createInstance", (instanceListItem: InstanceListItem) => {
            instanceListItem.createNewGraphInstanceCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.refresh", (element) => {
            moduleExplorer.refresh();
        }),
        vscode.commands.registerCommand("moduleExplorer.resetConnection", () => {
            moduleExplorer.resetConnectionString();
        }),
        vscode.commands.registerCommand("moduleExplorer.editGraph", (graphNode: GraphTopologyItem) => {
            graphNode.editGraphCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.deleteGraph", (graphNode: GraphTopologyItem) => {
            graphNode.deleteGraphCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.editInstance", (instanceNode: InstanceItem) => {
            instanceNode.editInstanceCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.activateInstance", (instanceNode: InstanceItem) => {
            instanceNode.activateInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.deactivateInstance", (instanceNode: InstanceItem) => {
            instanceNode.deactivateInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.deleteInstance", (instanceNode: InstanceItem) => {
            instanceNode.deleteInstanceCommand();
        })
    );
}
