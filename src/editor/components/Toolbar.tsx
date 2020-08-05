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
  name: string;
  closeEditor: () => void;
  exportGraph: () => void;
  validationErrors?: ValidationError[];
}

export const Toolbar: React.FunctionComponent<IGraphPanelProps> = (props) => {
  const { name, closeEditor, exportGraph, validationErrors = [] } = props;
  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(
    false
  );

  const descriptionId: string = useId("description");
  const iconButtonId: string = useId("iconButton");

  const toolbarStyles = {
    padding: 10,
    background: "var(--vscode-editorWidget-background)",
    borderBottom: "1px solid var(--vscode-editorWidget-border)",
  };
  const errorPopoverStyles = {
    padding: 10,
  };

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
    <>
      <Stack
        horizontal
        horizontalAlign="space-between"
        verticalAlign="center"
        tokens={{ childrenGap: "s1" }}
        style={toolbarStyles}
      >
        <div>{name}</div>
        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: "s1" }}>
          {validationErrors.length > 0 && (
            <IconButton
              id={iconButtonId}
              iconProps={{ iconName: "AlertSolid" }}
              title="Info"
              ariaLabel="Info"
              onClick={toggleIsCalloutVisible}
            />
          )}
          <DefaultButton
            text={Localizer.l("cancelButtonText")}
            onClick={closeEditor}
          />
          <PrimaryButton
            text={Localizer.l("saveButtonText")}
            onClick={exportGraph}
          />
        </Stack>
      </Stack>
      {validationErrors.length > 0 && isCalloutVisible && (
        <Callout
          target={"#" + iconButtonId}
          setInitialFocus
          onDismiss={toggleIsCalloutVisible}
          ariaDescribedBy={descriptionId}
          role="alertdialog"
          style={errorPopoverStyles}
          calloutMaxWidth={400}
          preventDismissOnLostFocus
        >
          <Stack tokens={{ childrenGap: "s1" }}>
            <Stack
              horizontal
              horizontalAlign="space-between"
              tokens={{ childrenGap: "s1" }}
            >
              <h2 style={{ margin: 0 }}>{Localizer.l("errorPanelHeading")}</h2>
              <IconButton
                iconProps={{
                  iconName: "Clear",
                }}
                title={Localizer.l("closeButtonText")}
                ariaLabel={Localizer.l("propertyEditorCloseButtonAriaLabel")}
                onClick={toggleIsCalloutVisible}
              />
            </Stack>
            <div id={descriptionId}>
              {validationErrors.map((error) => {
                const text = createErrorText(error);
                return <div key={text}>{text}</div>;
              })}
            </div>
          </Stack>
        </Callout>
      )}
    </>
  );
};
