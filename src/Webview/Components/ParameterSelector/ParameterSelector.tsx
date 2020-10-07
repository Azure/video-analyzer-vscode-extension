import {
    DefaultButton,
    IIconProps,
    Panel,
    PrimaryButton,
    SearchBox,
    Stack,
    Text
} from "office-ui-fabric-react";
import {
    Dialog,
    DialogFooter,
    DialogType
} from "office-ui-fabric-react/lib/Dialog";
import React from "react";
import { useBoolean } from "@uifabric/react-hooks";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import {
    createParameter,
    deleteParameter,
    editParameter
} from "../ParameterEditor/createParameter";
import { ParameterEditorCreateForm } from "../ParameterEditor/ParameterEditorCreateForm";
import { EditableParameter } from "./EditableParameter";

interface ParameterSelectorProps {
    isOpen: boolean;
    parameters: any;
    graph: any;
    onClose: () => void;
}

export interface ParameterChangeValidation {
    nodeId: string;
    nodeName: string;
    value: string;
}

const addIcon: IIconProps = { iconName: "Add" };

export const ParameterSelector: React.FunctionComponent<ParameterSelectorProps> = (props) => {
    const { isOpen, onClose, parameters, graph } = props;
    const [addNewIsShown, { toggle: setAddNewIsShown }] = useBoolean(false);
    const [showDeleteDialog, { toggle: toggleShowDeleteDialog }] = useBoolean(false);
    const [searchParameter, setSearchParameters] = React.useState<string>("");
    const [parameterCreationConfiguration, setParameterCreationConfiguration] = React.useState<MediaGraphParameterDeclaration | undefined>();
    const [editedParameter, setEditedParameter] = React.useState<number>(-1);
    const [focusedDeleteParameter, setFocusedDeleteParameter] = React.useState<number>(-1);
    const [paramsThatWillChange, setParamsThatWillChange] = React.useState<ParameterChangeValidation[]>([]);

    const dialogContentProps = {
        type: DialogType.normal,
        title: "Delete parameter?",
        closeButtonAriaLabel: "Close",
        subText: "The following nodes will lose their parameters. Do you want to delete this parameter?"
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
        if (parameterCreationConfiguration?.name && parameterCreationConfiguration?.type) {
            createParameter(parameterCreationConfiguration, parameters); //TODO. check for duplicates
            setAddNewIsShown();
        }
    };

    const onEditParameterClick = (index: number) => {
        setEditedParameter(index);
    };

    const onEditSaveParameterClick = (index: number) => {
        if (parameterCreationConfiguration?.name && parameterCreationConfiguration?.type) {
            if (parameterCreationConfiguration.name != parameters[index].name) {
                graph.editParamsFromGraph(parameters[index].name, parameterCreationConfiguration.name);
            }
            editParameter(parameterCreationConfiguration, parameters, index);
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
                                setParameterCreationConfiguration={setParameterCreationConfiguration}
                            />
                        );
                    })}
                </Stack>
            );
        }
    };

    return (
        <div>
            <Dialog hidden={!showDeleteDialog} onDismiss={toggleShowDeleteDialog} dialogContentProps={dialogContentProps}>
                {paramsThatWillChange
                    ? paramsThatWillChange.map((m1) => {
                          return (
                              <p key={m1.nodeId}>
                                  {m1.nodeName} - {m1.value}
                              </p>
                          );
                      })
                    : ""}
                <DialogFooter>
                    <PrimaryButton onClick={onDeleteParameterDialogClick} text={Localizer.l("editParametersDeleteButtonText")} />
                    <DefaultButton onClick={toggleShowDeleteDialog} text={Localizer.l("editParametersCancelButtonText")} />
                </DialogFooter>
            </Dialog>
            <Panel isOpen={isOpen} onDismiss={onClose} closeButtonAriaLabel="Close">
                {addNewIsShown ? (
                    <Stack style={{ paddingBottom: "20px" }}>
                        <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ flex: 1 }} variant={"large"}>
                                {Localizer.l("newParameter")}
                            </Text>
                            <Text variant={"medium"} style={{ textDecoration: "underline", cursor: "pointer" }} onClick={setAddNewIsShown}>
                                {Localizer.l("hideForm")}
                            </Text>
                        </Stack>
                        <Stack>
                            <ParameterEditorCreateForm setParameterCreationConfiguration={setParameterCreationConfiguration} />
                            <Stack style={{ paddingTop: "15px" }}>
                                <DefaultButton
                                    text="Add"
                                    onClick={onCreateFormAddClick}
                                    disabled={
                                        parameterCreationConfiguration == null ||
                                        parameterCreationConfiguration.name == null ||
                                        parameterCreationConfiguration.type == null
                                    }
                                />
                            </Stack>
                        </Stack>
                    </Stack>
                ) : (
                    ""
                )}
                <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: "14px 0px 10px 0px" }}>
                    <Text style={{ flex: 1 }} variant={"large"}>
                        {Localizer.l("parameters")}
                    </Text>
                    {addNewIsShown ? (
                        ""
                    ) : (
                        <DefaultButton text={Localizer.l("parameterEditorParameterListAddButtonLabel")} iconProps={addIcon} onClick={setAddNewIsShown} />
                    )}
                </Stack>

                <Stack>
                    <SearchBox placeholder="Search" onSearch={searchFunction} />
                </Stack>
                {createParameterFields()}
            </Panel>
        </div>
    );
};
