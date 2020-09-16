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
import Localizer from "../../Localization/Localizer";
import { ParameterEditorCreateForm } from "../ParameterEditor/ParameterEditorCreateForm";
import { EditableParameter } from "./EditableParameter";

interface ParameterSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    parameters: any;
}

const addIcon: IIconProps = { iconName: "Add" };

export const ParameterSelector: React.FunctionComponent<ParameterSelectorProps> = (props) => {
    const [addNewIsShown, { toggle: setAddNewIsShown }] = useBoolean(false);
    const [searchParameter, setSearchParameters] = React.useState<string>("");

    console.log("params", props.parameters);
    const createParameterFields = () => {
        if (props.parameters) {
            return (
                <Stack style={{ paddingTop: "10px" }}>
                    {getParameters().map((p: any, idx: number) => {
                        return <EditableParameter object={p} />;
                    })}
                </Stack>
            );
        }
    };

    const searchFunction = (search: any) => {
        console.log("search event", search);
        setSearchParameters(search);
    };

    const getParameters = () => {
        return props.parameters.filter((parameter: any) => {
            return parameter.name.toLowerCase().includes(searchParameter.toLowerCase());
        });
    };

    return (
        <div>
            <Panel isOpen={props.isOpen} onDismiss={props.onClose} closeButtonAriaLabel="Close">
                {/* spot for add icon component */}
                {addNewIsShown ? (
                    <Stack style={{ paddingBottom: "20px" }}>
                        <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ flex: 1 }} variant={"large"}>
                                {Localizer.l("newParameter")}
                            </Text>
                            <Text variant={"medium"} style={{ textDecoration: "underline", cursor: "pointer" }} onClick={setAddNewIsShown}>
                                {Localizer.l("hideForm")}
                            </Text>
                        </Stack>
                        <ParameterEditorCreateForm
                            setParameterCreationConfiguration={() => {
                                return "";
                            }}
                        />
                        <Stack style={{ paddingTop: "15px", justifyContent: "flex-end" }}>
                            <DefaultButton text="Add" style={{ flexGrow: 0 }} />
                        </Stack>
                    </Stack>
                ) : (
                    ""
                )}
                <Stack style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: "14px 0px 10px 0px" }}>
                    <Text style={{ flex: 1 }} variant={"large"}>
                        {Localizer.l("parameters")}
                    </Text>
                    {addNewIsShown ? (
                        ""
                    ) : (
                        <DefaultButton text={Localizer.l("parameterEditorParameterListAddButtonLabel")} iconProps={addIcon} onClick={setAddNewIsShown} />
                    )}
                </Stack>

                <Stack>
                    <SearchBox placeholder="Search" onSearch={searchFunction} />
                </Stack>
                {createParameterFields()}
            </Panel>
        </div>
    );
};
