import { Dropdown, IDropdownOption } from "office-ui-fabric-react";
import * as React from "react";
import { useId } from "@uifabric/react-hooks";
import Definitions from "../../../definitions/Definitions";
import Localizer from "../../../localization/Localizer";
import { PropertyDescription } from "./PropertyDescription";
import { PropertyEditor } from "./PropertyEditor";

interface IPropertyNestedObjectProps {
    name: string;
    property: any;
    nodeProperties: any;
    required: boolean;
    readOnly?: boolean;
}

export const PropertyNestedObject: React.FunctionComponent<IPropertyNestedObjectProps> = (props) => {
    const { name, property, nodeProperties, required, readOnly = false } = props;
    const initType = nodeProperties["@type"] && nodeProperties["@type"].replace("#Microsoft.Media.", "");
    const [type, setType] = React.useState<string>(initType);
    const [errorMessage, setErrorMessage] = React.useState<string>("");

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
        ...Definitions.getCompatibleNodes(property.parsedRef).map((node) => ({
            key: node.name,
            text: node.name
        }))
    ];

    const labelId: string = useId("label");

    function onRenderLabel() {
        return <PropertyDescription name={name} required={required} property={property} labelId={labelId} />;
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
                    label={name}
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
                    {nodeProperties && <PropertyEditor nodeProperties={nodeProperties} readOnly={readOnly} />}
                </div>
            )}
        </>
    );
};
