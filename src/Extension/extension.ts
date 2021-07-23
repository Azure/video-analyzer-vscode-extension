import * as vscode from "vscode";
import { GraphTopologyItem } from "./ModuleExplorerPanel/GraphTopologyItem";
import { GraphTopologyListItem } from "./ModuleExplorerPanel/GraphTopologyListItem";
import { InstanceItem } from "./ModuleExplorerPanel/InstanceItem";
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

    const showNewExtensionButton = Localizer.localize("deprecationNoticeShowNewExtension");
    const newExtensionId = "ms-azuretools.azure-video-analyzer";
    vscode.window.showWarningMessage(Localizer.localize("deprecationNoticeMessage"), showNewExtensionButton).then((choice) => {
        if (choice === showNewExtensionButton) {
            vscode.env.openExternal(vscode.Uri.parse("vscode:extension/" + newExtensionId));
        }
    });

    Constants.initialize(context);

    context.subscriptions.push(
        vscode.commands.registerCommand("moduleExplorer.setConnectionString", () => {
            moduleExplorer.setConnectionString();
        }),
        vscode.commands.registerCommand("moduleExplorer.createGraph", (graphListNode: GraphTopologyListItem) => {
            graphListNode.createNewGraphCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.createInstance", (graphNode: GraphTopologyItem) => {
            graphNode.createNewGraphInstanceCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.refresh", (element) => {
            moduleExplorer.refresh();
        }),
        vscode.commands.registerCommand("moduleExplorer.resetConnection", () => {
            moduleExplorer.resetConnectionString();
        }),
        vscode.commands.registerCommand("moduleExplorer.editGraph", (graphNode: GraphTopologyItem) => {
            graphNode.setGraphCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.deleteGraph", (graphNode: GraphTopologyItem) => {
            graphNode.deleteGraphCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.showGraphJson", (graphNode: GraphTopologyItem) => {
            graphNode.showGraphJson();
        }),
        vscode.commands.registerCommand("moduleExplorer.editInstance", (instanceNode: InstanceItem) => {
            instanceNode.setInstanceCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.activateInstance", (instanceNode: InstanceItem) => {
            instanceNode.activateInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.deactivateInstance", (instanceNode: InstanceItem) => {
            instanceNode.deactivateInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.deleteInstance", (instanceNode: InstanceItem) => {
            instanceNode.deleteInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.showGraphInstanceJson", (instanceNode: InstanceItem) => {
            instanceNode.showGraphInstanceJson();
        })
    );
}
