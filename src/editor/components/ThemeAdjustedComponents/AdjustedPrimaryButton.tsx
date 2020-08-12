import { getTheme, IButtonProps, PrimaryButton } from "office-ui-fabric-react";
import * as React from "react";

export const AdjustedPrimaryButton: React.FunctionComponent<IButtonProps> = (props) => {
    const theme = getTheme();

    return (
        <PrimaryButton
            {...props}
            styles={{
                label: {
                    color: "var(--vscode-button-foreground)"
                },
                labelDisabled: {
                    color: theme.palette.neutralTertiaryAlt
                },
                rootHovered: {
                    background: "var(--vscode-button-hoverBackground)"
                }
            }}
        />
    );
};
