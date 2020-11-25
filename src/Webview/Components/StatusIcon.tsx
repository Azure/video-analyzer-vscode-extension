import * as React from "react";
import { Icon, mergeStyles } from "@fluentui/react";
import { ICanvasNode } from "@vienna/react-dag-editor";
import { CanvasNodeData } from "../Types/GraphTypes";

interface IProps {
    hasErrors: boolean;
}

export const StatusIcon: React.FunctionComponent<IProps> = (props) => {
    //   const themeContext = React.useContext(ThemeContextType);
    //   const { palette } = themeContext.themeStyles;

    const renderStatusIcon = (): React.ReactNode => {
        const { hasErrors } = props;

        // for now it has only the invalid node status
        if (hasErrors) {
            const iconClass = mergeStyles({
                color: "var(--vscode-problemsWarningIcon-foreground)",
                fontSize: 16
            });
            return <Icon iconName="WarningSolid" className={iconClass} />;
        }

        // tslint:disable-next-line: no-null-keyword
        return null;
    };

    return <>{renderStatusIcon()}</>;
};
