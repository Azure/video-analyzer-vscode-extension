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
    const [addLinkDisabled, { setTrue: addLinkDisabledTrue, setFalse: addLinkDisabledFalse }] = useBoolean(false);

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
        updateArray([...arrayItems, ""]);
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

    const propertyFields: any[] = [];

    arrayItems.forEach((item: any, index: number) => {
        propertyFields.push(
            <Stack horizontal>
                <Stack.Item grow>
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
                </Stack.Item>
                <IconButton
                    iconProps={{ iconName: "delete" }}
                    onClick={() => {
                        onDeleteClick(index);
                    }}
                ></IconButton>
            </Stack>
        );
    });

    return (
        <>
            <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Label style={{ flex: 1 }}>{name}</Label>
                <Link disabled={addLinkDisabled} style={{ textDecoration: "underline", cursor: "pointer" }} onClick={onAddInputClick}>
                    {Localizer.l("addAction")}
                </Link>
            </Stack>
            {propertyFields.length ? <Stack tokens={{ childrenGap: 4 }}>{propertyFields} </Stack> : <Text>Empty</Text>}
        </>
    );
};
