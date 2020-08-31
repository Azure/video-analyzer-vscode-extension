import { findLastIndex } from "lodash";
import {
    ActionButton,
    DefaultButton,
    FontWeights,
    mergeStyles,
    Stack,
    Text
} from "office-ui-fabric-react";
import * as React from "react";
import Localizer from "../Localization/Localizer";
import { AdjustedPrimaryButton } from "./ThemeAdjustedComponents/AdjustedPrimaryButton";

export interface IGraphPanelProps {
    name: string;
    cancelAction: () => void;
    primaryAction: () => void;
    secondaryAction?: {
        text: string;
        callback: () => void;
    };
    toggleSidebar: () => void;
    isSidebarShown: boolean;
    validationErrors?: number;
    showValidationErrors?: boolean;
    toggleValidationErrorPanel?: () => void;
}

export const Toolbar: React.FunctionComponent<IGraphPanelProps> = (props) => {
    const {
        name,
        cancelAction,
        primaryAction,
        secondaryAction,
        toggleSidebar,
        isSidebarShown,
        validationErrors,
        showValidationErrors,
        toggleValidationErrorPanel
    } = props;

    const titleContainer = {
        root: {
            fontWeight: FontWeights.semibold
        }
    };

    const toolbarStyles = {
        root: {
            borderBottom: "1px solid var(--vscode-editorWidget-border)"
        }
    };

    const paddedToolbarStyles = {
        root: mergeStyles(toolbarStyles.root, {
            padding: 10
        })
    };

    const itemStyles: React.CSSProperties = {
        alignItems: "center",
        display: "flex",
        justifyContent: "flex-end",
        flex: 1,
        paddingRight: "5%"
    };

    return (
        <>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: "s1" }} styles={paddedToolbarStyles}>
                <Text styles={titleContainer}>{name}</Text>
                <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: "s1" }}>
                    <AdjustedPrimaryButton text={Localizer.l("saveButtonText")} onClick={primaryAction} />
                    {secondaryAction && <DefaultButton text={secondaryAction.text} onClick={secondaryAction.callback} />}
                    <DefaultButton text={Localizer.l("cancelButtonText")} onClick={cancelAction} />
                </Stack>
            </Stack>
            <Stack horizontal tokens={{ childrenGap: "s1" }} styles={toolbarStyles}>
                <ActionButton iconProps={{ iconName: "Library" }} onClick={toggleSidebar}>
                    {isSidebarShown ? Localizer.l("toolbarHideLeftSidebar") : Localizer.l("toolbarShowLeftSidebar")}
                </ActionButton>
                {props.children}
                {validationErrors && validationErrors > 0 ? (
                    <Stack horizontal horizontalAlign="end" style={itemStyles}>
                        <ActionButton iconProps={{ iconName: "StatusErrorFull", style: { color: "red" } }} onClick={toggleValidationErrorPanel}>
                            {Localizer.l("toolbarValidationText").format(props.validationErrors)}
                        </ActionButton>
                    </Stack>
                ) : (
                    ""
                )}
            </Stack>
        </>
    );
};
