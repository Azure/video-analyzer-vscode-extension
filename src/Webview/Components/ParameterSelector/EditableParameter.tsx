import React from "react";
import { FontIcon, IconButton, Stack, Text } from "@fluentui/react";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { ParameterEditorCreateForm } from "../ParameterEditor/ParameterEditorCreateForm";

interface EditableParameterProps {
    id?: number;
    data: any;
    showEdit: boolean;
    parameters: MediaGraphParameterDeclaration[];
    onDeleteParameterClick: (index: number) => void;
    onEditParameterClick: (index: number) => void;
    onEditSaveParameterClick: (index: number) => void;
    setParameterCreationConfiguration: (newParameter: MediaGraphParameterDeclaration) => void;
}

export const EditableParameter: React.FunctionComponent<EditableParameterProps> = (props) => {
    const { id, data, showEdit, parameters, onDeleteParameterClick, onEditParameterClick, onEditSaveParameterClick, setParameterCreationConfiguration } = props;
    const editableParamContainer: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        minHeight: "50px",
        paddingBottom: "8px"
    };

    const attributes: React.CSSProperties = {
        flex: 1,
        border: "var(--vscode-parameters-border)",
        borderRadius: "5px",
        flexDirection: "row",
        padding: "8px"
    };

    const attributesIcon: React.CSSProperties = {
        fontSize: "16px",
        paddingRight: "8px"
    };

    const parameterAttributes: React.CSSProperties = {
        display: "flex",
        flexDirection: "column"
    };

    const editIcons: React.CSSProperties = {
        display: "flex",
        flexDirection: "row"
    };

    const onEditClick = () => {
        if (id != undefined && id > -1) {
            onEditParameterClick(id);
        }
    };

    const onEditSaveClick = () => {
        if (id != undefined && id > -1) {
            onEditSaveParameterClick(id);
        }
    };

    const onCancelEdit = () => {
        onEditParameterClick(-1);
    };

    const onDeleteClick = () => {
        if (id != undefined && id > -1) {
            onDeleteParameterClick(id);
        }
    };

    return (
        <Stack style={editableParamContainer}>
            {showEdit ? (
                <>
                    <Stack style={attributes}>
                        <ParameterEditorCreateForm
                            setParamCreateConfig={setParameterCreationConfiguration}
                            name={data.name}
                            value={data.default}
                            type={data.type}
                            parameters={parameters}
                        />
                    </Stack>
                    <Stack style={editIcons}>
                        <IconButton
                            iconProps={{ iconName: "save" }}
                            title={Localizer.l("editParametersSaveButtonText")}
                            ariaLabel={Localizer.l("editParametersSaveButtonText")}
                            style={{ fontSize: "12px" }}
                            onClick={onEditSaveClick}
                        />
                        <IconButton
                            iconProps={{ iconName: "Cancel" }}
                            title={Localizer.l("editParametersCancelButtonText")}
                            ariaLabel={Localizer.l("editParametersCancelButtonText")}
                            style={{ fontSize: "12px" }}
                            onClick={onCancelEdit}
                        />
                    </Stack>
                </>
            ) : (
                <>
                    <Stack style={attributes}>
                        <div style={attributesIcon}>
                            <FontIcon iconName="Variable" />
                        </div>
                        <div style={parameterAttributes}>
                            <Text variant={"medium"} style={{ fontWeight: "bold" }}>
                                {data.name}
                            </Text>
                            <Text variant={"small"}>{data.type}</Text>
                        </div>
                    </Stack>
                    <Stack style={editIcons}>
                        <IconButton
                            iconProps={{ iconName: "edit" }}
                            title={Localizer.l("editParametersEditButtonText")}
                            ariaLabel={Localizer.l("editParametersEditButtonText")}
                            style={{ fontSize: "12px" }}
                            onClick={onEditClick}
                        />
                        <IconButton
                            iconProps={{ iconName: "Delete" }}
                            title={Localizer.l("editParametersDeleteButtonText")}
                            ariaLabel={Localizer.l("editParametersDeleteButtonText")}
                            style={{ fontSize: "12px" }}
                            onClick={onDeleteClick}
                        />
                    </Stack>
                </>
            )}
        </Stack>
    );
};
