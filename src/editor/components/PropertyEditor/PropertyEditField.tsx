import {
  Text,
  TextField,
  Dropdown,
  IDropdownOption,
  ChoiceGroup,
  IChoiceGroupOption,
  getTheme,
} from "office-ui-fabric-react";
import { useId } from "@uifabric/react-hooks";
import * as React from "react";
import Localizer from "../../../localization/Localizer";
import { PropertyNestedObject } from "./PropertyNestedObject";
import { PropertyDescription } from "./PropertyDescription";
import { ParameterizeValueRequestFunction } from "../../../types/graphTypes";

interface IPropertyEditFieldProps {
  name: string;
  property: any;
  nodeProperties: any;
  required: boolean;
  requestParameterization: ParameterizeValueRequestFunction;
}

export const PropertyEditField: React.FunctionComponent<IPropertyEditFieldProps> = (
  props
) => {
  const {
    name,
    property,
    nodeProperties,
    required,
    requestParameterization,
  } = props;

  let initValue = nodeProperties[name];
  if (property.type !== "boolean" && property.type !== "string") {
    initValue = JSON.stringify(initValue);
  }
  const [value, setValue] = React.useState<string>(initValue);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const parameterized = value && value.includes("${");

  function handleDropdownChange(e: React.FormEvent, item?: IDropdownOption) {
    if (item) {
      const value = item.key as string;
      setNewValue(value);
      setErrorMessage(validateInput(value));
    }
  }

  function handleTextFieldChange(e: React.FormEvent, newValue?: string) {
    if (newValue !== undefined) {
      setNewValue(newValue);
    }
  }

  function handleChoiceGroupChange(
    e?: React.FormEvent,
    option?: IChoiceGroupOption
  ) {
    if (option !== undefined) {
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
          } catch (e) {
            // no change in value
          }
        } else {
          delete nodeProperties[name];
        }
        break;
    }
  }

  function validateInput(value: string) {
    if (required) {
      switch (property.type) {
        case "boolean":
          if (value === "true" || value === "false") {
            return Localizer.l("propertyEditorValidationUndefined");
          }
          break;
        case "string":
          if (!value || value === "undefined") {
            return Localizer.l("propertyEditorValidationUndefinedOrEmpty");
          }
          break;
        default:
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              return Localizer.l("propertyEditorValidationInvalidJSON");
            }
          } else {
            return Localizer.l("propertyEditorValidationEmpty");
          }
          break;
      }
    }

    return "";
  }

  const labelId: string = useId("label");

  function requestAndInsertParameter() {
    requestParameterization(name, setNewValue);
  }

  function onRenderLabel() {
    return (
      <PropertyDescription
        name={name}
        required={required}
        property={property}
        labelId={labelId}
        useParameter={requestAndInsertParameter}
      />
    );
  }

  if (property.type !== "object" && parameterized) {
    return (
      <TextField
        label={name}
        multiline
        autoAdjustHeight
        value={value}
        required={required}
        onRenderLabel={onRenderLabel}
        aria-labelledby={labelId}
        readOnly
        // disabled
      />
    );
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
      <Dropdown
        label={name}
        options={options}
        defaultSelectedKey={value || ""}
        onChange={handleDropdownChange}
        required={required}
        onRenderLabel={onRenderLabel}
        aria-labelledby={labelId}
        errorMessage={errorMessage}
      />
    );
  } else if (property.type === "string") {
    return (
      <TextField
        label={name}
        type="text"
        id={name}
        value={value}
        placeholder={property.example}
        onChange={handleTextFieldChange}
        required={required}
        onRenderLabel={onRenderLabel}
        aria-labelledby={labelId}
        onGetErrorMessage={validateInput}
      />
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
        {/* ChoiceGroup does not support onRenderLabel or errorMessage */}
        {onRenderLabel()}
        <ChoiceGroup
          defaultSelectedKey={value + ""}
          options={options}
          onChange={handleChoiceGroupChange}
          required={required}
          aria-labelledby={labelId}
        />
        {errorMessage && (
          <Text
            variant="small"
            style={{ color: getTheme().semanticColors.errorText }}
          >
            {errorMessage}
          </Text>
        )}
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
        requestParameterization={requestParameterization}
      />
    );
  } else {
    return (
      <TextField
        label={name}
        multiline
        autoAdjustHeight
        defaultValue={value}
        placeholder={property.example}
        onChange={handleTextFieldChange}
        required={required}
        onRenderLabel={onRenderLabel}
        aria-labelledby={labelId}
        onGetErrorMessage={validateInput}
      />
    );
  }
};
