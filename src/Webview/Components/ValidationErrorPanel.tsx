import {
    Link,
    MessageBar,
    MessageBarType,
    Stack
} from "office-ui-fabric-react";
import * as React from "react";
import Localizer from "../Localization/Localizer";
import { ValidationError, ValidationErrorType } from "../Types/GraphTypes";
import { AdjustedIconButton } from "./ThemeAdjustedComponents/AdjustedIconButton";

export interface IGraphPanelProps {
    validationErrors?: ValidationError[];
    toggleValidationErrorPanel?: () => void;
}

export const ValidationErrorPanel: React.FunctionComponent<IGraphPanelProps> = (props) => {
    const { validationErrors = [] } = props;

    const createErrorText = (error: ValidationError) => {
        switch (error.type) {
            case ValidationErrorType.MissingField:
                return (error.property && Localizer.l(error.description).format(error.property.join(" - "), error.nodeName)) || Localizer.l(error.description);
            case ValidationErrorType.NodeCountLimit:
                return Localizer.l(error.description).format(error.nodeType);
            case ValidationErrorType.RequiredDirectlyDownstream:
            case ValidationErrorType.ProhibitedDirectlyDownstream:
            case ValidationErrorType.ProhibitedAnyDownstream:
                return error.parentType && Localizer.l(error.description).format(error.nodeType, error.parentType.join(", "));
            default:
                return Localizer.l(error.description);
        }
    };

    return (
        <>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: "s1" }} style={{ margin: "0%" }}>
                <h2 style={{ marginLeft: "1%" }}>{Localizer.l("errorPanelHeading")}</h2>
                <AdjustedIconButton
                    iconProps={{
                        iconName: "Clear"
                    }}
                    title={Localizer.l("closeButtonText")}
                    ariaLabel={Localizer.l("propertyEditorCloseButtonAriaLabel")}
                    onClick={props.toggleValidationErrorPanel}
                />
            </Stack>
            <div style={{ maxHeight: "120px", overflowY: "scroll" }}>
                {validationErrors.map((error) => {
                    const text = createErrorText(error);
                    return (
                        <MessageBar messageBarType={MessageBarType.error} isMultiline={true} dismissButtonAriaLabel="Close" key={text}>
                            {text}
                            {error.helpLink && (
                                <Link href={error.helpLink} target="_blank">
                                    {Localizer.l("errorPanelHelpLinkText")}
                                </Link>
                            )}
                        </MessageBar>
                    );
                })}
            </div>
        </>
    );
};
