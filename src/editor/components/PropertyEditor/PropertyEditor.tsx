import * as React from "react";
import Definitions from "../../../definitions";
import PropertyEditField from "./PropertyEditField";
import Localizer from "../../../localization";

interface IPropertyEditorProps {
  nodeProperties: any;
}

const PropertyEditor: React.FunctionComponent<IPropertyEditorProps> = (
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
              {Localizer.l("conforming to {type}").format(
                property.parsedRef.replace("#/definitions/", "")
              )}
            </>
          )}
          {definition.required && definition.required.includes(name) && (
            <>
              {", "}
              <strong>{Localizer.l("required")}</strong>
            </>
          )}
          )
        </label>
        <p>
          {property.description && Localizer.l(property.description)}
          {property.example && (
            <em>
              {" "}
              {Localizer.l("Example")}: {property.example}
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
