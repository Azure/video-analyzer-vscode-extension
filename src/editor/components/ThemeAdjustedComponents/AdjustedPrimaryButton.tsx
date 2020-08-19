import {
    getTheme,
    IButtonProps,
    mergeStyles,
    PrimaryButton
} from "office-ui-fabric-react";
import * as React from "react";

export const AdjustedPrimaryButton: React.FunctionComponent<IButtonProps> = (props) => {
    const theme = getTheme();

    const styles = {
        ...props.styles,
        label: mergeStyles([
            props.styles && props.styles.label,
            {
                color: "var(--vscode-button-foreground)"
            }
        ]),
        labelDisabled: mergeStyles([
            props.styles && props.styles.labelDisabled,
            {
                color: theme.palette.neutralTertiaryAlt
            }
        ]),
        rootHovered: mergeStyles([
            props.styles && props.styles.rootHovered,
            {
                background: "var(--vscode-button-hoverBackground)"
            }
        ])
    };

    return <PrimaryButton {...props} styles={styles} />;
};
