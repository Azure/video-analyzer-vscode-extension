import * as React from "react";
import { getNodeDefinition } from "../../../definitions";
import PropertyEditField from "./PropertyEditField";
import { localize } from "../../../localization";

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
              {localize("conforming to {type}").format(
                property.parsedRef.replace("#/definitions/", "")
              )}
            </>
          )}
          {definition.required && definition.required.includes(name) && (
            <>
              {", "}
              <strong>{localize("required")}</strong>
            </>
          )}
          )
        </label>
        <p>
          {property.description && localize(property.description)}
          {property.example && (
            <em>
              {" "}
              {localize("Example")}: {property.example}
            </em>
          )}
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
