import { IButtonProps, IconButton, mergeStyles } from "office-ui-fabric-react";
import * as React from "react";

export const AdjustedIconButton: React.FunctionComponent<IButtonProps> = (props) => {
    const styles = {
        ...props.styles,
        icon: mergeStyles([
            props.styles && props.styles.icon,
            {
                color: "var(--vscode-foreground)"
            }
        ])
    };

    return <IconButton {...props} styles={styles} />;
};
