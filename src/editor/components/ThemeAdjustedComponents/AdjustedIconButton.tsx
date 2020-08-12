import { IButtonProps, IconButton } from "office-ui-fabric-react";
import * as React from "react";

export const AdjustedIconButton: React.FunctionComponent<IButtonProps> = (props) => {
    return (
        <IconButton
            {...props}
            styles={{
                icon: {
                    color: "var(--vscode-foreground)"
                }
            }}
        />
    );
};
