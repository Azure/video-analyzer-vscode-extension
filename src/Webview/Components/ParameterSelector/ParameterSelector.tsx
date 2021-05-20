import React from "react";
import {
    DefaultButton,
    IIconProps,
    Panel,
    PanelType,
    PrimaryButton,
    SearchBox,
    Separator,
    Stack,
    Text
} from "@fluentui/react";
import { Dialog, DialogFooter, DialogType } from "@fluentui/react/lib/Dialog";
import { useBoolean } from "@uifabric/react-hooks";
import { IPropsAPI } from "@vienna/react-dag-editor";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/VideoAnalyzerSDKTypes";
import Localizer from "../../Localization/Localizer";
import {
    createParameter,
    deleteParameter,
    editParameter
} from "../ParameterEditor/createParameter";
import { ParameterEditorCreateForm } from "../ParameterEditor/ParameterEditorCreateForm";
import { EditableParameter } from "./EditableParameter";

export interface ParamCreateConfig extends MediaGraphParameterDeclaration {
    nameError?: string;
    defaultValueError?: string;
}

interface ParameterSelectorProps {
    isOpen: boolean;
    parameters: MediaGraphParameterDeclaration[];
    graph: any;
    propsApiRef: React.RefObject<IPropsAPI>;
    onClose: () => void;
}

export interface ParameterChangeValidation {
    nodeId: string;
    nodeName: string;
    localizationKey?: string;
    value: string[];
}

const addIcon: IIconProps = { iconName: "Add" };

