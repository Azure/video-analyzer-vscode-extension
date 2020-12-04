import * as React from "react";
import { Dropdown, IDropdownOption } from "@fluentui/react";
import { useId } from "@uifabric/react-hooks";
import Definitions from "../../Definitions/Definitions";
import Localizer from "../../Localization/Localizer";
import { ParameterizeValueRequestFunction } from "../../Types/GraphTypes";
import { PropertyDescription } from "./PropertyDescription";
import { PropertyEditor } from "./PropertyEditor";

interface IPropertyNestedObjectProps {
    name: string;
    property: any;
    nodeProperties: any;
    required: boolean;
    readOnly?: boolean;
    hideDropDown?: boolean;
    requestParameterization?: ParameterizeValueRequestFunction;
}

export const PropertyNestedObject: React.FunctionComponent<IPropertyNestedObjectProps> = (props) => {
    const { property, nodeProperties, required, readOnly = false, requestParameterization, hideDropDown } = props;
    const initType = nodeProperties["@type"] && nodeProperties["@type"].replace("#Microsoft.Media.", "");
    const [type, setType] = React.useState<string>(initType);
    const [errorMessage, setErrorMessage] = React.useState<string>("");
    const localizedPropertyStrings = Localizer.getLocalizedStrings(property.localizationKey);

    React.useEffect(() => {
        if (type == null && required) {
            setErrorMessage(Localizer.l("propertyEditorValidationUndefined"));
        }
    }, [type]);

    function handleTypeChange(e: React.FormEvent, item?: IDropdownOption) {
        if (item) {
            const itemType = item.key as string;
            if (itemType) {
                nodeProperties["@type"] = `#Microsoft.Media.${itemType}`;
            } else {
                nodeProperties["@type"] = "";
            }
            setType(itemType);
            if (required) {
                setErrorMessage(itemType === "" ? Localizer.l("propertyEditorValidationUndefined") : "");
            }
        }
    }

    const options: IDropdownOption[] = [
        ...Definitions.getCompatibleNodes(property.parsedRef).map((node) => {
            const localizedNodeStrings = Localizer.getLocalizedStrings(node.localizationKey);
            return {
                key: node.name,
                text: localizedNodeStrings.title,
                title: localizedNodeStrings.description
            };
        })
    ];

    const labelId: string = useId("label");

    function onRenderLabel() {
        return <PropertyDescription name={localizedPropertyStrings.title} required={required} property={property} labelId={labelId} />;
    }

    const selectedType = type;
    if (!selectedType && options.length == 1) {
        handleTypeChange(undefined as any, options[0]);
    }

    return (
        <>
            {!hideDropDown &&
                (readOnly ? (
                    <>
                        {onRenderLabel()}
                        <div aria-labelledby={labelId}>
                            {selectedType ? options.filter((item) => item.key === selectedType)[0].text : <i>{Localizer.l("propertyEditorNoneValueLabel")}</i>}
                        </div>
                    </>
                ) : (
                    <Dropdown
                        options={options}
                        defaultSelectedKey={selectedType}
                        onChange={handleTypeChange}
                        required={required}
                        onRenderLabel={onRenderLabel}
                        aria-labelledby={labelId}
                        errorMessage={errorMessage}
                    />
                ))}
            {type && (
                <div
                    style={{
                        borderLeft: "1px solid",
                        paddingLeft: 10
                    }}
                >
                    {nodeProperties && (
                        <PropertyEditor
                            nodeProperties={nodeProperties}
                            readOnly={readOnly}
                            requestParameterization={requestParameterization}
                            updateNodeName={undefined}
                        />
                    )}
                </div>
            )}
        </>
    );
};
