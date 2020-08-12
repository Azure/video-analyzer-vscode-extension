import { DefaultButton, Stack } from "office-ui-fabric-react";
import * as React from "react";
import Localizer from "../../localization/Localizer";
import { AdjustedPrimaryButton } from "./ThemeAdjustedComponents/AdjustedPrimaryButton";

export interface IGraphPanelProps {
    name: string;
    cancelAction: () => void;
    primaryAction: () => void;
    primaryActionEnabled: boolean;
    secondaryAction?: {
        text: string;
        callback: () => void;
    };
}

export const Toolbar: React.FunctionComponent<IGraphPanelProps> = (props) => {
    const { name, cancelAction, primaryAction, primaryActionEnabled, secondaryAction } = props;

    const toolbarStyles = {
        padding: 10,
        borderBottom: "1px solid var(--vscode-editorWidget-border)"
    };

    return (
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: "s1" }} style={toolbarStyles}>
            <div>{name}</div>
            <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: "s1" }}>
                <DefaultButton text={Localizer.l("cancelButtonText")} onClick={cancelAction} />
                {secondaryAction && <DefaultButton text={secondaryAction.text} onClick={secondaryAction.callback} />}
                <AdjustedPrimaryButton text={Localizer.l("saveButtonText")} onClick={primaryAction} disabled={!primaryActionEnabled} />
            </Stack>
        </Stack>
    );
};
