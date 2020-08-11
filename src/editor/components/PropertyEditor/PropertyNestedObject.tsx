import { Dropdown, IDropdownOption } from "office-ui-fabric-react";
import * as React from "react";
import { useId } from "@uifabric/react-hooks";
import Definitions from "../../../definitions/Definitions";
import Localizer from "../../../localization/Localizer";
import { ParameterizeValueRequestFunction } from "../../../types/graphTypes";
import { PropertyDescription } from "./PropertyDescription";
import { PropertyEditor } from "./PropertyEditor";

interface IPropertyNestedObjectProps {
    name: string;
    property: any;
    nodeProperties: any;
    required: boolean;
    requestParameterization: ParameterizeValueRequestFunction;
}

export const PropertyNestedObject: React.FunctionComponent<IPropertyNestedObjectProps> = (props) => {
    const { name, property, nodeProperties, required, requestParameterization } = props;
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

    return (
        <>
            <Dropdown
                options={options}
                defaultSelectedKey={type || ""}
                onChange={handleTypeChange}
                required={required}
                onRenderLabel={onRenderLabel}
                aria-labelledby={labelId}
                errorMessage={errorMessage}
            />
            {type && (
                <div
                    style={{
                        borderLeft: "1px solid",
                        paddingLeft: 10
                    }}
                >
                    {nodeProperties && <PropertyEditor nodeProperties={nodeProperties} requestParameterization={requestParameterization} />}
                </div>
            )}
        </>
    );
};
