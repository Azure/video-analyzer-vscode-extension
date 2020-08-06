import * as React from "react";
import Localizer from "../../../localization/Localizer";
import {
  IconButton,
  Stack,
  IStackTokens,
  Callout,
  Label,
  IStackStyles,
  IButtonStyles,
  Icon,
} from "office-ui-fabric-react";
import { useBoolean, useId } from "@uifabric/react-hooks";

interface IPropertyDescriptionProps {
  name: string;
  required: boolean;
  property: any;
  labelId: string;
  useParameter?: () => void;
}

export const PropertyDescription: React.FunctionComponent<IPropertyDescriptionProps> = (
  props
) => {
  const { name, required, property, labelId, useParameter } = props;

  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(
    false
  );
  const descriptionId: string = useId("description");
  const iconButtonId: string = useId("iconButton");

  const stackTokens: IStackTokens = {
    childrenGap: 4,
  };
  const labelCalloutStackStyles: Partial<IStackStyles> = {
    root: { maxWidth: 300, padding: 10 },
  };
  const iconButtonStyles: Partial<IButtonStyles> = {
    root: { marginBottom: -3 },
  };

  return (
    <>
      <Stack horizontal horizontalAlign="space-between" tokens={stackTokens}>
        <Stack horizontal verticalAlign="center" tokens={stackTokens}>
          <Label
            required={required}
            id={labelId}
            style={{
              // Fabric adds a 12px padding to the required *
              marginRight: required ? -12 : 0,
            }}
          >
            {name}
          </Label>
          <IconButton
            id={iconButtonId}
            iconProps={{ iconName: "Info" }}
            title={Localizer.l("propertyEditorInfoButtonTitle")}
            ariaLabel={Localizer.l("propertyEditorInfoButtonAriaLabel")}
            onClick={toggleIsCalloutVisible}
            styles={iconButtonStyles}
          />
        </Stack>
        {useParameter && (
          <IconButton
            iconProps={{ iconName: "Variable2" }}
            title={"test"}
            ariaLabel={"test"}
            onClick={useParameter}
          />
        )}
      </Stack>
      {isCalloutVisible && (
        <Callout
          target={"#" + iconButtonId}
          setInitialFocus
          onDismiss={toggleIsCalloutVisible}
          ariaDescribedBy={descriptionId}
          role="alertdialog"
          styles={labelCalloutStackStyles}
          id={descriptionId}
        >
          {Localizer.l(property.description)}
        </Callout>
      )}
    </>
  );
};
