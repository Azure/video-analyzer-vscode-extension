import {
  Icon,
  TextField,
  Dropdown,
  IDropdownOption,
  ChoiceGroup,
  IChoiceGroupOption,
} from "office-ui-fabric-react";
import * as React from "react";
import PropertyNestedObject from "./PropertyNestedObject";
import PropertyDescription from "./PropertyDescription";
import Localizer from "../../../localization";

interface IPropertyEditFieldProps {
  name: string;
  property: any;
  nodeProperties: any;
  required: boolean;
}

const PropertyEditField: React.FunctionComponent<IPropertyEditFieldProps> = (
  props
) => {
  const { name, property, nodeProperties, required } = props;
  const [valid, setValid] = React.useState<boolean>(true);

  let initValue = nodeProperties[name];
  if (property.type !== "boolean" && property.type !== "string") {
    initValue = JSON.stringify(initValue);
  }
  const [value, setValue] = React.useState<string>(initValue);

  function handleDropdownChange(e: React.FormEvent, item?: IDropdownOption) {
    if (item) {
      setNewValue(item.key as string);
    }
  }

  function handleTextFieldChange(e: React.FormEvent, newValue?: string) {
    if (newValue) {
      setNewValue(newValue);
    }
  }

  function handleChoiceGroupChange(
    e?: React.FormEvent,
    option?: IChoiceGroupOption
  ) {
    if (option) {
      setNewValue(option.key as string);
    }
  }

  function setNewValue(newValue: string) {
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
    const options: IDropdownOption[] = [
      {
        key: "",
        text: "undefined",
      },
      ...property.enum.map((value: string) => ({
        key: value,
        text: value,
      })),
    ];
    return (
      <>
        <Dropdown
          label={name}
          options={options}
          defaultSelectedKey={value || ""}
          onChange={handleDropdownChange}
          required={required}
        />
        <PropertyDescription property={property} />
      </>
    );
  } else if (property.type === "string") {
    return (
      <>
        <TextField
          label={name}
          type="text"
          id={name}
          value={value}
          placeholder={property.example}
          onChange={handleTextFieldChange}
          required={required}
        />
        <PropertyDescription property={property} />
      </>
    );
  } else if (property.type === "boolean") {
    const options: IChoiceGroupOption[] = [
      {
        key: "undefined",
        text: "undefined",
      },
      {
        key: "true",
        text: "true",
      },
      {
        key: "false",
        text: "false",
      },
    ];
    return (
      <>
        <ChoiceGroup
          label={name}
          defaultSelectedKey={value + ""}
          options={options}
          onChange={handleChoiceGroupChange}
          required={required}
        />
        <PropertyDescription property={property} />
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
        required={required}
      />
    );
  } else {
    const iconStyle = {
      marginRight: 8,
    };
    return (
      <>
        <TextField
          label={name}
          multiline
          autoAdjustHeight
          defaultValue={value}
          placeholder={property.example}
          onChange={handleTextFieldChange}
          required={required}
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
              {Localizer.l("Valid")}
            </>
          ) : (
            <>
              <Icon iconName="WarningSolid" style={iconStyle} />
              {Localizer.l("Parse error")}
            </>
          )}
        </div>
        <PropertyDescription property={property} />
      </>
    );
  }
};

export default PropertyEditField;
