import * as vscode from "vscode";
import { GraphTopologyItem } from "./ModuleExplorerPanel/GraphTopologyItem";
import { HubItem } from "./ModuleExplorerPanel/HubItem";
import ModuleExplorer from "./ModuleExplorerPanel/ModuleExplorer";
import { CredentialStore } from "./Util/credentialStore";
import Localizer from "./Util/Localizer";
import { GraphEditorPanel } from "./Webview/GraphPanel";

export async function activate(context: vscode.ExtensionContext) {
    const locale = JSON.parse(process.env.VSCODE_NLS_CONFIG || "{}")["locale"];
    Localizer.loadLocalization(locale, context.extensionPath);

    context.subscriptions.push(
        vscode.commands.registerCommand("lvaTopologyEditor.start", (newGraphItem: GraphTopologyItem) => {
            //GraphEditorPanel.createOrShow(context.extensionPath);
            newGraphItem.createNewGraphCommand(context);
        })
    );

    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(GraphEditorPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                GraphEditorPanel.revive(webviewPanel, context.extensionPath);
            }
        });
    }

    const moduleExplorer = new ModuleExplorer(context);
    vscode.window.registerTreeDataProvider("moduleExplorer", moduleExplorer);

    const config = await CredentialStore.getConnectionInfo(context);
    if (config) {
        moduleExplorer.setConnectionString(config);
    }

    vscode.commands.registerCommand("moduleExplorer.setConnectionString", () => {
        moduleExplorer.setConnectionString();
    });

    context.subscriptions.push(
        vscode.commands.registerCommand("moduleExplorer.refresh", (element) => {
            moduleExplorer.refresh();
        }),

        vscode.commands.registerCommand("moduleExplorer.deleteHubItem", (node: HubItem) => {
            moduleExplorer.resetConnectionString();
        })
    );
}
