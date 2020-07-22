import * as React from "react";
import { ValidationError, ValidationErrorType } from "../../types/graphTypes";
import Localizer from "../../localization";

export interface IErrorPanelProps {
  validationErrors: ValidationError[];
}

export const ErrorPanel: React.FunctionComponent<IErrorPanelProps> = (
  props
) => {
  function createErrorText(error: ValidationError) {
    switch (error.type) {
      case ValidationErrorType.MissingProperty:
        return (
          error.property &&
          Localizer.l(error.description).format(error.property.join(" - "))
        );
      case ValidationErrorType.NodeCountLimit:
        return Localizer.l(error.description).format(error.nodeType);
      case ValidationErrorType.RequiredDirectlyDownstream:
      case ValidationErrorType.ProhibitedDirectlyDownstream:
      case ValidationErrorType.ProhibitedAnyDownstream:
        return (
          error.parentType &&
          Localizer.l(error.description).format(
            error.nodeType,
            error.parentType.join(", ")
          )
        );
      default:
        return Localizer.l(error.description);
    }
  }

  return (
    <ul>
      {props.validationErrors.map((error) => {
        const text = createErrorText(error);
        return <li key={text}>{text}</li>;
      })}
    </ul>
  );
};
