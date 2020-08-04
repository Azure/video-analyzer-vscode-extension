import * as React from "react";
import { Dropdown, IDropdownOption } from "office-ui-fabric-react";
import Definitions from "../../../definitions/Definitions";
import { PropertyEditor } from "./PropertyEditor";
import { PropertyDescription } from "./PropertyDescription";
import { useId } from "@uifabric/react-hooks";
import Localizer from "../../../localization/Localizer";

interface IPropertyNestedObjectProps {
  name: string;
  property: any;
  nodeProperties: any;
  required: boolean;
}

export const PropertyNestedObject: React.FunctionComponent<IPropertyNestedObjectProps> = (
  props
) => {
  const { name, property, nodeProperties, required } = props;
  const initType =
    nodeProperties["@type"] &&
    nodeProperties["@type"].replace("#Microsoft.Media.", "");
  const [type, setType] = React.useState<string>(initType);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  function handleTypeChange(e: React.FormEvent, item?: IDropdownOption) {
    if (item) {
      const selectedType = item.key as string;
      nodeProperties["@type"] = `#Microsoft.Media.${selectedType}`;
      setType(selectedType);
      if (required) {
        setErrorMessage(
          selectedType === "undefined"
            ? Localizer.l("propertyEditorValidationUndefined")
            : ""
        );
      }
    }
  }

  const options: IDropdownOption[] = [
    {
      key: "undefined",
      text: "undefined",
    },
    ...Definitions.getCompatibleNodes(property.parsedRef).map((node) => ({
      key: node.name,
      text: node.name,
    })),
  ];

  const labelId: string = useId("label");

  function onRenderLabel() {
    return (
      <PropertyDescription
        name={name}
        required={required}
        property={property}
        labelId={labelId}
      />
    );
  }

  return (
    <>
      <Dropdown
        label={name}
        options={options}
        defaultSelectedKey={type || "undefined"}
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
            paddingLeft: 10,
          }}
        >
          {nodeProperties && <PropertyEditor nodeProperties={nodeProperties} />}
        </div>
      )}
    </>
  );
};
