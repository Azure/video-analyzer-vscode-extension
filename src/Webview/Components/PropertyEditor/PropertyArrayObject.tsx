import uniqueId from "lodash/uniqueId";
import { check } from "prettier";
import * as React from "react";
import {
    IconButton,
    Label,
    Link,
    Stack,
    Text,
    TextField
} from "@fluentui/react";
import { useBoolean } from "@uifabric/react-hooks";
import Definitions from "../../Definitions/Definitions";
import Localizer from "../../Localization/Localizer";
import { ParameterizeValueRequestFunction } from "../../Types/GraphTypes";
import { PropertyFormatType } from "../LivePipelineComponent";
import { PropertyEditField } from "./PropertyEditField";
import { PropertyNestedObject } from "./PropertyNestedObject";
import { PropertyReadOnlyEditField } from "./PropertyReadonlyEditField";

interface IPropertyArrayObjectProps {
    name: string;
    property: any;
    nodeProperties: any;
    required: boolean;
    readOnly?: boolean;
    requestParameterization?: ParameterizeValueRequestFunction;
}

export const PropertyArrayObject: React.FunctionComponent<IPropertyArrayObjectProps> = (props) => {
    const { name, property, nodeProperties, required, requestParameterization, readOnly = false } = props;
    const [arrayItems, setArrayItems] = React.useState([] as any[]);
    const [addLinkDisabled, { setTrue: addLinkDisabledTrue, setFalse: addLinkDisabledFalse }] = useBoolean(false);
    //const [arrayComponents, setArrayComponents] = React.useState<any[]>([]);

    const checkAddLinkDisable = (newArray: string[]) => {
        if (newArray.some((item) => item === "")) {
            addLinkDisabledTrue();
        } else {
            addLinkDisabledFalse();
        }
    };
    const updateArray = (newArray: string[]) => {
        setArrayItems(newArray);
        nodeProperties[name] = newArray;
        checkAddLinkDisable(newArray);
    };
    const onAddInputClick = () => {
        updateArray([...arrayItems, property.items.type === PropertyFormatType.object ? {} : ""]);
    };
    const onDeleteClick = (index: number) => {
        const newArray = [...arrayItems];
        newArray.splice(index, 1);
        updateArray(newArray);
    };

    const definition = Definitions.getNodeDefinition(nodeProperties?.["@type"]);

    const properties = nodeProperties[name];
    if (properties && arrayItems !== properties) {
        setArrayItems(nodeProperties[name]);
        checkAddLinkDisable(nodeProperties[name]);
    }

    const propertyFields = arrayItems.map((item: any, index: number) => {
        const key = uniqueId();
        return (
            <Stack horizontal key={key} style={{ borderLeft: "1px solid", paddingLeft: 10 }}>
                <Stack.Item grow>
                    {property.items.type === PropertyFormatType.object ? (
                        <PropertyNestedObject
                            name={name}
                            property={property.items}
                            nodeProperties={item}
                            required={required}
                            requestParameterization={requestParameterization}
                        />
                    ) : (
                        <TextField
                            placeholder={"Enter comma separated strings"}
                            type="text"
                            defaultValue={item}
                            onChange={(e, newValue) => {
                                arrayItems[index] = newValue;
                                updateArray(arrayItems);
                            }}
                            onGetErrorMessage={(newValue) => {
                                return newValue === "" ? Localizer.l("propertyEditorValidationUndefinedOrEmpty") : "";
                            }}
                            required={required}
                            readOnly={false}
                        />
                    )}
                </Stack.Item>
                <IconButton
                    ariaLabel={Localizer.l("delete")}
                    iconProps={{ iconName: "delete" }}
                    onClick={() => {
                        onDeleteClick(index);
                    }}
                ></IconButton>
            </Stack>
        );
    });

    //setArrayComponents(propertyFields);

    return (
        <>
            <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Label style={{ flex: 1 }}>{name}</Label>
                <Link disabled={addLinkDisabled} style={{ textDecoration: "underline", cursor: "pointer" }} onClick={onAddInputClick}>
                    {Localizer.l("addAction")}
                </Link>
            </Stack>
            {propertyFields.length ? <Stack tokens={{ childrenGap: 16 }}>{propertyFields} </Stack> : <Text>Empty</Text>}
        </>
    );
};
