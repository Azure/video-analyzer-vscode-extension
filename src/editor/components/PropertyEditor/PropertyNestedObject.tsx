import * as React from "react";
import Definitions from "../../../definitions";
import PropertyEditor from "./PropertyEditor";

interface IPropertyNestedObjectProps {
  name: string;
  property: any;
  nodeProperties: any;
}

const PropertyNestedObject: React.FunctionComponent<IPropertyNestedObjectProps> = (
  props
) => {
  const { name, property, nodeProperties } = props;
  const initType =
    nodeProperties["@type"] &&
    nodeProperties["@type"].replace("#Microsoft.Media.", "");
  const [type, setType] = React.useState<string>(initType);

  function handleTypeChange(e: React.FormEvent) {
    const selectedType = (e.target as any).value;
    nodeProperties["@type"] = `#Microsoft.Media.${selectedType}`;
    setType(selectedType);
  }

  return (
    <>
      <select id={name} value={type} onChange={handleTypeChange}>
        <option key="undefined">undefined</option>
        {Definitions.getCompatibleNodes(property.parsedRef).map((node) => (
          <option key={node.name}>{node.name}</option>
        ))}
      </select>
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
