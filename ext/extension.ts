import * as vscode from "vscode";
import { GraphTopologyItem } from "./ModuleExplorerPanel/GraphTopologyItem";
import { HubItem } from "./ModuleExplorerPanel/HubItem";
import { InstanceItem } from "./ModuleExplorerPanel/InstanceItem";
import ModuleExplorer from "./ModuleExplorerPanel/ModuleExplorer";
import { CredentialStore } from "./Util/credentialStore";
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

    context.subscriptions.push(
        vscode.commands.registerCommand("moduleExplorer.setConnectionString", () => {
            moduleExplorer.setConnectionString();
        }),
        vscode.commands.registerCommand("lvaTopologyEditor.createGraph", (newGraphItem: GraphTopologyItem) => {
            newGraphItem.createNewGraphCommand(context);
        }),
        vscode.commands.registerCommand("lvaTopologyEditor.createInstance", (newGraphItem: InstanceItem) => {
            newGraphItem.createNewGraphInstanceCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.refresh", (element) => {
            moduleExplorer.refresh();
        }),
        vscode.commands.registerCommand("moduleExplorer.deleteHubItem", (node: HubItem) => {
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
        vscode.commands.registerCommand("moduleExplorer.deleteInstance", (instanceNode: InstanceItem) => {
            instanceNode.deleteInstanceCommand();
        })
    );
}
