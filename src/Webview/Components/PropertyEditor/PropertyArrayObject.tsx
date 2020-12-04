import * as React from "react";
import { Label, Stack, Text } from "@fluentui/react";
import { useId } from "@uifabric/react-hooks";
import { MediaGraphNodeInput } from "../../../Common/Types/LVASDKTypes";
import Definitions from "../../Definitions/Definitions";
import Localizer from "../../Localization/Localizer";
import { ParameterizeValueRequestFunction } from "../../Types/GraphTypes";
import { PropertyDescription } from "./PropertyDescription";
import { PropertyEditor } from "./PropertyEditor";
import { PropertyNestedObject } from "./PropertyNestedObject";

interface IPropertyArrayObjectProps {
    name: string;
    property: any;
    nodeProperties: any;
    required: boolean;
    readOnly?: boolean;
    requestParameterization?: ParameterizeValueRequestFunction;
}

export const PropertyArrayObject: React.FunctionComponent<IPropertyArrayObjectProps> = (props) => {
    const { name, property, nodeProperties, required, readOnly = false, requestParameterization } = props;
    const [arrayItems, setArrayItems] = React.useState([] as any[]);

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
        <>
            <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Label style={{ flex: 1 }}>{name}</Label>
                <Text style={{ textDecoration: "underline", cursor: "pointer" }} onClick={onAddInputClick}>
                    Add
                </Text>
            </Stack>
            {propertyFields.length ? propertyFields : <Text>Empty</Text>}
        </>
    );
};
