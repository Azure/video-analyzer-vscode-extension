import { DefaultButton, Stack } from "office-ui-fabric-react";
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
    canContinue: () => boolean;
}

export const Toolbar: React.FunctionComponent<IGraphPanelProps> = (props) => {
    const { name, cancelAction, primaryAction, canContinue, secondaryAction } = props;

    const toolbarStyles = {
        padding: 10,
        borderBottom: "1px solid var(--vscode-editorWidget-border)"
    };

    const attemptRunAction = (action: () => void) => {
        if (canContinue()) {
            action();
        }
    };

    return (
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: "s1" }} style={toolbarStyles}>
            <div>{name}</div>
            <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: "s1" }}>
                <DefaultButton text={Localizer.l("cancelButtonText")} onClick={cancelAction} />
                {secondaryAction && <DefaultButton text={secondaryAction.text} onClick={() => attemptRunAction(secondaryAction.callback)} />}
                <AdjustedPrimaryButton text={Localizer.l("saveButtonText")} onClick={() => attemptRunAction(primaryAction)} />
            </Stack>
        </Stack>
    );
};
