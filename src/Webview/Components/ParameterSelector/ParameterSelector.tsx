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
import { MediaGraphParameterDeclaration } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { createParameter } from "../ParameterEditor/createParameter";
import { ParameterEditorCreateForm } from "../ParameterEditor/ParameterEditorCreateForm";
import { EditableParameter } from "./EditableParameter";

interface ParameterSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    parameters: any;
}

const addIcon: IIconProps = { iconName: "Add" };

export const ParameterSelector: React.FunctionComponent<ParameterSelectorProps> = (props) => {
    const { isOpen, onClose, parameters } = props;
    const [addNewIsShown, { toggle: setAddNewIsShown }] = useBoolean(false);
    const [searchParameter, setSearchParameters] = React.useState<string>("");
    const [parameterCreationConfiguration, setParameterCreationConfiguration] = React.useState<MediaGraphParameterDeclaration | undefined>();

    const createParameterFields = () => {
        if (parameters) {
            return (
                <Stack style={{ paddingTop: "10px" }}>
                    {getParameters().map((p: any, idx: number) => {
                        return <EditableParameter object={p} key={p.name} />;
                    })}
                </Stack>
            );
        }
    };

    const searchFunction = (search: any) => {
        setSearchParameters(search);
    };

    const getParameters = () => {
        return parameters.filter((parameter: any) => {
            return parameter.name.toLowerCase().includes(searchParameter.toLowerCase());
        });
    };

    const onCreateFormAddClick = () => {
        if (parameterCreationConfiguration?.name && parameterCreationConfiguration?.type) {
            createParameter(parameterCreationConfiguration, parameters); //TODO. check for duplicates
            setAddNewIsShown();
        }
    };

    return (
        <div>
            <Panel isOpen={isOpen} onDismiss={onClose} closeButtonAriaLabel="Close">
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
                        <Stack>
                            <ParameterEditorCreateForm setParameterCreationConfiguration={setParameterCreationConfiguration} />
                            <Stack style={{ paddingTop: "15px" }}>
                                <DefaultButton
                                    text="Add"
                                    onClick={onCreateFormAddClick}
                                    disabled={
                                        parameterCreationConfiguration == null ||
                                        parameterCreationConfiguration.name == null ||
                                        parameterCreationConfiguration.type == null
                                    }
                                />
                            </Stack>
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
