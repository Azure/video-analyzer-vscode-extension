import { Stack, TextField } from "office-ui-fabric-react";
import * as React from "react";
import {
    CanvasMouseMode,
    ICanvasData,
    isSupported,
    IZoomPanSettings,
    ReactDagEditor,
    RegisterNode,
    RegisterPort,
    withDefaultPortsPosition
} from "@vienna/react-dag-editor";
import Graph from "../../graph/Graph";
import Localizer from "../../localization/Localizer";
import { MediaGraphInstance } from "../../lva-sdk/lvaSDKtypes";
import { GraphInstanceParameter } from "../../types/graphTypes";
import { graphTheme as theme } from "../editorTheme";
import { ContextMenu } from "./ContextMenu";
import { InnerGraph } from "./InnerGraph";
import { NodeBase } from "./NodeBase";
import { ParameterPanel } from "./ParameterPanel";
import { modulePort } from "./Port";
import { Toolbar } from "./Toolbar";

interface IGraphInstanceProps {
    graph: Graph;
    zoomPanSettings: IZoomPanSettings;
    parameters: GraphInstanceParameter[];
    vsCodeSetState: (state: any) => void;
}

export const GraphInstance: React.FunctionComponent<IGraphInstanceProps> = (props) => {
    const graph = props.graph;
    const [data, setData] = React.useState<ICanvasData>(graph.getICanvasData());
    const [zoomPanSettings, setZoomPanSettings] = React.useState<IZoomPanSettings>(props.zoomPanSettings);
    const [graphInstanceName, setGraphInstanceName] = React.useState<string>(graph.getName());
    const [graphDescription, setGraphDescription] = React.useState<string>("");

    let initialParams: GraphInstanceParameter[] = props.parameters;
    if (initialParams.length === 0 && graph.getTopology().properties && graph.getTopology().properties!.parameters) {
        initialParams = graph.getTopology().properties!.parameters!.map((param) => ({
            name: param.name,
            value: param.default || "",
            type: param.type
        }));
    }
    const [parameters, setParametersInternal] = React.useState<GraphInstanceParameter[]>(initialParams);

    // save state in VS Code when data, zoomPanSettings, or parameters change
    const saveState = (update?: any) => {
        props.vsCodeSetState({
            graphData: { ...data, meta: graph.getTopology() },
            zoomPanSettings,
            parameters,
            ...update // in case we want to force changes
        });
    };
    const setParameters = (parameters: GraphInstanceParameter[]) => {
        setParametersInternal(parameters);
        // the above might not update parameters immediately
        saveState({ parameters });
    };
    React.useEffect(() => {
        saveState();
    }, [data, zoomPanSettings]);

    if (!isSupported()) {
        return <h1>{Localizer.l("browserNotSupported")}</h1>;
    }

    const saveInstance = () => {
        const instance: MediaGraphInstance = {
            name: graphInstanceName,
            properties: {
                topologyName: graph.getName(),
                description: graphDescription,
                parameters: parameters
            }
        };
        console.log(instance);
    };

    const saveAndStartAction = {
        text: Localizer.l("saveAndStartButtonText"),
        callback: () => {
            saveInstance();
            console.log("And start");
        }
    };

    const onNameChange = (event: React.FormEvent, newValue?: string) => {
        if (newValue) {
            setGraphInstanceName(newValue);
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
                            label={Localizer.l("sidebarGraphInstanceNameLabel")}
                            required
                            defaultValue={graphInstanceName}
                            placeholder={Localizer.l("sidebarGraphInstanceNamePlaceholder")}
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
                        <ParameterPanel parameters={parameters} setParameters={setParameters} />
                    </div>
                </Stack.Item>
                <Stack.Item grow>
                    <Toolbar
                        name={graphInstanceName}
                        primaryAction={saveInstance}
                        secondaryAction={saveAndStartAction}
                        cancelAction={() => {
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
                            readOnly
                        />
                    </Stack.Item>
                </Stack.Item>
            </Stack>
            <ContextMenu />
        </ReactDagEditor>
    );
};
