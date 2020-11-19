import {
    ChoiceGroup,
    Dropdown,
    getFadedOverflowStyle,
    getTheme,
    IChoiceGroupOption,
    IDropdownOption,
    Text,
    TextField
} from "office-ui-fabric-react";
import * as React from "react";
import { useId } from "@uifabric/react-hooks";
// import validationJson from "../../Definitions/v1.0/validation.json";
import Localizer from "../../Localization/Localizer";
import { ParameterizeValueRequestFunction } from "../../Types/GraphTypes";
import { PropertyDescription } from "./PropertyDescription";
import { PropertyNestedObject } from "./PropertyNestedObject";

interface IPropertyEditFieldProps {
    name: string;
    property: any;
    nodeProperties: any;
    required: boolean;
    requestParameterization?: ParameterizeValueRequestFunction;
    updateNodeName?: (oldName: string, newName: string) => void;
}

enum typesNeedingISOFormat {
    MediaGraphSignalGateProcessor,
    activationEvaluationWindow,
    activationSignalOffset,
    minimumActivationTime,
    maximumActivationTime
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
        console.log("setNewValue");
        if (updateNodeName) {
            updateNodeName(value, newValue);
        }

        //check if isIsoValue
        // true: change number value to isoValue
        const format = customDefinitons[property.localizationKey] ?? null;
        console.log("format", format);
        // if (format === "isoDuration") {
        //     console.log("updated isoDuration", value, newValue);
        //     newValue = valueToIso(newValue);
        // }
        setValue(newValue);

        //should only update this if there are no issues with the propertyEditField
        if (format === "isoDuration") {
            console.log("isoDuration found", newValue);
            // nodeProperties[name] = valueToIso(newValue);
        } else {
            console.log("not an isoDuration");
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

    function valueToIso(value: any) {
        return value;
    }

    function isoToValue(iso: string) {}

    const testJson: any = {
        "MediaGraphEndpoint.url": {
            type: "regex",
            value: '^(ftp|http|https)://[^ "]+$'
        },
        "MediaGraphFileSink.filePathPattern": {
            type: "minMaxLength",
            value: [1, 260]
        },
        "MediaGraphAssetSink.assetNamePattern": {
            type: "regex",
            value: '@"^[^<>%&:\\/?*+.\']{1,260}$"'
        },
        "MediaGraphAssetSink.segmentLength": {
            type: "minMaxValue",
            value: [30, 300, "seconds"]
        },
        "MediaGraphIoTHubMessageSink.hubOutputName": {
            type: "maxLength",
            value: 50
        },
        "MediaGraphSignalGateProcessor.activationEvaluationWindow": {
            type: "minMaxValue",
            value: [0, 10, "seconds"]
        },
        "MediaGraphSignalGateProcessor.activationSignalOffset": {
            type: "minMaxValue",
            value: [-60, 60, "seconds"]
        },
        "MediaGraphSignalGateProcessor.minimumActivationTime": {
            type: "minMaxValue",
            value: [1, 3600, "seconds"]
        },
        "MediaGraphSignalGateProcessor.maximumActivationTime": {
            type: "minMaxValue",
            value: [1, 3600, "seconds"]
        },
        "MediaGraphFrameRateFilterProcessor.maximumFps": {
            type: "minValue",
            value: 0.0001
        },
        "MediaGraphImageScale.width": {
            type: "minMaxValue",
            value: [-1, 1, ""]
        },
        "MediaGraphImageScale.height": {
            type: "minMaxValue",
            value: [-1, 1, ""]
        }
    };

    const customDefinitons: any = {
        "MediaGraphEndpoint.url": "urlFormat",
        "MediaGraphFileSink.filePathPattern": "number",
        "MediaGraphAssetSink.segmentLength": "isoDuration",
        "MediaGraphIoTHubMessageSink.hubOutputName": "isoDuration",
        "MediaGraphSignalGateProcessor.activationEvaluationWindow": "isoDuration",
        "MediaGraphSignalGateProcessor.activationSignalOffset": "isoDuration",
        "MediaGraphSignalGateProcessor.minimumActivationTime": "isoDuration",
        "MediaGraphSignalGateProcessor.maximumActivationTime": "isoDuration",
        "MediaGraphFrameRateFilterProcessor.maximumFps": "number",
        "MediaGraphImageScale.width": "number",
        "MediaGraphImageScale.height": "number"
    };

    function validateRequiredProperty(value: string) {
        switch (property.type) {
            case "boolean":
                if (value === "") {
                    return Localizer.l("propertyEditorValidationUndefined");
                }
                break;
            case "string":
                if (!value) {
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
        return "";
    }

    function validateProperty(value: string) {
        const format = customDefinitons[property.localizationKey] ?? null;
        if (format === "urlFormat") {
            const r = new RegExp('^(ftp|http|https)://[^ "]+$');
            if (!r.test(value)) {
                return Localizer.l("notValidUrl");
            }
        } else if (format === "number" || format === "isoDuration") {
            let isNum = /^\d+$/.test(value);
            if (!isNum) {
                return Localizer.l("valueMustBeNumbersError");
            }
        }
        if (testJson[property.localizationKey]) {
            const validationType = testJson[property.localizationKey].type;
            const propertyValue = testJson[property.localizationKey].value;
            switch (validationType) {
                case "regex": {
                    const r = new RegExp(propertyValue);
                    if (!r.test(value)) {
                        switch (property.localizationKey) {
                            case "MediaGraphAssetSink.assetNamePattern": {
                                return Localizer.l("assetNamePatternError");
                            }
                        }
                    }
                    return "";
                }
                case "maxLength": {
                    if (value.length > propertyValue) {
                        return Localizer.l("maxLengthError").format(propertyValue);
                    }
                }
                case "minLength": {
                }
                case "minMaxLength": {
                    if (value.length < propertyValue[0] || value.length > propertyValue[1]) {
                        return Localizer.l("minMaxLengthError").format(propertyValue[0], propertyValue[1]);
                    }
                }
                case "minValue": {
                    if (value < propertyValue) {
                        return Localizer.l("minValueError").format(propertyValue);
                    }
                }
                case "minMaxValue": {
                    if (value < propertyValue[0] || value > propertyValue[1]) {
                        return Localizer.l("minMaxError").format(propertyValue[0], propertyValue[1], propertyValue[2]);
                    }
                }
            }
        }

        return "";
    }

    function validateInput(value: string) {
        let errorMessage: string = "";
        if (required) {
            errorMessage = validateRequiredProperty(value);
        }
        if (!errorMessage) {
            errorMessage = validateProperty(value);
        }

        errorMessage != "" ? setHasError(true) : setHasError(false);

        return errorMessage;
    }

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
