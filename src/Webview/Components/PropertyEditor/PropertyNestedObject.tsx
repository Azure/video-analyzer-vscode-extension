import * as React from "react";
import { Dropdown, IDropdownOption } from "@fluentui/react";
import { useId } from "@uifabric/react-hooks";
import { useGraphData } from "@vienna/react-dag-editor";
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
    requestParameterization?: ParameterizeValueRequestFunction;
}

export const PropertyNestedObject: React.FunctionComponent<IPropertyNestedObjectProps> = (props) => {
    const { property, nodeProperties, required, readOnly = false, requestParameterization, name } = props;
    const initType = nodeProperties["@type"] && nodeProperties["@type"].replace(Definitions.TypePrefix, "");
    const [nodeTypeName, setNodeTypeName] = React.useState<string>("");
    const [errorMessage, setErrorMessage] = React.useState<string>("");
    const localizedPropertyStrings = Localizer.getLocalizedStrings(property.localizationKey);

    React.useEffect(() => {
        if (!nodeName && required) {
            setErrorMessage(Localizer.l("propertyEditorValidationUndefined"));
        }
    }, [nodeTypeName]);

    const hadDiscriminator = property["discriminator"] != null;
    const nodeName = !hadDiscriminator ? Definitions.getNameFromParsedRef(property.parsedRef) : initType;
    if (nodeTypeName !== nodeName) {
        setNodeTypeName(nodeName);
        if (!nodeName && required) {
            setErrorMessage(Localizer.l("propertyEditorValidationUndefined"));
        }
    }

    function handleTypeChange(e: React.FormEvent, item?: IDropdownOption) {
        if (item) {
            const itemType = item.key as string;
            if (itemType) {
                nodeProperties["@type"] = `${Definitions.TypePrefix}${itemType}`;
            } else {
                nodeProperties["@type"] = "";
            }
            setNodeTypeName(itemType);
            if (required) {
                setErrorMessage(itemType === "" ? Localizer.l("propertyEditorValidationUndefined") : "");
            }
        }
    }

    const options: IDropdownOption[] = !hadDiscriminator
        ? []
        : [
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

    const selectedType = nodeTypeName;
    if (!selectedType && options.length == 1) {
        handleTypeChange(null as any, options[0]);
    }

    return (
        <>
            {hadDiscriminator ? (
                readOnly ? (
                    <>
                        {onRenderLabel()}
                        <div aria-labelledby={labelId}>
                            {selectedType ? options.filter((item) => item.key === selectedType)[0].text : <i>{Localizer.l("propertyEditorNoneValueLabel")}</i>}
                        </div>
                    </>
                ) : (
                    <Dropdown
                        options={options}
                        defaultSelectedKey={selectedType ?? null}
                        onChange={handleTypeChange}
                        required={required}
                        onRenderLabel={onRenderLabel}
                        aria-labelledby={labelId}
                        errorMessage={errorMessage ? `${localizedPropertyStrings.title}: ${errorMessage}` : ""}
                    />
                )
            ) : (
                <PropertyDescription name={localizedPropertyStrings.title} required={required} property={property}></PropertyDescription>
            )}
            {nodeTypeName && (
                <div
                    style={{
                        borderLeft: "1px solid",
                        paddingLeft: 10
                    }}
                >
                    {nodeProperties && (
                        <PropertyEditor
                            nodeTypeName={nodeTypeName}
                            nodeProperties={nodeProperties}
                            readOnly={readOnly}
                            requestParameterization={requestParameterization}
                        />
                    )}
                </div>
            )}
        </>
    );
};
