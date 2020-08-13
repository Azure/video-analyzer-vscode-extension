import { Stack, TextField } from "office-ui-fabric-react";
import * as React from "react";
import {
    CanvasMouseMode,
    GraphDataChangeType,
    ICanvasData,
    ICanvasNode,
    IGraphDataChangeEvent,
    IPropsAPI,
    isSupported,
    IZoomPanSettings,
    ReactDagEditor,
    RegisterNode,
    RegisterPort,
    withDefaultPortsPosition
} from "@vienna/react-dag-editor";
import { ExtensionInteraction } from "../../extension/extensionInteraction";
import Graph from "../../graph/Graph";
import Localizer from "../../localization/Localizer";
import { MediaGraphTopology } from "../../lva-sdk/lvaSDKtypes";
import { GraphInfo } from "../../types/graphTypes";
import { VSCodeSetState } from "../../types/vscodeDelegationTypes";
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
    vsCodeSetState: VSCodeSetState;
}

export const GraphTopology: React.FunctionComponent<IGraphTopologyProps> = (props) => {
    const { graph, vsCodeSetState } = props;
    const [data, setData] = React.useState<ICanvasData>(graph.getICanvasData());
    const [dirty, setDirty] = React.useState<boolean>(false);
    const [zoomPanSettings, setZoomPanSettings] = React.useState<IZoomPanSettings>(props.zoomPanSettings);
    const [graphTopologyName, setGraphTopologyName] = React.useState<string>(graph.getName());
    const [graphDescription, setGraphDescription] = React.useState<string>(graph.getDescription() || "");

    const propsApiRef = React.useRef<IPropsAPI>(null);

    // save state in VS Code when data or zoomPanSettings change
    React.useEffect(() => {
        graph.setName(graphTopologyName);
        graph.setDescription(graphDescription);
        vsCodeSetState({
            graphData: { ...data, meta: graph.getTopology() } as GraphInfo,
            zoomPanSettings
        });
    }, [data, zoomPanSettings, graphTopologyName, graphDescription]);

    if (!isSupported()) {
        return <h1>{Localizer.l("browserNotSupported")}</h1>;
    }

    function setTopology(topology: MediaGraphTopology) {
        graph.setTopology(topology);
        setGraphTopologyName(topology.name);
        if (topology.properties && topology.properties.description) {
            setGraphDescription(topology.properties.description);
        }
        setData(graph.getICanvasData());
        setDirty(false);
        if (propsApiRef.current) {
            propsApiRef.current.dismissSidePanel();
            propsApiRef.current.resetZoom();
        }
    }

    function onChange(ev: IGraphDataChangeEvent) {
        if (ev.type !== GraphDataChangeType.init) {
            /* TODO: this event fires on many events including node selection
               We should listen for a subset of those events, one of which has to be property changes.
               Because these are not done through the propsAPI, we can't do this right now. */
            setDirty(true);
        }
    }

    const saveTopology = () => {
        graph.setName(graphTopologyName);
        graph.setDescription(graphDescription);
        graph.setGraphDataFromICanvasData(data);
        const topology = graph.getTopology();
        const vscode = ExtensionInteraction.getVSCode();
        if (vscode) {
            vscode.postMessage({ command: "saveGraph", text: topology });
        }
        console.log(topology);
    };

    const onNameChange = (event: React.FormEvent, newValue?: string) => {
        if (typeof newValue !== "undefined") {
            setGraphTopologyName(newValue);
        }
    };

    const onDescriptionChange = (event: React.FormEvent, newValue?: string) => {
        if (typeof newValue !== "undefined") {
            setGraphDescription(newValue);
        }
    };

    const parameters = graph.getParameters();

    const panelStyles = {
        root: {
            boxSizing: "border-box" as const,
            overflowY: "auto" as const,
            willChange: "transform",
            width: 300,
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
            <Stack horizontal styles={{ root: { height: "100vh" } }}>
                <Stack.Item styles={panelStyles}>
                    <div style={topSidebarStyles}>
                        <TextField
                            label={Localizer.l("sidebarGraphTopologyNameLabel")}
                            required
                            value={graphTopologyName}
                            placeholder={Localizer.l("sidebarGraphNamePlaceholder")}
                            onChange={onNameChange}
                        />
                        <TextField
                            label={Localizer.l("sidebarGraphDescriptionLabel")}
                            value={graphDescription}
                            placeholder={Localizer.l("sidebarGraphDescriptionPlaceholder")}
                            onChange={onDescriptionChange}
                        />
                    </div>
                    <div style={panelItemStyles}>
                        <SampleSelectorTrigger setTopology={setTopology} hasUnsavedChanges={dirty} />
                        <ItemPanel />
                    </div>
                </Stack.Item>
                <Stack grow>
                    <Toolbar
                        name={graphTopologyName}
                        primaryAction={saveTopology}
                        primaryActionEnabled={graphTopologyName.length > 0}
                        cancelAction={() => {
                            const vscode = ExtensionInteraction.getVSCode();
                            if (vscode) {
                                vscode.postMessage({
                                    command: "closeWindow"
                                });
                            }
                        }}
                    />
                    <Stack.Item grow>
                        <InnerGraph
                            data={data}
                            setData={setData}
                            zoomPanSettings={zoomPanSettings}
                            setZoomPanSettings={setZoomPanSettings}
                            canvasMouseMode={CanvasMouseMode.pan}
                            onChange={onChange}
                            parameters={parameters}
                            propsApiRef={propsApiRef}
                        />
                    </Stack.Item>
                </Stack>
            </Stack>
            <ContextMenu />
        </ReactDagEditor>
    );
};