export const ParameterSelector: React.FunctionComponent<ParameterSelectorProps> = (props) => {
    const { isOpen, onClose, parameters, graph, propsApiRef } = props;
    const [addNewIsShown, { toggle: toggleAddNewIsShown }] = useBoolean(false);
    const [showDeleteDialog, { toggle: toggleShowDeleteDialog }] = useBoolean(false);
    const [searchParameter, setSearchParameters] = React.useState<string>("");
    const [paramCreateConfig, setParamCreateConfig] = React.useState<ParamCreateConfig | undefined>();
    const [editedParameter, setEditedParameter] = React.useState<number>(-1);
    const [focusedDeleteParameter, setFocusedDeleteParameter] = React.useState<number>(-1);
    const [paramsThatWillChange, setParamsThatWillChange] = React.useState<ParameterChangeValidation[]>([]);

    const dialogContentProps = {
        type: DialogType.normal,
        title: Localizer.l("deleteParameterDialogTitle"),
        closeButtonAriaLabel: "Close",
        subText: Localizer.l("deleteParameterDialogText")
    };

    const searchFunction = (search: any) => {
        setSearchParameters(search);
    };

    const getParameters = () => {
        return parameters.filter((parameter: any) => {
            return parameter.name.toLowerCase().includes(searchParameter.toLowerCase());
        });
    };

    const onCreateFormAddClick = () => {
        if (paramCreateConfig?.name && paramCreateConfig?.type) {
            createParameter(paramCreateConfig, parameters); //TODO. check for duplicates
            toggleAddNewIsShown();
        }
    };

    const onEditParameterClick = (index: number) => {
        if (index >= 0 && addNewIsShown) {
            toggleAddNewIsShown();
        }
        setEditedParameter(index);
    };

    const onEditSaveParameterClick = (index: number) => {
        if (paramCreateConfig?.name && paramCreateConfig?.type) {
            if (paramCreateConfig.name != parameters[index].name) {
                graph.editParamsFromGraph(parameters[index].name, paramCreateConfig.name);
            }
            editParameter(paramCreateConfig, parameters, index);
        }
        setEditedParameter(-1);
    };

    const onDeleteParameterClick = (index: number) => {
        setFocusedDeleteParameter(index);
        toggleShowDeleteDialog();
        checkParameter(parameters[index]);
    };

    const onDeleteParameterDialogClick = () => {
        deleteParametersFromNodes(parameters[focusedDeleteParameter]);
        deleteParameter(focusedDeleteParameter, parameters);
        setFocusedDeleteParameter(-1);
        toggleShowDeleteDialog();
    };

    const checkParameter = (parameter: MediaGraphParameterDeclaration) => {
        const paramChanges = graph.checkForParamsInGraphNode(parameter.name);
        setParamsThatWillChange(paramChanges);
    };

    const deleteParametersFromNodes = (parameter: MediaGraphParameterDeclaration) => {
        graph.deleteParamsFromGraph(parameter);
    };

    const createParameterFields = () => {
        if (parameters) {
            return (
                <Stack style={{ paddingTop: "10px" }}>
                    {getParameters().map((p: any, idx: number) => {
                        return (
                            <EditableParameter
                                data={p}
                                key={idx}
                                id={idx}
                                showEdit={idx === editedParameter}
                                onDeleteParameterClick={onDeleteParameterClick}
                                onEditParameterClick={onEditParameterClick}
                                onEditSaveParameterClick={onEditSaveParameterClick}
                                setParameterCreationConfiguration={setParamCreateConfig}
                                parameters={parameters}
                            />
                        );
                    })}
                </Stack>
            );
        }
    };

    const buildNodeDrillDown = (node: any) => {
        let newString = node[0];
        for (let i = 2; i < node.length; i++) {
            newString += ` > ${node[i]}`;
        }

        return newString;
    };

    return (
        <div>
            <Dialog maxWidth="400px" hidden={!showDeleteDialog} onDismiss={toggleShowDeleteDialog} dialogContentProps={dialogContentProps}>
                {paramsThatWillChange.length > 0 ? (
                    <Stack>
                        <Stack style={{ paddingBottom: "10px" }}>
                            <Text variant="large">{Localizer.l("deleteParameterDialogLinkedProperties")}</Text>
                        </Stack>
                        <Stack>
                            {paramsThatWillChange.map((m1) => {
                                return (
                                    <Text key={m1.nodeId} variant="medium">
                                        {buildNodeDrillDown(m1.value)}
                                    </Text>
                                );
                            })}
                        </Stack>
                    </Stack>
                ) : (
                    ""
                )}
                <DialogFooter>
                    <PrimaryButton onClick={onDeleteParameterDialogClick} text={Localizer.l("editParametersRemoveButtonText")} />
                    <DefaultButton onClick={toggleShowDeleteDialog} text={Localizer.l("editParametersCancelButtonText")} />
                </DialogFooter>
            </Dialog>
            <Panel isOpen={isOpen} onDismiss={onClose} closeButtonAriaLabel="Close" type={PanelType.medium}>
                {addNewIsShown ? (
                    <Stack style={{ marginRight: 64 }}>
                        <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ flex: 1 }} variant={"large"}>
                                {Localizer.l("newParameter")}
                            </Text>
                            <Text variant={"medium"} style={{ textDecoration: "underline", cursor: "pointer" }} onClick={toggleAddNewIsShown}>
                                {Localizer.l("hideForm")}
                            </Text>
                        </Stack>
                        <Stack>
                            <ParameterEditorCreateForm setParamCreateConfig={setParamCreateConfig} parameters={parameters} />
                            <Stack style={{ paddingTop: "15px", paddingBottom: "10px", alignSelf: "flex-end" }}>
                                <DefaultButton
                                    text="Add"
                                    onClick={onCreateFormAddClick}
                                    disabled={!!(!paramCreateConfig?.name || paramCreateConfig?.nameError || paramCreateConfig?.defaultValueError)}
                                />
                            </Stack>
                        </Stack>
                        <Separator />
                    </Stack>
                ) : (
                    ""
                )}
                <Stack style={{ marginRight: 64 }}>
                    <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: "14px 0px 10px 0px" }}>
                        <Text style={{ flex: 1 }} variant={"large"}>
                            {Localizer.l("parameters")}
                        </Text>
                        {addNewIsShown ? (
                            ""
                        ) : (
                            <DefaultButton text={Localizer.l("parameterEditorParameterListAddButtonLabel")} iconProps={addIcon} onClick={toggleAddNewIsShown} />
                        )}
                    </Stack>

                    <SearchBox placeholder="Search" onSearch={searchFunction} />
                </Stack>
                {createParameterFields()}
            </Panel>
        </div>
    );
};
