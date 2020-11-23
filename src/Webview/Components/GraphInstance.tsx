import {
    ActionButton,
    ITextField,
    Stack,
    TextField
} from "office-ui-fabric-react";
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
import {
    GraphInstanceParameter,
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
import { NodeBase } from "./NodeBase";
import { ParameterPanel } from "./ParameterPanel";
import { modulePort } from "./Port";
import { Toolbar } from "./Toolbar";

interface IGraphInstanceProps {
    graph: Graph;
    isEditMode: boolean;
    zoomPanSettings: IZoomPanSettings;
    instance: MediaGraphInstance;
    vsCodeSetState: VSCodeSetState;
}

const GraphInstance: React.FunctionComponent<IGraphInstanceProps> = (props) => {
    const { graph, instance, isEditMode } = props;
    const [data, setData] = React.useState<ICanvasData>(graph.getICanvasData());
    const [zoomPanSettings, setZoomPanSettings] = React.useState<IZoomPanSettings>(props.zoomPanSettings);
    const [instanceName, setInstanceName] = React.useState<string>(instance?.name ?? "");
    const [instanceDescription, setInstanceDescription] = React.useState<string>((instance?.properties && instance.properties.description) || "");
    const [instanceNameError, setInstanceNameError] = React.useState<string>();
    const [sidebarIsShown, { toggle: setSidebarIsShown }] = useBoolean(true);
    const [serverErrors, setServerErrors] = React.useState<ValidationError[]>([]);
    const [validationErrors, setValidationErrors] = React.useState<ValidationError[]>([]);
    const [showValidationErrors, setShowValidationErrors] = React.useState<boolean>(false);
    let errorsFromResponse: ValidationError[] = [];

    let instanceNameValidationError: ValidationError | undefined;

    let initialParams: GraphInstanceParameter[] = [];
    if (graph.getTopology().properties && graph.getTopology().properties!.parameters) {
        initialParams = graph.getTopology().properties!.parameters!.map((param: MediaGraphParameterDeclaration) => {
            let value = "";
            if (instance?.properties && instance.properties.parameters) {
                const matches = instance.properties.parameters.filter((parameter) => parameter.name === param.name);
                if (matches?.length) {
                    value = matches[0].value;
                }
            }
            return {
                name: param.name,
                defaultValue: param.default || "",
                value: value,
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
            editMode: isEditMode,
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
    }, [data, zoomPanSettings, instanceName, instanceDescription]);
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
            name: instanceName,
            properties: {
                topologyName: graph.getName(),
                description: instanceDescription,
                parameters: parameters
                    .filter((parameter) => parameter.value.length > 0)
                    .map((parameter) => ({
                        name: parameter.name,
                        value: parameter.value
                    }))
            }
        };
    };

    const saveInstance = (activate = false) => {
        errorsFromResponse = [];
        canContinue([]).then((canSave: boolean) => {
            if (canSave) {
                if (ExtensionInteraction.getVSCode()) {
                    PostMessage.sendMessageToParent(
                        {
                            name: activate ? Constants.PostMessageNames.saveAndActivate : Constants.PostMessageNames.saveInstance,
                            data: generateInstance()
                        },
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
                    console.log(generateInstance());
                }
            }
        });
    };

    const saveInstanceAction = () => {
        saveInstance(false);
    };

    const saveAndActivateAction = {
        text: Localizer.l("saveAndActivateButtonText"),
        callback: () => {
            saveInstance(true);
        }
    };

    const validateName = (name: string) => {
        return new Promise<string>((resolve, reject) => {
            if (!name) {
                instanceNameValidationError = { description: "sidebarGraphInstanceNameMissing", type: ValidationErrorType.MissingField };
                setInstanceNameError(Localizer.l(instanceNameValidationError.description));
                resolve("");
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
                            instanceNameValidationError = nameAvailable
                                ? undefined
                                : { description: "nameNotAvailableError", type: ValidationErrorType.NameAlreadyInUse };
                            setInstanceNameError(nameAvailable ? "" : Localizer.l("nameNotAvailableError"));
                            args.resolve();
                        },
                        optionalParams: { resolve, reject },
                        onlyOnce: true
                    }
                );
            } else {
                instanceNameValidationError = undefined;
                setInstanceNameError(undefined);
                resolve("");
            }
        });
    };

    const onNameChange = (event: React.FormEvent, newValue?: string) => {
        if (typeof newValue !== "undefined") {
            setInstanceName(newValue);
            validateName(newValue);
        }
    };
    const onDescriptionChange = (event: React.FormEvent, newValue?: string) => {
        if (typeof newValue !== "undefined") {
            setInstanceDescription(newValue);
        }
    };

    const canContinue = (errorsFromResponse?: ValidationError[]) => {
        if (errorsFromResponse) {
            // save errors in the state, to remember when canContinue is called by node triggerValidation
            setServerErrors(errorsFromResponse ?? []);
        }
        return new Promise<boolean>((resolve) => {
            validateName(instanceName).then(() => {
                const validationErrors: ValidationError[] = [];
                validationErrors.push(...(errorsFromResponse ?? serverErrors));
                if (instanceNameValidationError) {
                    nameTextFieldRef.current!.focus();
                    validationErrors.push({ type: ValidationErrorType.MissingField, description: "sidebarGraphInstanceNameMissing" });
                }
                let missingParameter = false;
                parameters.forEach((parameter, index) => {
                    if (!parameter.defaultValue && !parameter.value) {
                        missingParameter = true;
                        parameter.error = Localizer.l("sidebarGraphInstanceParameterMissing");
                        validationErrors.push({
                            type: ValidationErrorType.MissingParameterField,
                            description: "errorParameterPanelMissingText",
                            nodeName: parameter.name
                        });
                    }

                    //TODO. Scott. do the validation from the property key where param is being used. and add the errors here.
                });
                setValidationErrors(validationErrors);
                setParameters(parameters);
                resolve(!instanceNameValidationError && !missingParameter);
            });
        });
    };

    const toggleValidationErrorPanel = () => {
        setShowValidationErrors(!showValidationErrors);
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
            <RegisterNode name="module" config={withDefaultPortsPosition(new NodeBase(/* readOnly */ true))} />
            <RegisterPort name="modulePort" config={modulePort} />
            <Stack styles={{ root: { height: "100vh" } }}>
                <Toolbar
                    name={instanceName}
                    primaryAction={saveInstanceAction}
                    secondaryAction={isEditMode ? undefined : saveAndActivateAction}
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
                                    label={Localizer.l("sidebarGraphInstanceNameLabel")}
                                    required
                                    value={instanceName}
                                    readOnly={isEditMode}
                                    placeholder={Localizer.l("sidebarGraphNamePlaceholder")}
                                    errorMessage={instanceNameError}
                                    onChange={onNameChange}
                                    componentRef={nameTextFieldRef}
                                />
                                <TextField
                                    label={Localizer.l("sidebarGraphDescriptionLabel")}
                                    value={instanceDescription}
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
                            validationErrors={validationErrors}
                            showValidationErrors={showValidationErrors}
                            toggleValidationErrorPanel={toggleValidationErrorPanel}
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            updateNodeName={() => {}}
                        />
                    </Stack.Item>
                </Stack>
            </Stack>
            <ContextMenu />
        </ReactDagEditor>
    );
};

export default GraphInstance;
