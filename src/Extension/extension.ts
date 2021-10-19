import * as vscode from "vscode";
import { LivePipelineItem } from "./ModuleExplorerPanel/LivePipelineItem";
import ModuleExplorer from "./ModuleExplorerPanel/ModuleExplorer";
import { RemoteDeviceAdapterItem } from "./ModuleExplorerPanel/RemoteDeviceAdapterItem";
import { RemoteDeviceAdapterListItem } from "./ModuleExplorerPanel/RemoteDeviceAdapterListItem";
import { TopologyItem } from "./ModuleExplorerPanel/TopologyItem";
import { TopologyListItem } from "./ModuleExplorerPanel/TopologyListItem";
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
        vscode.commands.registerCommand("moduleExplorer.createGraph", (graphListNode: TopologyListItem) => {
            graphListNode.createNewGraphCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.createInstance", (graphNode: TopologyItem) => {
            graphNode.createNewGraphInstanceCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.refresh", (element) => {
            moduleExplorer.refresh();
        }),
        vscode.commands.registerCommand("moduleExplorer.resetConnection", () => {
            moduleExplorer.resetConnectionString();
        }),
        vscode.commands.registerCommand("moduleExplorer.editGraph", (graphNode: TopologyItem) => {
            graphNode.setGraphCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.deleteGraph", (graphNode: TopologyItem) => {
            graphNode.deleteGraphCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.showTopologyJson", (graphNode: TopologyItem) => {
            graphNode.showTopologyJson();
        }),
        vscode.commands.registerCommand("moduleExplorer.editInstance", (instanceNode: LivePipelineItem) => {
            instanceNode.setInstanceCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.activateInstance", (instanceNode: LivePipelineItem) => {
            instanceNode.activateInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.deactivateInstance", (instanceNode: LivePipelineItem) => {
            instanceNode.deactivateInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.deleteInstance", (instanceNode: LivePipelineItem) => {
            instanceNode.deleteInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.showGraphInstanceJson", (instanceNode: LivePipelineItem) => {
            instanceNode.showLivePipelineJson();
        }),
        vscode.commands.registerCommand("moduleExplorer.topology.create", (graphListNode: TopologyListItem) => {
            graphListNode.createNewGraphCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.topology.edit", (graphNode: TopologyItem) => {
            graphNode.setGraphCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.topology.delete", (graphNode: TopologyItem) => {
            graphNode.deleteGraphCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.topology.showJson", (graphNode: TopologyItem) => {
            graphNode.showTopologyJson();
        }),
        vscode.commands.registerCommand("moduleExplorer.livePipeline.create", (graphNode: TopologyItem) => {
            graphNode.createNewGraphInstanceCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.livePipeline.edit", (instanceNode: LivePipelineItem) => {
            instanceNode.setInstanceCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.livePipeline.activate", (instanceNode: LivePipelineItem) => {
            instanceNode.activateInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.livePipeline.deactivate", (instanceNode: LivePipelineItem) => {
            instanceNode.deactivateInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.livePipeline.delete", (instanceNode: LivePipelineItem) => {
            instanceNode.deleteInstanceCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.livePipeline.showJson", (instanceNode: LivePipelineItem) => {
            instanceNode.showLivePipelineJson();
        }),
        vscode.commands.registerCommand("moduleExplorer.remoteDeviceAdapter.create", (remoteDeviceAdapter: RemoteDeviceAdapterListItem) => {
            remoteDeviceAdapter.createNewRemoteDeviceAdapterCommand(context);
        }),
        vscode.commands.registerCommand("moduleExplorer.remoteDeviceAdapter.delete", (remoteDeviceAdapter: RemoteDeviceAdapterItem) => {
            remoteDeviceAdapter.deleteRemoteDeviceAdapterCommand();
        }),
        vscode.commands.registerCommand("moduleExplorer.remoteDeviceAdapter.showJson", (remoteDeviceAdapter: RemoteDeviceAdapterItem) => {
            remoteDeviceAdapter.showRemoteDeviceAdapterJson();
        })
    );
}
