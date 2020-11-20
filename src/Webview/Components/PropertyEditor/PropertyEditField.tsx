import {
    ChoiceGroup,
    Dropdown,
    getTheme,
    IChoiceGroupOption,
    IDropdownOption,
    Text,
    TextField
} from "office-ui-fabric-react";
import * as React from "react";
import { useId } from "@uifabric/react-hooks";
import Localizer from "../../Localization/Localizer";
import { ParameterizeValueRequestFunction } from "../../Types/GraphTypes";
import Helpers from "../../Utils/Helpers";
import { PropertyDescription } from "./PropertyDescription";
import { PropertyNestedObject } from "./PropertyNestedObject";

const customDefinitions: any = require("../../Definitions/v2.0.0/customDefinitions.json");
interface IPropertyEditFieldProps {
    name: string;
    property: any;
    nodeProperties: any;
    required: boolean;
    requestParameterization?: ParameterizeValueRequestFunction;
    updateNodeName?: (oldName: string, newName: string) => void;
}

export const PropertyEditField: React.FunctionComponent<IPropertyEditFieldProps> = (props) => {
    const { name, property, nodeProperties, required, requestParameterization, updateNodeName } = props;
    const localizedPropertyStrings = Localizer.getLocalizedStrings(property.localizationKey);
    const [value, setValue] = React.useState<string>(getInitialValue);
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    const parameterized = !!(value && value.includes("${"));

    function getInitialValue() {
        let initValue = nodeProperties[name];
        if (property.type !== "boolean" && property.type !== "string") {
            initValue = JSON.stringify(initValue);
        }
        if (property.type === "string" && initValue && typeof initValue === "number") {
            if (customDefinitions[property.localizationKey] === "isoDuration") {
                initValue = Helpers.isoToValue(initValue);
            }
            initValue = initValue + "";
        }
        return initValue;
    }

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

    function handleChoiceGroupChange(e?: React.FormEvent, option?: IChoiceGroupOption) {
        if (option !== undefined) {
            const value = option.key as string;
            setNewValue(value);
            setErrorMessage(validateInput(value));
        }
    }

    function setNewValue(newValue: string) {
        if (updateNodeName) {
            updateNodeName(value, newValue);
        }

        setValue(newValue);

        const format = customDefinitions[property.localizationKey] ?? null;
        if (format === "isoDuration") {
            nodeProperties[name] = Helpers.valueToIso(newValue);
        } else {
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
    }

    const validateInput = (value: string) => {
        let errorMessage: string = "";
        if (required) {
            errorMessage = Helpers.validateRequiredProperty(value, property.type);
        }
        if (!errorMessage) {
            errorMessage = Helpers.validateProperty(value, property.localizationKey);
        }

        return errorMessage;
    };

    const labelId: string = useId("label");

    function requestAndInsertParameter() {
        requestParameterization!(name, setNewValue, value);
    }

    function onRenderLabel() {
        return (
            <PropertyDescription
                name={localizedPropertyStrings.title}
                required={required}
                property={property}
                labelId={labelId}
                useParameter={requestParameterization && requestAndInsertParameter}
                isParameterized={parameterized}
                setNewValue={setNewValue}
            />
        );
    }

    if (property.type !== "object" && parameterized) {
        return (
            <TextField
                label={name}
                value={value}
                required={required}
                onRenderLabel={onRenderLabel}
                aria-labelledby={labelId}
                disabled
                styles={{
                    field: {
                        color: "var(--vscode-foreground)"
                    }
                }}
            />
        );
    }

    if (property.type === "string" && property.enum) {
        const options: IDropdownOption[] = [
            ...property.enum.map((value: string) => {
                const localizedEnumValueStrings = Localizer.getLocalizedStrings(`${property.localizationKey}.${value}`);
                return {
                    key: value.toLowerCase(),
                    text: localizedEnumValueStrings.title,
                    title: localizedEnumValueStrings.description
                };
            })
        ];
        return (
            <Dropdown
                placeholder={localizedPropertyStrings.placeholder}
                options={options}
                defaultSelectedKey={value ? value.toLowerCase() : null}
                onChange={handleDropdownChange}
                required={required}
                onRenderLabel={onRenderLabel}
                aria-labelledby={labelId}
                errorMessage={errorMessage}
                onLoad={() => validateInput(value)}
            />
        );
    } else if (property.type === "string") {
        return (
            <TextField
                placeholder={localizedPropertyStrings.placeholder}
                type="text"
                id={name}
                value={value}
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
                key: "true",
                text: Localizer.l("propertyEditorBooleanTrueLabel")
            },
            {
                key: "false",
                text: Localizer.l("propertyEditorBooleanFalseLabel")
            }
        ];
        return (
            <>
                {/* ChoiceGroup does not support onRenderLabel or errorMessage */}
                {onRenderLabel()}
                <ChoiceGroup defaultSelectedKey={value} options={options} onChange={handleChoiceGroupChange} required={required} aria-labelledby={labelId} />
                {errorMessage && (
                    <Text variant="small" style={{ color: getTheme().semanticColors.errorText }}>
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
