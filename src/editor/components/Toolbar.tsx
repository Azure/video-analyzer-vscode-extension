import {
    ActionButton,
    DefaultButton,
    mergeStyles,
    Stack
} from "office-ui-fabric-react";
import * as React from "react";
import Localizer from "../../localization/Localizer";
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
}

export const Toolbar: React.FunctionComponent<IGraphPanelProps> = (props) => {
    const { name, cancelAction, primaryAction, secondaryAction, toggleSidebar, isSidebarShown } = props;

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

    return (
        <>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: "s1" }} styles={paddedToolbarStyles}>
                <div>{name}</div>
                <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: "s1" }}>
                    {secondaryAction && <DefaultButton text={secondaryAction.text} onClick={secondaryAction.callback} />}
                    <AdjustedPrimaryButton text={Localizer.l("saveButtonText")} onClick={primaryAction} />
                    <DefaultButton text={Localizer.l("cancelButtonText")} onClick={cancelAction} />
                </Stack>
            </Stack>
            <Stack horizontal tokens={{ childrenGap: "s1" }} styles={toolbarStyles}>
                <ActionButton iconProps={{ iconName: "Library" }} onClick={toggleSidebar}>
                    {isSidebarShown ? Localizer.l("toolbarHideLeftSidebar") : Localizer.l("toolbarShowLeftSidebar")}
                </ActionButton>
                {props.children}
            </Stack>
        </>
    );
};
