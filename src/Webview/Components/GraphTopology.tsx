import { ITextField, Stack, TextField } from "office-ui-fabric-react";
import * as React from "react";
import { useBoolean } from "@uifabric/react-hooks";
import {
    CanvasMouseMode,
    GraphDataChangeType,
    ICanvasData,
    IGraphDataChangeEvent,
    IPropsAPI,
    isSupported,
    IZoomPanSettings,
    ReactDagEditor,
    RegisterNode,
    RegisterPort,
    withDefaultPortsPosition
} from "@vienna/react-dag-editor";
import { MediaGraphTopology } from "../../Common/Types/LVASDKTypes";
import Localizer from "../Localization/Localizer";
import Graph from "../Models/GraphData";
import { GraphInfo, ValidationError } from "../Types/GraphTypes";
import { VSCodeSetState } from "../Types/VSCodeDelegationTypes";
import * as Constants from "../Utils/Constants";
import { ExtensionInteraction } from "../Utils/ExtensionInteraction";
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
    const [graphNameError, setGraphNameError] = React.useState<string>("");
    const [validationErrors, setValidationErrors] = React.useState<ValidationError[]>([]);
    const [sidebarIsShown, { toggle: setSidebarIsShown }] = useBoolean(true);
    const [showValidationErrors, setShowValidationErrors] = React.useState<boolean>(false);

    const propsApiRef = React.useRef<IPropsAPI>(null);
    const nameTextFieldRef = React.useRef<ITextField>(null);

    // save state in VS Code when data or zoomPanSettings change
    React.useEffect(() => {
        graph.setName(graphTopologyName);
        graph.setDescription(graphDescription);
        vsCodeSetState({
            pageViewType: Constants.PageType.graphPage,
            graphData: { ...data, meta: graph.getTopology() } as GraphInfo,
            zoomPanSettings
        });
    }, [data, zoomPanSettings, graphTopologyName, graphDescription]);
    React.useEffect(() => {
        // on mount
        if (nameTextFieldRef) {
            nameTextFieldRef.current?.focus();
        }
    }, []);

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
        if (canContinue()) {
            graph.setName(graphTopologyName);
            graph.setDescription(graphDescription);
            graph.setGraphDataFromICanvasData(data);
            const topology = graph.getTopology();
            const vscode = ExtensionInteraction.getVSCode();
            if (vscode) {
                vscode.postMessage({ command: Constants.PostMessageNames.saveGraph, text: topology });
            } else {
                // running in browser
                console.log(topology);
            }
        }
    };

    const validateName = (name: string) => {
        if (!name) {
            setGraphNameError(Localizer.l("sidebarGraphTopologyNameMissing"));
        } else {
            setGraphNameError("");
        }
    };
    const onNameChange = (event: React.FormEvent, newValue?: string) => {
        if (typeof newValue !== "undefined") {
            setGraphTopologyName(newValue);
            validateName(newValue);
        }
    };
    const onDescriptionChange = (event: React.FormEvent, newValue?: string) => {
        if (typeof newValue !== "undefined") {
            setGraphDescription(newValue);
        }
    };

    const toggleValidationErrorPanel = () => {
        setShowValidationErrors(!showValidationErrors);
    };

    const parameters = graph.getParameters();
    const canContinue = () => {
        validateName(graphTopologyName);
        if (!graphTopologyName) {
            nameTextFieldRef.current!.focus();
        }
        graph.setGraphDataFromICanvasData(data);
        const validationErrors = graph.validate();
        const hasValidationErrors = validationErrors.length > 0;
        if (hasValidationErrors) {
            setValidationErrors(validationErrors);
        } else {
            setValidationErrors([]);
            setShowValidationErrors(false);
        }
        return graphTopologyName && !hasValidationErrors;
    };

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
        padding: 10,
        paddingTop: 0
    };
    const topSidebarStyles = {
        padding: 10,
        borderBottom: "1px solid var(--vscode-editorWidget-border)",
        paddingBottom: 20,
        marginBottom: 10
    };
    const mainEditorStyles = {
        root: {
            // uses flex-box, so it will grow, this prevents it from growing taller than the parent (force scroll)
            height: 0
        }
    };

    return (
        <ReactDagEditor theme={Constants.graphTheme}>
            <RegisterNode name="module" config={withDefaultPortsPosition(new NodeBase(/* readOnly */ false))} />
            <RegisterPort name="modulePort" config={modulePort} />
            <Stack styles={{ root: { height: "100vh" } }}>
                <Toolbar
                    name={graphTopologyName}
                    primaryAction={saveTopology}
                    cancelAction={() => {
                        const vscode = ExtensionInteraction.getVSCode();
                        if (vscode) {
                            vscode.postMessage({
                                command: Constants.PostMessageNames.closeWindow
                            });
                        }
                    }}
                    toggleSidebar={setSidebarIsShown}
                    isSidebarShown={sidebarIsShown}
                    validationErrors={validationErrors.length}
                    showValidationErrors={showValidationErrors}
                    toggleValidationErrorPanel={toggleValidationErrorPanel}
                >
                    <SampleSelectorTrigger setTopology={setTopology} hasUnsavedChanges={dirty} />
                </Toolbar>
                <Stack grow horizontal styles={mainEditorStyles}>
                    {sidebarIsShown && (
                        <Stack.Item styles={panelStyles}>
                            <div style={topSidebarStyles}>
                                <TextField
                                    label={Localizer.l("sidebarGraphTopologyNameLabel")}
                                    required
                                    value={graphTopologyName}
                                    placeholder={Localizer.l("sidebarGraphNamePlaceholder")}
                                    errorMessage={graphNameError}
                                    onChange={onNameChange}
                                    componentRef={nameTextFieldRef}
                                />
                                <TextField
                                    label={Localizer.l("sidebarGraphDescriptionLabel")}
                                    value={graphDescription}
                                    placeholder={Localizer.l("sidebarGraphDescriptionPlaceholder")}
                                    onChange={onDescriptionChange}
                                />
                            </div>
                            <div style={panelItemStyles}>
                                <ItemPanel />
                            </div>
                        </Stack.Item>
                    )}
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
                            validationErrors={validationErrors}
                            showValidationErrors={showValidationErrors}
                            toggleValidationErrorPanel={toggleValidationErrorPanel}
                        />
                    </Stack.Item>
                </Stack>
            </Stack>
            <ContextMenu />
        </ReactDagEditor>
    );
};
