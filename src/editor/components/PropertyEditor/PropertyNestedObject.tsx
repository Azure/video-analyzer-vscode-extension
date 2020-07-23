import * as React from "react";
import { Dropdown, IDropdownOption } from "office-ui-fabric-react";
import Definitions from "../../../definitions";
import PropertyEditor from "./PropertyEditor";
import PropertyDescription from "./PropertyDescription";

interface IPropertyNestedObjectProps {
  name: string;
  property: any;
  nodeProperties: any;
  required: boolean;
}

const PropertyNestedObject: React.FunctionComponent<IPropertyNestedObjectProps> = (
  props
) => {
  const { name, property, nodeProperties, required } = props;
  const initType =
    nodeProperties["@type"] &&
    nodeProperties["@type"].replace("#Microsoft.Media.", "");
  const [type, setType] = React.useState<string>(initType);

  function handleTypeChange(e: React.FormEvent, item?: IDropdownOption) {
    if (item) {
      const selectedType = item.key as string;
      nodeProperties["@type"] = `#Microsoft.Media.${selectedType}`;
      setType(selectedType);
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

  return (
    <>
      <Dropdown
        label={name}
        options={options}
        defaultSelectedKey={type || "undefined"}
        onChange={handleTypeChange}
        required={required}
      />
      <PropertyDescription property={property} />
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

export default PropertyNestedObject;
