import {
    Dropdown,
    IDropdownOption,
    Stack,
    TextField
} from "office-ui-fabric-react";
import * as React from "react";
import {
    MediaGraphParameterDeclaration,
    MediaGraphParameterType
} from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";

interface IParameterEditorCreateFormProps {
    horizontal?: boolean;
    setParameterCreationConfiguration: (newParameter: MediaGraphParameterDeclaration) => void;
    name?: string;
    type?: string;
    value?: string;
}

export const ParameterEditorCreateForm: React.FunctionComponent<IParameterEditorCreateFormProps> = (props) => {
    const { setParameterCreationConfiguration, horizontal, name, type, value } = props;

    const options = [
        { key: "String", text: "String" },
        { key: "SecretString", text: "SecretString" },
        { key: "Int", text: "Int" },
        { key: "Double", text: "Double" },
        { key: "Bool", text: "Bool" }
    ];

    const [parameterName, setParameterName] = React.useState<string>(name ? name : "");
    const [parameterType, setParameterType] = React.useState<MediaGraphParameterType>((type ? type : options[0].key) as MediaGraphParameterType);
    const [parameterDefaultValue, setParameterDefaultValue] = React.useState<string>(value ? value : "");

    React.useEffect(() => {
        setParameterCreationConfiguration({
            name: parameterName,
            type: parameterType,
            default: parameterDefaultValue
        });
    }, [parameterName, parameterType, parameterDefaultValue]);

    return (
        <Stack style={{ flexGrow: 1 }} horizontal={horizontal} tokens={horizontal ? { childrenGap: "s1" } : {}}>
            <TextField
                label={Localizer.l("parameterEditorCreateFormNameFieldLabel")}
                placeholder={Localizer.l("parameterEditorCreateFormNameFieldPlaceholder")}
                required
                value={parameterName}
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
