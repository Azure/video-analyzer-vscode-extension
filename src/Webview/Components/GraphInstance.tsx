import { ITextField, Stack, TextField } from "office-ui-fabric-react";
import * as React from "react";
import { useBoolean } from "@uifabric/react-hooks";
import {
    CanvasMouseMode,
    ICanvasData,
    IPropsAPI,
    isSupported,
    IZoomPanSettings,
    ReactDagEditor,
    RegisterNode,
    RegisterPort,
    withDefaultPortsPosition
} from "@vienna/react-dag-editor";
import {
    MediaGraphInstance,
    MediaGraphParameterDeclaration
} from "../../Common/Types/LVASDKTypes";
import Localizer from "../Localization/Localizer";
import Graph from "../Models/GraphData";
import { GraphInstanceParameter } from "../Types/GraphTypes";
import { VSCodeSetState } from "../Types/VSCodeDelegationTypes";
import * as Constants from "../Utils/Constants";
import { ExtensionInteraction } from "../Utils/ExtensionInteraction";
import { ContextMenu } from "./ContextMenu";
import { InnerGraph } from "./InnerGraph";
import { NodeBase } from "./NodeBase";
import { ParameterPanel } from "./ParameterPanel";
import { modulePort } from "./Port";
import { Toolbar } from "./Toolbar";

interface IGraphInstanceProps {
    graph: Graph;
    zoomPanSettings: IZoomPanSettings;
    instance: MediaGraphInstance;
    vsCodeSetState: VSCodeSetState;
}

export const GraphInstance: React.FunctionComponent<IGraphInstanceProps> = (props) => {
    const { graph, instance } = props;
    const [data, setData] = React.useState<ICanvasData>(graph.getICanvasData());
    const [zoomPanSettings, setZoomPanSettings] = React.useState<IZoomPanSettings>(props.zoomPanSettings);
    const [graphInstanceName, setGraphInstanceName] = React.useState<string>(instance.name);
    const [graphDescription, setGraphDescription] = React.useState<string>((instance.properties && instance.properties.description) || "");
    const [graphNameError, setGraphNameError] = React.useState<string>("");
    const [sidebarIsShown, { toggle: setSidebarIsShown }] = useBoolean(true);

    let initialParams: GraphInstanceParameter[] = [];
    if (graph.getTopology().properties && graph.getTopology().properties!.parameters) {
        initialParams = graph.getTopology().properties!.parameters!.map((param: MediaGraphParameterDeclaration) => {
            let defaultValue = param.default || "";
            if (instance.properties && instance.properties.parameters) {
                const matches = instance.properties.parameters.filter((parameter) => parameter.name === param.name);
                if (matches) {
                    defaultValue = matches[0].value;
                }
            }
            return {
                name: param.name,
                defaultValue,
                value: "",
                type: param.type,
                error: ""
            };
        });
    }
    const [parameters, setParametersInternal] = React.useState<GraphInstanceParameter[]>(initialParams);

    const propsApiRef = React.useRef<IPropsAPI>(null);
    const nameTextFieldRef = React.useRef<ITextField>(null);

    // save state in VS Code when data, zoomPanSettings, or parameters change
    const saveState = (update?: any) => {
        props.vsCodeSetState({
            pageViewType: Constants.PageType.instancePage,
            graphData: { ...data, meta: graph.getTopology() },
            zoomPanSettings,
            instance: generateInstance(),
            ...update // in case we want to force changes
        });
    };
    const setParameters = (parameters: GraphInstanceParameter[]) => {
        setParametersInternal(parameters);
        // the above might not update parameters immediately
        saveState({
            instance: generateInstance()
        });
    };
    React.useEffect(() => {
        saveState();
    }, [data, zoomPanSettings, graphInstanceName, graphDescription]);
    React.useEffect(() => {
        // on mount
        if (nameTextFieldRef) {
            nameTextFieldRef.current?.focus();
        }
    }, []);

    if (!isSupported()) {
        return <h1>{Localizer.l("browserNotSupported")}</h1>;
    }

    const generateInstance = (): MediaGraphInstance => {
        return {
            name: graphInstanceName,
            properties: {
                topologyName: graph.getName(),
                description: graphDescription,
                parameters: parameters
                    .filter((parameter) => parameter.value.length > 0)
                    .map((parameter) => ({
                        name: parameter.name,
                        value: parameter.value
                    }))
            }
        };
    };

    const saveInstance = () => {
        if (canContinue()) {
            const vscode = ExtensionInteraction.getVSCode();
            if (vscode) {
                vscode.postMessage({
                    command: Constants.PostMessageNames.saveInstance,
                    text: generateInstance()
                });
            } else {
                // running in browser
                console.log(generateInstance());
            }
        }
    };
    const saveAndStartAction = {
        text: Localizer.l("saveAndActivateButtonText"),
        callback: () => {
            if (canContinue()) {
                const vscode = ExtensionInteraction.getVSCode();
                if (vscode) {
                    vscode.postMessage({
                        command: Constants.PostMessageNames.saveAndActivate,
                        text: generateInstance()
                    });
                } else {
                    // running in browser
                    console.log(generateInstance());
                }
            }
        }
    };

    const validateName = (name: string) => {
        if (!name) {
            setGraphNameError(Localizer.l("sidebarGraphInstanceNameMissing"));
        } else {
            setGraphNameError("");
        }
    };
    const onNameChange = (event: React.FormEvent, newValue?: string) => {
        if (typeof newValue !== "undefined") {
            setGraphInstanceName(newValue);
            validateName(newValue);
        }
    };
    const onDescriptionChange = (event: React.FormEvent, newValue?: string) => {
        if (typeof newValue !== "undefined") {
            setGraphDescription(newValue);
        }
    };

    const canContinue = () => {
        validateName(graphInstanceName);
        const nameIsEmpty = graphInstanceName.length === 0;
        if (nameIsEmpty) {
            nameTextFieldRef.current!.focus();
        }
        let missingParameter = false;
        parameters.forEach((parameter, index) => {
            if (!parameter.defaultValue && !parameter.value) {
                missingParameter = true;
                parameter.error = Localizer.l("sidebarGraphInstanceParameterMissing");
            }
        });
        setParameters(parameters);
        return !nameIsEmpty && !missingParameter;
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
            <RegisterNode name="module" config={withDefaultPortsPosition(new NodeBase(/* readOnly */ true))} />
            <RegisterPort name="modulePort" config={modulePort} />
            <Stack styles={{ root: { height: "100vh" } }}>
                <Toolbar
                    name={graphInstanceName}
                    primaryAction={saveInstance}
                    secondaryAction={saveAndStartAction}
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
                />
                <Stack grow horizontal styles={mainEditorStyles}>
                    {sidebarIsShown && (
                        <Stack.Item styles={panelStyles}>
                            <div style={topSidebarStyles}>
                                <TextField
                                    label={Localizer.l("sidebarGraphInstanceNameLabel")}
                                    required
                                    value={graphInstanceName}
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
                                <ParameterPanel parameters={parameters} setParameters={setParameters} />
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
                            readOnly
                            propsApiRef={propsApiRef}
                        />
                    </Stack.Item>
                </Stack>
            </Stack>
            <ContextMenu />
        </ReactDagEditor>
    );
};
