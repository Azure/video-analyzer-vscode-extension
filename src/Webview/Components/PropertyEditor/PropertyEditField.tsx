import * as React from "react";
import {
    ChoiceGroup,
    Dropdown,
    getTheme,
    IChoiceGroupOption,
    IDropdownOption,
    Text,
    TextField
} from "@fluentui/react";
import { useBoolean, useId } from "@uifabric/react-hooks";
import { usePropsAPI } from "@vienna/react-dag-editor";
import Definitions from "../../Definitions/Definitions";
import Localizer from "../../Localization/Localizer";
import GraphValidator from "../../Models/MediaGraphValidator";
import { ParameterizeValueRequestFunction } from "../../Types/GraphTypes";
import Helpers from "../../Utils/Helpers";
import { PropertyArrayObject } from "./PropertyArrayObject";
import { PropertyDescription } from "./PropertyDescription";
import { PropertyNestedObject } from "./PropertyNestedObject";

interface IPropertyEditFieldProps {
    name: string;
    property: any;
    nodeId?: string;
    nodeProperties: any;
    required: boolean;
    isNodeName?: boolean;
    requestParameterization?: ParameterizeValueRequestFunction;
}

enum PropertyFormatType {
    number = "number",
    string = "string",
    isoDuration = "isoDuration",
    boolean = "boolean",
    object = "object",
    array = "array"
}

export const PropertyEditField: React.FunctionComponent<IPropertyEditFieldProps> = (props) => {
    const { name, property, nodeProperties, required, requestParameterization, isNodeName, nodeId } = props;
    const localizedPropertyStrings = Localizer.getLocalizedStrings(property.localizationKey);
    const [value, setValue] = React.useState<string>("");
    const [errorMessage, setErrorMessage] = React.useState<string>("");
    const [isParameterized, { setFalse: setParameterizeFalse, setTrue: setParameterizeTrue }] = useBoolean(false);
    const versionFolder = Definitions.VersionFolder;

    const propsAPI = usePropsAPI();

    const validateInput = async (value: string) => {
        let errorMessage = "";
        if (required) {
            errorMessage = GraphValidator.validateRequiredProperty(value, property.type);
        }
        if (isValueParameterized(value)) {
            return "";
        }
        if (!errorMessage) {
            errorMessage = await GraphValidator.validateProperty(value, property.localizationKey);
        }

        return errorMessage ? `${localizedPropertyStrings.title}: ${errorMessage}` : "";
    };

    const isValueParameterized = (valueString: string) => {
        return !!(valueString && typeof valueString === "string" && valueString.includes("${"));
    };

    React.useEffect(() => {
        getInitialValue().then(async (initValue) => {
            if (value !== initValue) {
                setValue(initValue);
                setErrorMessage(await validateInput(initValue));
                if (isValueParameterized(initValue)) {
                    setParameterizeTrue();
                } else setParameterizeFalse();
            }
        });
    }, [nodeId]); // listen for changes on nodeId and fetch new node's value

    async function getInitialValue() {
        const customPropertyTypes = await import(`../../Definitions/${versionFolder}/customPropertyTypes.json`);
        let initValue = nodeProperties[name];
        if (property.type !== PropertyFormatType.boolean && property.type !== PropertyFormatType.string) {
            initValue = JSON.stringify(initValue);
        }
        if (property.type === PropertyFormatType.string && initValue) {
            if (initValue && (customPropertyTypes as any)[property.localizationKey] === PropertyFormatType.isoDuration) {
                if (!isValueParameterized(initValue)) {
                    initValue = Helpers.isoToSeconds(initValue);
                }
            }
            initValue = initValue + "";
        }
        return initValue;
    }

    async function handleDropdownChange(e: React.FormEvent, item?: IDropdownOption) {
        if (item) {
            const value = item.key as string;
            setNewValue(value);
            setErrorMessage(await validateInput(value));
        }
    }

    function handleTextFieldChange(e: React.FormEvent, newValue?: string) {
        if (newValue !== undefined) {
            setNewValue(newValue);
        }
    }

    async function handleChoiceGroupChange(e?: React.FormEvent, option?: IChoiceGroupOption) {
        if (option !== undefined) {
            const value = option.key as string;
            setNewValue(value);
            setErrorMessage(await validateInput(value));
        }
    }

    const setParamValue = (newValue: string) => {
        if (newValue && isValueParameterized(newValue)) {
            setParameterizeTrue();
        } else {
            setParameterizeFalse();
        }
        setNewValue(newValue);
    };

    function setNewValue(newValue: string) {
        if (nodeId && isNodeName) {
            propsAPI.updateData((prev) => {
                return prev.updateNode(nodeId, (currNode) => {
                    return { ...currNode, name: newValue };
                });
            });
        }

        setValue(newValue);

        if (newValue === "" || newValue == null) {
            nodeProperties[name] = null;
        } else {
            import(`../../Definitions/${versionFolder}/customPropertyTypes.json`).then((customPropertyTypes) => {
                const format = (customPropertyTypes as any)[property.localizationKey] ?? null;
                if (format === PropertyFormatType.isoDuration) {
                    if (isValueParameterized(newValue)) {
                        setParameterizeTrue();
                        nodeProperties[name] = newValue;
                    } else {
                        setParameterizeFalse();
                        nodeProperties[name] = Helpers.secondsToIso(newValue) ?? newValue;
                    }
                } else {
                    switch (property.type) {
                        case PropertyFormatType.boolean:
                            if (newValue === "true") {
                                nodeProperties[name] = true;
                            } else if (newValue === "false") {
                                nodeProperties[name] = false;
                            } else {
                                delete nodeProperties[name];
                            }
                            break;
                        case PropertyFormatType.string:
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
            });
        }
    }

    const labelId: string = useId("label");

    function requestAndInsertParameter() {
        requestParameterization!(name, setParamValue, value);
    }

    function onRenderLabel() {
        return (
            <PropertyDescription
                name={localizedPropertyStrings.title}
                required={required}
                property={property}
                labelId={labelId}
                useParameter={requestParameterization && requestAndInsertParameter}
                isParameterized={isParameterized}
                setNewValue={setParamValue}
            />
        );
    }

    if (property.type !== PropertyFormatType.object && property.type !== PropertyFormatType.array && isParameterized) {
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

    if (property.type === PropertyFormatType.string && property.enum) {
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
        if (value == null && options.length === 1) {
            handleDropdownChange(undefined as any, options[0]);
        }
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
    } else if (property.type === PropertyFormatType.string) {
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
    } else if (property.type === PropertyFormatType.boolean) {
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
    } else if (property.type === PropertyFormatType.object) {
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
    } else if (property.type === PropertyFormatType.array) {
        return (
            <PropertyArrayObject name={name} property={property} nodeProperties={nodeProperties} required={required} requestParameterization={requestParameterization} />
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
