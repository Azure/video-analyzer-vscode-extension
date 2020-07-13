import * as React from "react";
import { getNodeDefinition, localize } from "../../../definitions";
import PropertyEditField from "./PropertyEditField";

interface IPropertyEditorProps {
  nodeProperties: any;
}

const PropertyEditor: React.FunctionComponent<IPropertyEditorProps> = (
  props
) => {
  const { nodeProperties } = props;
  const definition = getNodeDefinition(nodeProperties);

  if (!definition) {
    return null;
  }

  const propertyFields = [];

  for (const name in definition.properties) {
    const property = definition.properties[name];

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
        <label htmlFor={name}>
          <strong>{name}</strong> ({property.type}
          {property.type === "object" && (
            <>
              {" "}
              conforming to {property.parsedRef.replace("#/definitions/", "")}
            </>
          )}
          {definition.required && definition.required.includes(name) && (
            <>
              {", "}
              <strong>required</strong>
            </>
          )}
          )
        </label>
        <p>
          {property.description && localize(property.description)}
          {property.example && <em> Example: {property.example}</em>}
        </p>
        <PropertyEditField
          name={name}
          property={property}
          nodeProperties={nodeProperties}
        />
      </div>
    );
  }

  return <>{propertyFields}</>;
};

export default PropertyEditor;
