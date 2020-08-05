import * as React from "react";
import Localizer from "../../localization/Localizer";
import { MediaGraphTopology } from "../../lva-sdk/lvaSDKtypes";
import {
  PrimaryButton,
  Stack,
  DefaultButton,
  IconButton,
  Callout,
  IStackTokens,
  IStackStyles,
} from "office-ui-fabric-react";
import { useBoolean, useId } from "@uifabric/react-hooks";
import { ValidationError, ValidationErrorType } from "../../types/graphTypes";

export interface IGraphPanelProps {
  validationErrors?: ValidationError[];
}

export const ValidationErrorPanel: React.FunctionComponent<IGraphPanelProps> = (
  props
) => {
  const { validationErrors = [] } = props;

  const createErrorText = (error: ValidationError) => {
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
  };

  return (
    <Stack tokens={{ childrenGap: "s1" }}>
      <h2>{Localizer.l("errorPanelHeading")}</h2>
      {validationErrors.map((error) => {
        const text = createErrorText(error);
        return <div key={text}>{text}</div>;
      })}
    </Stack>
  );
};
