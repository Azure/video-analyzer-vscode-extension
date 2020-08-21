import { Link, MessageBar, MessageBarType } from "office-ui-fabric-react";
import * as React from "react";
import Localizer from "../Localization/Localizer";
import { ValidationError, ValidationErrorType } from "../Types/GraphTypes";

export interface IGraphPanelProps {
    validationErrors?: ValidationError[];
}

export const ValidationErrorPanel: React.FunctionComponent<IGraphPanelProps> = (props) => {
    const { validationErrors = [] } = props;

    const createErrorText = (error: ValidationError) => {
        switch (error.type) {
            case ValidationErrorType.MissingProperty:
                return error.property && Localizer.l(error.description).format(error.property.join(" - "), error.nodeName);
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
            <h2>{Localizer.l("errorPanelHeading")}</h2>
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
        </>
    );
};
