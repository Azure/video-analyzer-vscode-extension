import some from "lodash/some";
import * as React from "react";
import { Dropdown, IDropdownOption, Stack, TextField } from "@fluentui/react";
import {
    MediaGraphParameterDeclaration,
    MediaGraphParameterType
} from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { ParamCreateConfig } from "../ParameterSelector/ParameterSelector";

interface IParameterEditorCreateFormProps {
    horizontal?: boolean;
    setParamCreateConfig: (newParameter: ParamCreateConfig) => void;
    name?: string;
    type?: string;
    value?: string;
    parameters: MediaGraphParameterDeclaration[];
}

export const ParameterEditorCreateForm: React.FunctionComponent<IParameterEditorCreateFormProps> = (props) => {
    const { parameters, setParamCreateConfig, horizontal, name, type, value } = props;

    const options = [
        { key: "String", text: "String" },
        { key: "SecretString", text: "SecretString" },
        { key: "Int", text: "Int" },
        { key: "Double", text: "Double" },
        { key: "Bool", text: "Bool" }
    ];

    const [parameterName, setParameterName] = React.useState<string>(name ?? "");
    const [parameterNameError, setParameterNameError] = React.useState<string>(name ?? "");
    const [parameterType, setParameterType] = React.useState<MediaGraphParameterType>((type ?? options[0].key) as MediaGraphParameterType);
    const [parameterDefaultValue, setParameterDefaultValue] = React.useState<string>(value ?? "");

    React.useEffect(() => {
        setParamCreateConfig({
            name: parameterName,
            type: parameterType,
            default: parameterDefaultValue,
            nameError: parameterNameError
        });
    }, [parameterName, parameterNameError, parameterType, parameterDefaultValue, setParamCreateConfig]);

    const parameterNameValidate = (newName: string) => {
        let error = "";
        if (!newName) {
            error = Localizer.l("propertyEditorValidationUndefinedOrEmpty");
        } else if (
            some(parameters, (param) => {
                return param.name !== name && param.name === newName;
            })
        ) {
            error = Localizer.l("parameterAlreadyExists");
        }
        setParameterNameError(error);
        return error;
    };

    return (
        <Stack style={{ flexGrow: 1 }} horizontal={horizontal} tokens={horizontal ? { childrenGap: "s1" } : {}}>
            <TextField
                label={Localizer.l("parameterEditorCreateFormNameFieldLabel")}
                placeholder={Localizer.l("parameterEditorCreateFormNameFieldPlaceholder")}
                required
                value={parameterName}
                validateOnLoad={false}
                onGetErrorMessage={parameterNameValidate}
                onChange={(event, newValue?) => {
                    setParameterName(newValue ?? "");
                }}
            />
            <Dropdown
                label={Localizer.l("parameterEditorCreateFormTypeDropdownLabel")}
                placeholder={Localizer.l("parameterEditorCreateFormTypeDropdownPlaceholder")}
                options={options}
                required
                selectedKey={parameterType as string}
                onChange={(event, option?) => {
                    setParameterType((option?.key ?? options[0].key) as MediaGraphParameterType);
                }}
            />
            <TextField
                label={Localizer.l("parameterEditorCreateFormDefaultFieldLabel")}
                placeholder={Localizer.l("parameterEditorCreateFormDefaultFieldPlaceholder")}
                value={parameterDefaultValue}
                onChange={(event, newValue?) => {
                    setParameterDefaultValue(newValue ?? "");
                }}
            />
        </Stack>
    );
};
