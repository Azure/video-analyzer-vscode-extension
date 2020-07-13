import { Icon } from "office-ui-fabric-react";
import * as React from "react";
import PropertyNestedObject from "./PropertyNestedObject";

interface IPropertyEditFieldProps {
  name: string;
  property: any;
  nodeProperties: any;
}

const PropertyEditField: React.FunctionComponent<IPropertyEditFieldProps> = (
  props
) => {
  const { name, property, nodeProperties } = props;
  const [valid, setValid] = React.useState<boolean>(true);

  let initValue = nodeProperties[name];
  if (property.type !== "boolean" && property.type !== "string") {
    initValue = JSON.stringify(initValue);
  }
  const [value, setValue] = React.useState<string>(initValue);

  function handleChange(e: React.FormEvent) {
    const newValue = (e.target as any).value;
    setValue(newValue);

    switch (property.type) {
      case "boolean":
        if (newValue === "true") {
          nodeProperties[name] = true;
        } else if (newValue === "false") {
          nodeProperties[name] = false;
        } else {
          delete nodeProperties[name];
        }
        break;
      case "string":
        if (newValue) {
          nodeProperties[name] = newValue;
        } else {
          delete nodeProperties[name];
        }
        break;
      default:
        if (newValue) {
          try {
            nodeProperties[name] = JSON.parse(newValue);
            setValid(true);
          } catch (e) {
            setValid(false);
          }
        } else {
          delete nodeProperties[name];
          setValid(true);
        }
        break;
    }
  }

  if (property.type === "string" && property.enum) {
    return (
      <select id={name} value={value} onChange={handleChange}>
        <option key={"undefined"} value="">
          undefined
        </option>
        {property.enum.map((value: string) => (
          <option key={value}>{value}</option>
        ))}
      </select>
    );
  } else if (property.type === "string") {
    return (
      <input
        type="text"
        id={name}
        value={value}
        placeholder="undefined"
        onChange={handleChange}
      />
    );
  } else if (property.type === "boolean") {
    return (
      <>
        <label htmlFor={`${name}-undefined`}>
          <input
            type="radio"
            id={`${name}-undefined`}
            name={name}
            value="undefined"
            checked={!value || value === "undefined"}
            onChange={handleChange}
          />
          undefined
        </label>
        <label htmlFor={`${name}-true`}>
          <input
            type="radio"
            id={`${name}-true`}
            name={name}
            value="true"
            checked={value === "true"}
            onChange={handleChange}
          />
          true
        </label>
        <label htmlFor={`${name}-false`}>
          <input
            type="radio"
            id={`${name}-false`}
            name={name}
            value="false"
            checked={value === "false"}
            onChange={handleChange}
          />
          false
        </label>
      </>
    );
  } else if (property.type === "object") {
    const isPropertyValueSet = name in nodeProperties;
    if (!isPropertyValueSet) {
      nodeProperties[name] = {};
    }
    return (
      <PropertyNestedObject
        name={name}
        property={property}
        nodeProperties={nodeProperties[name]}
      />
    );
  } else {
    const iconStyle = {
      marginRight: 8,
    };
    return (
      <>
        <textarea
          id={name}
          value={value}
          placeholder="undefined"
          onChange={handleChange}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          {valid ? (
            <>
              <Icon iconName="CheckMark" style={iconStyle} />
              Valid
            </>
          ) : (
            <>
              <Icon iconName="WarningSolid" style={iconStyle} />
              Parse error
            </>
          )}
        </div>
      </>
    );
  }
};

export default PropertyEditField;
