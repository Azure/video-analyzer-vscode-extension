import * as React from "react";
import Definitions from "../../../definitions";
import { PropertyEditField } from "./PropertyEditField";

interface IPropertyEditorProps {
  nodeProperties: any;
}

export const PropertyEditor: React.FunctionComponent<IPropertyEditorProps> = (
  props
) => {
  const { nodeProperties } = props;
  const definition = Definitions.getNodeDefinition(nodeProperties);

  if (!definition) {
    return null;
  }

  const propertyFields = [];

  for (const name in definition.properties) {
    const property = definition.properties[name];

    if (!property) continue;

    // skip the type field (already shown as dropdown by PropertyNestedObject)
    if (name === "@type") continue;

    const key = "property-" + name;
    propertyFields.push(
      <div
        key={key}
        style={{
          marginTop: 20,
        }}
      >
        <PropertyEditField
          name={name}
          property={property}
          nodeProperties={nodeProperties}
          required={
            (definition.required &&
              definition.required.includes(name)) as boolean
          }
        />
      </div>
    );
  }

  return <>{propertyFields}</>;
};
