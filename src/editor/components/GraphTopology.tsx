import { Stack, TextField } from "office-ui-fabric-react";
import * as React from "react";
import {
    CanvasMouseMode,
    ICanvasData,
    ICanvasNode,
    isSupported,
    IZoomPanSettings,
    ReactDagEditor,
    RegisterNode,
    RegisterPort,
    withDefaultPortsPosition
} from "@vienna/react-dag-editor";
import Graph from "../../graph/Graph";
import Localizer from "../../localization/Localizer";
import { graphTheme as theme } from "../editorTheme";
import { ContextMenu } from "./ContextMenu";
import { InnerGraph } from "./InnerGraph";
import { ItemPanel } from "./ItemPanel";
import { NodeBase } from "./NodeBase";
import { modulePort } from "./Port";
import { SampleSelectorTrigger } from "./SampleSelector/SampleSelectorTrigger";
import { Toolbar } from "./Toolbar";

interface IGraphTopologyProps {
    graph: Graph;
    zoomPanSettings: IZoomPanSettings;
    vsCodeSetState: (state: any) => void;
}

export const GraphTopology: React.FunctionComponent<IGraphTopologyProps> = (props) => {
    const { graph, vsCodeSetState } = props;
    const [data, setData] = React.useState<ICanvasData>(graph.getICanvasData());
    const [dirty, setDirty] = React.useState<boolean>(false);
    const [zoomPanSettings, setZoomPanSettings] = React.useState<IZoomPanSettings>(props.zoomPanSettings);
    const [graphTopologyName, setGraphTopologyName] = React.useState<string>(graph.getName());
    const [graphDescription, setGraphDescription] = React.useState<string>(graph.getDescription() || "");

    // save state in VS Code when data or zoomPanSettings change
    React.useEffect(() => {
        vsCodeSetState({
            graphData: { ...data, meta: graph.getTopology() },
            zoomPanSettings
        });
    }, [data, zoomPanSettings]);

    if (!isSupported()) {
        return <h1>{Localizer.l("browserNotSupported")}</h1>;
    }

    function setTopology(topology: any) {
        graph.setTopology(topology);
        setData(graph.getICanvasData());
        setDirty(false);
    }

    function onChange() {
        setDirty(true);
    }

    // nodeNames maps an ID to a name, is updated on node add/remove
    const nodeNames: Record<string, string> = {};
    data.nodes.forEach((node) => {
        nodeNames[node.id] = node.name || "";
    });
    const nodeAdded = (node: ICanvasNode) => {
        nodeNames[node.id] = node.name || "";
    };
    const nodesRemoved = (nodes: Set<string>) => {
        nodes.forEach((nodeId) => delete nodeNames[nodeId]);
    };
    const hasNodeWithName = (name: string) => {
        for (const nodeId in nodeNames) {
            if (nodeNames[nodeId] === name) {
                return true;
            }
        }
        return false;
    };

    const exportGraph = () => {
        graph.setName(graphTopologyName);
        graph.setDescription(graphDescription);
        graph.setGraphDataFromICanvasData(data);
        const topology = graph.getTopology();
        console.log(topology);
    };

    const onNameChange = (event: React.FormEvent, newValue?: string) => {
        if (newValue) {
            setGraphTopologyName(newValue);
        }
    };

    const onDescriptionChange = (event: React.FormEvent, newValue?: string) => {
        if (typeof newValue !== "undefined") {
            setGraphDescription(newValue);
        }
    };

    const panelStyles = {
        root: {
            boxSizing: "border-box" as const,
            overflowY: "auto" as const,
            willChange: "transform",
            height: "100vh",
            width: 300,
            background: "var(--vscode-editorWidget-background)",
            borderRight: "1px solid var(--vscode-editorWidget-border)"
        }
    };

    const panelItemStyles = {
        padding: 10
    };

    const topSidebarStyles = {
        padding: 10,
        borderBottom: "1px solid var(--vscode-editorWidget-border)",
        paddingBottom: 20,
        marginBottom: 10
    };

    return (
        <ReactDagEditor theme={theme}>
            <RegisterNode name="module" config={withDefaultPortsPosition(new NodeBase())} />
            <RegisterPort name="modulePort" config={modulePort} />
            <Stack horizontal>
                <Stack.Item styles={panelStyles}>
                    <div style={topSidebarStyles}>
                        <TextField
                            label={Localizer.l("sidebarGraphTopologyNameLabel")}
                            required
                            defaultValue={graphTopologyName}
                            placeholder={Localizer.l("sidebarGraphTopologyNamePlaceholder")}
                            onChange={onNameChange}
                        />
                        <TextField
                            label={Localizer.l("sidebarGraphDescriptionLabel")}
                            defaultValue={graphDescription}
                            placeholder={Localizer.l("sidebarGraphDescriptionPlaceholder")}
                            onChange={onDescriptionChange}
                        />
                    </div>
                    <div style={panelItemStyles}>
                        <SampleSelectorTrigger setTopology={setTopology} hasUnsavedChanges={dirty} />
                        <ItemPanel hasNodeWithName={hasNodeWithName} />
                    </div>
                </Stack.Item>
                <Stack.Item grow>
                    <Toolbar
                        name={graphTopologyName}
                        exportGraph={exportGraph}
                        closeEditor={() => {
                            alert("TODO: Close editor");
                        }}
                    />
                    <Stack.Item grow>
                        <InnerGraph
                            data={data}
                            setData={setData}
                            zoomPanSettings={zoomPanSettings}
                            setZoomPanSettings={setZoomPanSettings}
                            canvasMouseMode={CanvasMouseMode.pan}
                            onNodeAdded={nodeAdded}
                            onNodeRemoved={nodesRemoved}
                            onChange={onChange}
                        />
                    </Stack.Item>
                </Stack.Item>
            </Stack>
            <ContextMenu />
        </ReactDagEditor>
    );
};
