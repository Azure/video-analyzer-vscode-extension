import { Dropdown, IDropdownOption } from "office-ui-fabric-react";
import * as React from "react";
import { useId } from "@uifabric/react-hooks";
import Definitions from "../../../Definitions/Definitions";
import Localizer from "../../../Localization/Localizer";
import { ParameterizeValueRequestFunction } from "../../../Types/GraphTypes";
import { PropertyDescription } from "./PropertyDescription";
import { PropertyEditor } from "./PropertyEditor";

interface IPropertyNestedObjectProps {
    name: string;
    property: any;
    nodeProperties: any;
    required: boolean;
    readOnly?: boolean;
    requestParameterization?: ParameterizeValueRequestFunction;
}

export const PropertyNestedObject: React.FunctionComponent<IPropertyNestedObjectProps> = (props) => {
    const { property, nodeProperties, required, readOnly = false, requestParameterization } = props;
    const initType = nodeProperties["@type"] && nodeProperties["@type"].replace("#Microsoft.Media.", "");
    const [type, setType] = React.useState<string>(initType);
    const [errorMessage, setErrorMessage] = React.useState<string>("");
    const localizedPropertyStrings = Localizer.getLocalizedStrings(property.localizationKey);

    function handleTypeChange(e: React.FormEvent, item?: IDropdownOption) {
        if (item) {
            const selectedType = item.key as string;
            if (selectedType) {
                nodeProperties["@type"] = `#Microsoft.Media.${selectedType}`;
            } else {
                nodeProperties["@type"] = "";
            }
            setType(selectedType);
            if (required) {
                setErrorMessage(selectedType === "" ? Localizer.l("propertyEditorValidationUndefined") : "");
            }
        }
    }

    const options: IDropdownOption[] = [
        {
            key: "",
            text: Localizer.l("propertyEditorNoneValueLabel")
        },
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

    const selectedType = type || "";

    return (
        <>
            {readOnly ? (
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
            )}
            {type && (
                <div
                    style={{
                        borderLeft: "1px solid",
                        paddingLeft: 10
                    }}
                >
                    {nodeProperties && <PropertyEditor nodeProperties={nodeProperties} readOnly={readOnly} requestParameterization={requestParameterization} />}
                </div>
            )}
        </>
    );
};
