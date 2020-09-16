import { FontIcon, IconButton, Stack, Text } from "office-ui-fabric-react";
import React from "react";

interface EditableParameterProps {
    id?: number;
    object: any;
}

export const EditableParameter: React.FunctionComponent<EditableParameterProps> = (props) => {
    const editableParamContainer: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        minHeight: "50px",
        paddingBottom: "8px"
    };

    const attributes: React.CSSProperties = {
        flex: 1,
        border: "1px solid #4f4f4f",
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

    return (
        <Stack style={editableParamContainer}>
            <Stack style={attributes}>
                <div style={attributesIcon}>
                    <FontIcon iconName="Variable" />
                </div>
                <div style={parameterAttributes}>
                    <Text variant={"medium"} style={{ fontWeight: "bold" }}>
                        {props.object.name}
                    </Text>
                    <Text variant={"small"}>{props.object.type}</Text>
                </div>
            </Stack>
            <Stack style={editIcons}>
                <IconButton iconProps={{ iconName: "edit" }} title="Edit" ariaLabel="Edit" style={{ fontSize: "12px" }} />
                <IconButton iconProps={{ iconName: "Delete" }} title="Delete" ariaLabel="Delete" style={{ fontSize: "12px" }} />
            </Stack>
        </Stack>
    );
};
