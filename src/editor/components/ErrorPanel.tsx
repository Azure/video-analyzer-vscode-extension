import * as React from "react";
import { ValidationError } from "../../types/graphTypes";
import Localizer from "../../localization";

export interface IErrorPanelProps {
  validationErrors: ValidationError[];
}

export const ErrorPanel: React.FunctionComponent<IErrorPanelProps> = (
  props
) => {
  return (
    <ul>
      {props.validationErrors.map((error) => (
        <li
          key={error.description + (error.property && error.property.join(":"))}
        >
          {error.property
            ? Localizer.l(error.description).format(error.property.join(" → "))
            : Localizer.l(error.description)}
        </li>
      ))}
    </ul>
  );
};
