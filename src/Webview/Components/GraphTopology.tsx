import {
    ActionButton,
    ITextField,
    Stack,
    TextField,
    VerticalDivider
} from "office-ui-fabric-react";
import React from "react";
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
import {
    GraphInfo,
    ServerError,
    ValidationError,
    ValidationErrorType
} from "../Types/GraphTypes";
import { VSCodeSetState } from "../Types/VSCodeDelegationTypes";
import * as Constants from "../Utils/Constants";
import { ExtensionInteraction } from "../Utils/ExtensionInteraction";
import PostMessage from "../Utils/PostMessage";
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

const GraphTopology: React.FunctionComponent<IGraphTopologyProps> = (props) => {
    const { graph, vsCodeSetState } = props;
    const [data, setData] = React.useState<ICanvasData>(graph.getICanvasData());
    const [dirty, setDirty] = React.useState<boolean>(false);
    const [zoomPanSettings, setZoomPanSettings] = React.useState<IZoomPanSettings>(props.zoomPanSettings);
    const [graphTopologyName, setGraphTopologyName] = React.useState<string>(graph.getName());
    const [graphDescription, setGraphDescription] = React.useState<string>(graph.getDescription() || "");
    const [graphNameError, setGraphNameError] = React.useState<string>();
    const [validationErrors, setValidationErrors] = React.useState<ValidationError[]>([]);
    const [serverErrors, setServerErrors] = React.useState<ValidationError[]>([]);
    const [sidebarIsShown, { toggle: setSidebarIsShown }] = useBoolean(true);
    const [showValidationErrors, setShowValidationErrors] = React.useState<boolean>(false);
    let errorsFromResponse: ValidationError[] = [];

    const propsApiRef = React.useRef<IPropsAPI>(null);
    const nameTextFieldRef = React.useRef<ITextField>(null);
    let graphNameValidationError: ValidationError | undefined;

    // save state in VS Code when data or zoomPanSettings change
    React.useEffect(() => {
        graph.setName(graphTopologyName);
        graph.setDescription(graphDescription);
        vsCodeSetState({
            pageViewType: Constants.PageType.graphPage,
            graphData: { ...data, meta: graph.getTopology() } as GraphInfo,
            zoomPanSettings
        });
    }, [data, zoomPanSettings, graphTopologyName, graphDescription, graph, vsCodeSetState]);
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
        errorsFromResponse = [];
        canContinue([]).then((canSave: boolean) => {
            if (canSave) {
                graph.setName(graphTopologyName);
                graph.setDescription(graphDescription);
                graph.setGraphDataFromICanvasData(data);
                const topology = graph.getTopology();
                if (ExtensionInteraction.getVSCode()) {
                    PostMessage.sendMessageToParent(
                        { name: Constants.PostMessageNames.saveGraph, data: topology },
                        {
                            name: Constants.PostMessageNames.failedOperationReason,
                            onlyOnce: true,
                            callback: (errors: ServerError[]) => {
                                errorsFromResponse = errors.map((error) => {
                                    return {
                                        description: error.value,
                                        type: ValidationErrorType.ServerError,
                                        ...(error.nodeName && { nodeName: error.nodeName }),
                                        ...(error.nodeProperty && { property: [error.nodeProperty] })
                                    } as ValidationError;
                                });
                                canContinue(errorsFromResponse);
                            }
                        }
                    );
                } else {
                    // running in browser
                    console.log(topology);
                }
            }
        });
    };

    const validateName = (name: string) => {
        return new Promise<string>((resolve, reject) => {
            if (!name) {
                graphNameValidationError = { description: "sidebarGraphTopologyNameMissing", type: ValidationErrorType.MissingField };
                setGraphNameError(Localizer.l(graphNameValidationError.description));
                resolve();
                return;
            }
            if (ExtensionInteraction.getVSCode()) {
                PostMessage.sendMessageToParent(
                    {
                        name: Constants.PostMessageNames.nameAvailableCheck,
                        data: name
                    },
                    {
                        name: Constants.PostMessageNames.nameAvailableCheck,
                        callback: (nameAvailable: boolean, args) => {
                            graphNameValidationError = nameAvailable ? undefined : { description: "nameNotAvailableError", type: ValidationErrorType.NameAlreadyInUse };
                            setGraphNameError(nameAvailable ? "" : Localizer.l("nameNotAvailableError"));
                            args.resolve();
                        },
                        optionalParams: { resolve, reject },
                        onlyOnce: true
                    }
                );
            } else {
                graphNameValidationError = undefined;
                setGraphNameError(undefined);
                resolve();
            }
        });
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
    const canContinue = (errorsFromResponse?: ValidationError[]) => {
        if (errorsFromResponse) {
            // save errors in the state, to remember when canContinue is called by node triggerValidation
            setServerErrors(errorsFromResponse ?? []);
        }
        return new Promise<boolean>((resolve) => {
            const validationErrors: ValidationError[] = [];
            validateName(graphTopologyName).then(() => {
                if (graphNameValidationError) {
                    nameTextFieldRef.current!.focus();
                    validationErrors.push(graphNameValidationError);
                }
                graph.setGraphDataFromICanvasData(data);
                validationErrors.push(...graph.validate(propsApiRef, errorsFromResponse ?? serverErrors));
                setValidationErrors(validationErrors);
                resolve(!validationErrors.length);
            });
        });
    };

    const updateNodeName = (oldName: string, newName: string) => {
        propsApiRef.current?.updateData((prevData: ICanvasData) => {
            return {
                ...prevData,
                nodes: prevData.nodes.map((currNode) => {
                    if (currNode.name === oldName) {
                        return {
                            ...currNode,
                            name: newName
                        };
                    }
                    return currNode;
                })
            };
        });
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

    const validationErrorStyles: React.CSSProperties = {
        alignItems: "center",
        display: "flex",
        justifyContent: "flex-end",
        flex: 1,
        paddingRight: "5%"
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
                        if (ExtensionInteraction.getVSCode()) {
                            PostMessage.sendMessageToParent({
                                name: Constants.PostMessageNames.closeWindow
                            });
                        }
                    }}
                    toggleSidebar={setSidebarIsShown}
                    isSidebarShown={sidebarIsShown}
                >
                    <VerticalDivider styles={{ wrapper: { height: 30, alignSelf: "center" } }}></VerticalDivider>
                    <SampleSelectorTrigger setTopology={setTopology} hasUnsavedChanges={dirty} />
                    {validationErrors && validationErrors.length > 0 ? (
                        <Stack horizontal horizontalAlign="end" style={validationErrorStyles}>
                            <ActionButton
                                iconProps={{ iconName: "StatusErrorFull", style: { color: "var(--vscode-errorForeground)" } }}
                                onClick={toggleValidationErrorPanel}
                            >
                                <span style={{ color: "var(--vscode-errorForeground)" }}>
                                    {validationErrors.length === 1
                                        ? Localizer.l("toolbarValidationTextSingular").format(validationErrors.length)
                                        : Localizer.l("toolbarValidationTextPlural").format(validationErrors.length)}
                                    <u>{Localizer.l("ToolbarValidationErrors")}</u>
                                </span>
                            </ActionButton>
                        </Stack>
                    ) : (
                        ""
                    )}
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
                            triggerValidation={canContinue}
                            parameters={parameters}
                            propsApiRef={propsApiRef}
                            validationErrors={validationErrors}
                            showValidationErrors={showValidationErrors}
                            toggleValidationErrorPanel={toggleValidationErrorPanel}
                            updateNodeName={updateNodeName}
                        />
                    </Stack.Item>
                </Stack>
            </Stack>
            <ContextMenu />
        </ReactDagEditor>
    );
};

export default GraphTopology;
