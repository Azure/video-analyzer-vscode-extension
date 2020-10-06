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
import { ParameterChangeValidation } from "../../Types/GraphTypes";
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

    const createParameterFields = () => {
        if (parameters) {
            return (
                <Stack style={{ paddingTop: "10px" }}>
                    {getParameters().map((p: any, idx: number) => {
                        return (
                            <EditableParameter
                                object={p}
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
            editParameter(parameterCreationConfiguration, parameters, index);
        }
        setEditedParameter(-1);
    };

    const onDeleteParameterClick = (index: number) => {
        //setdeleteFocusedParameter
        setFocusedDeleteParameter(index);
        //show deleteDialogBox = true
        toggleShowDeleteDialog();
        //send back the parameter that is going to be deleted
        checkParameter(parameters[index]);
    };

    const onDeleteParameterDialogClick = () => {
        // remove deleted parameters from graph.data
        deleteParametersFromNodes(parameters[focusedDeleteParameter]);
        //delete Parameter
        deleteParameter(focusedDeleteParameter, parameters);
        setFocusedDeleteParameter(-1);
        toggleShowDeleteDialog();
    };

    //type will be test or delete (maybe add edit here too, if they want the validation before you save edited param)
    const checkParameter = (parameter: MediaGraphParameterDeclaration) => {
        const paramChanges = graph.checkForParamsInGraphNode(parameter.name);
        setParamsThatWillChange(paramChanges);
    };

    const deleteParametersFromNodes = (parameter: MediaGraphParameterDeclaration) => {
        graph.deleteParamsFromGraph(parameter);
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
                    <PrimaryButton onClick={onDeleteParameterDialogClick} text="Send" />
                    <DefaultButton onClick={toggleShowDeleteDialog} text="Don't send" />
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
