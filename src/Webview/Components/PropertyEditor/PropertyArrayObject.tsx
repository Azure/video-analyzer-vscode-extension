import * as React from "react";
import { Label, Stack, Text, TextField } from "@fluentui/react";
import Definitions from "../../Definitions/Definitions";
import { PropertyEditField } from "./PropertyEditField";
import { PropertyNestedObject } from "./PropertyNestedObject";

interface IPropertyArrayObjectProps {
    name: string;
    property: any;
    nodeProperties: any;
    required: boolean;
    readOnly?: boolean;
}

export const PropertyArrayObject: React.FunctionComponent<IPropertyArrayObjectProps> = (props) => {
    const { name, property, nodeProperties, required, readOnly = false } = props;
    const [arrayItems, setArrayItems] = React.useState([] as any[]);
    const [value, setValue] = React.useState<string>();

    console.log(nodeProperties);
    const definition = Definitions.getNodeDefinition(nodeProperties);

    const properties = nodeProperties[name];
    if (properties && arrayItems !== properties) {
        setArrayItems(nodeProperties[name]);
    }

    const onAddInputClick = () => {
        setArrayItems([...arrayItems, { nodeName: "" }]);
    };
    const propertyFields: any[] = [];

    arrayItems.forEach((item: any) => {
        propertyFields.push(<PropertyNestedObject name={item.name} property={property.items} nodeProperties={item} required={required} hideDropDown={true} />);
    });

    return (
        <TextField
            placeholder={"Enter comma separated strings"}
            type="text"
            id={name}
            value={value}
            //onChange={handleTextFieldChange}
            required={required}
            //onRenderLabel={onRenderLabel}
            //aria-labelledby={labelId}
            //onGetErrorMessage={validateInput}
        />
        // <>
        //     <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
        //         <Label style={{ flex: 1 }}>{name}</Label>
        //         <Text style={{ textDecoration: "underline", cursor: "pointer" }} onClick={onAddInputClick}>
        //             Add
        //         </Text>
        //     </Stack>
        //     {propertyFields.length ? propertyFields : <Text>Empty</Text>}
        // </>
    );
};
