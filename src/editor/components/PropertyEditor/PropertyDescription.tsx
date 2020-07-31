import * as React from "react";
import { Text } from "office-ui-fabric-react/lib/Text";
import Localizer from "../../../localization/Localizer";

interface IPropertyDescriptionProps {
  property: any;
}

export const PropertyDescription: React.FunctionComponent<IPropertyDescriptionProps> = (
  props
) => {
  const { property } = props;
  return (
    <Text variant="small">
      {property.description && Localizer.l(property.description)}
    </Text>
  );
};
