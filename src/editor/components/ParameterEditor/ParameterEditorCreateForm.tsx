import * as React from "react";
import { TextField, Dropdown, IDropdownOption } from "office-ui-fabric-react";
import {
  MediaGraphParameterDeclaration,
  MediaGraphParameterType,
} from "../../../lva-sdk/lvaSDKtypes";

interface IParameterEditorCreateFormProps {
  setParameterCreationConfiguration: (
    newParameter: MediaGraphParameterDeclaration
  ) => void;
}

export const ParameterEditorCreateForm: React.FunctionComponent<IParameterEditorCreateFormProps> = (
  props
) => {
  const { setParameterCreationConfiguration } = props;

  const options = [
    { key: "String", text: "String" },
    { key: "SecretString", text: "SecretString" },
    { key: "Int", text: "Int" },
    { key: "Double", text: "Double" },
    { key: "Bool", text: "Bool" },
  ];

  const [parameterName, setParameterName] = React.useState<string>("");
  const [parameterType, setParameterType] = React.useState<
    MediaGraphParameterType
  >(options[0].key as MediaGraphParameterType);
  const [parameterDefaultValue, setParameterDefaultValue] = React.useState<
    string
  >("");

  React.useEffect(() => {
    setParameterCreationConfiguration({
      name: parameterName,
      type: parameterType,
      default: parameterDefaultValue,
    });
  }, [parameterName, parameterType, parameterDefaultValue]);

  const onParameterNameChange = (event: React.FormEvent, newValue?: string) => {
    if (newValue !== undefined) {
      setParameterName(newValue);
    }
  };

  const onParameterTypeChange = (
    event: React.FormEvent,
    option?: IDropdownOption
  ) => {
    if (option !== undefined) {
      const newType = option.key as MediaGraphParameterType;
      setParameterType(newType);
    }
  };

  const onParameterDefaultValueChange = (
    event: React.FormEvent,
    newValue?: string
  ) => {
    if (newValue !== undefined) {
      setParameterDefaultValue(newValue);
    }
  };

  return (
    <>
      <TextField
        label="Parameter name"
        placeholder="Enter parameter name"
        required
        value={parameterName}
        onChange={onParameterNameChange}
      />
      <Dropdown
        placeholder="Select an parameter type"
        label="Parameter type"
        options={options}
        required
        selectedKey={parameterType as string}
        onChange={onParameterTypeChange}
      />
      <TextField
        label="Default value"
        placeholder="Enter default value"
        value={parameterDefaultValue}
        onChange={onParameterDefaultValueChange}
      />
    </>
  );
};
