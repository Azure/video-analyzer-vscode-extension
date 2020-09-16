import {
    DefaultButton,
    IIconProps,
    Panel,
    SearchBox,
    Stack,
    Text
} from "office-ui-fabric-react";
import React from "react";
import { useBoolean } from "@uifabric/react-hooks";
import { EditableParameter } from "./EditableParameter";

interface ParameterSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    parameters: any;
}

const addIcon: IIconProps = { iconName: "Add" };

export const ParameterSelector: React.FunctionComponent<ParameterSelectorProps> = (props) => {
    const [addNewIsShown, { toggle: setAddNewIsShown }] = useBoolean(false);
    const [selectedValue, setSelectedValue] = React.useState<string>("");

    console.log("params", props.parameters);
    const createParameterFields = () => {
        if (props.parameters) {
            return (
                <Stack style={{ paddingTop: "10px" }}>
                    {props.parameters.map((p: any, idx: number) => {
                        return <EditableParameter object={p} />;
                    })}
                </Stack>
            );
        }
    };

    return (
        <div>
            <Panel isOpen={props.isOpen} onDismiss={props.onClose} closeButtonAriaLabel="Close">
                <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: "14px 0px 10px 0px" }}>
                    <Text style={{ flex: 1 }} variant={"large"}>
                        Parameters
                    </Text>
                    <DefaultButton text="Add New" iconProps={addIcon} onClick={setAddNewIsShown} />
                </Stack>
                {/* spot for add icon component */}
                <Stack>
                    <SearchBox placeholder="Search" onSearch={(newValue) => console.log("value is " + newValue)} />
                </Stack>
                {createParameterFields()}
            </Panel>
        </div>
    );
};
