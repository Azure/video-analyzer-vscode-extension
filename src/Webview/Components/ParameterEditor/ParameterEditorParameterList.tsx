import {
    DefaultButton,
    Dropdown,
    getTheme,
    Link,
    SearchBox,
    Stack,
    TextField
} from "office-ui-fabric-react";
import * as React from "react";
import { useBoolean } from "@uifabric/react-hooks";
import {
    MediaGraphParameterDeclaration,
    MediaGraphParameterType
} from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { createParameter } from "./createParameter";
import { ParameterEditorCreateForm } from "./ParameterEditorCreateForm";

interface IParameterEditorParameterListProps {
    parameters: MediaGraphParameterDeclaration[];
    onAddNew?: (newValue: string) => void;
    renderItemList: (items: MediaGraphParameterDeclaration[], entryContainerStyles: React.CSSProperties, entryDetailsStyles: React.CSSProperties) => JSX.Element; // TODO: fix
}

export const ParameterEditorParameterList: React.FunctionComponent<IParameterEditorParameterListProps> = (props) => {
    const { parameters, onAddNew, renderItemList } = props;
    const [shownFilteredItems, setShownFilteredItems] = React.useState<MediaGraphParameterDeclaration[]>([]);
    const [isCreateFormShown, { toggle: toggleCreateForm }] = useBoolean(false);
    const [parameterCreationConfiguration, setParameterCreationConfiguration] = React.useState<MediaGraphParameterDeclaration | undefined>();

    const items: MediaGraphParameterDeclaration[] = [
        ...parameters,
        {
            name: "System.DateTime",
            type: "String" as MediaGraphParameterType
        },
        {
            name: "System.GraphTopologyName",
            type: "String" as MediaGraphParameterType
        },
        {
            name: "System.GraphInstanceName",
            type: "String" as MediaGraphParameterType
        }
    ];

    const onSearchChange = (event?: React.ChangeEvent, newValue?: string) => {
        if (newValue) {
            const lowerCaseQuery = newValue.toLocaleLowerCase();
            setShownFilteredItems(items.filter((item) => item.name.toLocaleLowerCase().includes(lowerCaseQuery)));
        } else {
            setShownFilteredItems([]);
        }
    };

    const onCreateFormAddClick = () => {
        if (parameterCreationConfiguration?.name && parameterCreationConfiguration?.type && onAddNew) {
            createParameter(parameterCreationConfiguration, parameters); //TODO. check for duplicates
            onAddNew(`$\{${parameterCreationConfiguration.name}}`);
        }
    };

    const theme = getTheme();
    const parameterListStyles = {
        marginTop: 20
    };
    const parameterListItemContainerStyles = {
        width: "100%"
    };
    const parameterListEntryStyles = {
        border: "1px solid",
        borderColor: theme.palette.neutralTertiary,
        borderRadius: 2,
        padding: 10
    };
    const parameterListEntryDetailsStyles = {
        paddingLeft: 26,
        color: theme.palette.neutralSecondary
    };

    return (
        <Stack tokens={{ childrenGap: "s1" }} style={parameterListItemContainerStyles}>
            <Stack horizontal tokens={{ childrenGap: "s1" }}>
                <SearchBox placeholder={Localizer.l("parameterEditorParameterListSearchPlaceholder")} onChange={onSearchChange} styles={{ root: { flexGrow: 1 } }} />
                {onAddNew && !isCreateFormShown && (
                    <DefaultButton text={Localizer.l("parameterEditorParameterListAddButtonLabel")} iconProps={{ iconName: "Add" }} onClick={toggleCreateForm} />
                )}
            </Stack>
            {isCreateFormShown && (
                <Stack horizontal tokens={{ childrenGap: "s1" }} verticalAlign={"end"}>
                    <ParameterEditorCreateForm setParameterCreationConfiguration={setParameterCreationConfiguration} horizontal={true} />
                    <DefaultButton
                        iconProps={{ iconName: "Add" }}
                        onClick={onCreateFormAddClick}
                        disabled={parameterCreationConfiguration == null || parameterCreationConfiguration.name == null || parameterCreationConfiguration.type == null}
                    />
                </Stack>
            )}
            {renderItemList(shownFilteredItems.length > 0 ? shownFilteredItems : items, parameterListEntryStyles, parameterListEntryDetailsStyles)}
        </Stack>
    );
};
