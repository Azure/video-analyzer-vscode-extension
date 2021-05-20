import * as React from "react";
import {
    Announced,
    CheckboxVisibility,
    DefaultButton,
    DetailsList,
    DetailsListLayoutMode,
    Dropdown,
    getTheme,
    IColumn,
    Link,
    ScrollablePane,
    SearchBox,
    Selection,
    SelectionMode,
    Stack,
    TextField
} from "@fluentui/react";
import { useBoolean } from "@uifabric/react-hooks";
import {
    MediaGraphParameterDeclaration,
    MediaGraphParameterType
} from "../../../Common/Types/VideoAnalyzerSDKTypes";
import Definitions from "../../Definitions/Definitions";
import Localizer from "../../Localization/Localizer";
import { ParamCreateConfig } from "../ParameterSelector/ParameterSelector";
import { createParameter } from "./createParameter";
import { ParameterEditorCreateForm } from "./ParameterEditorCreateForm";

interface IParameterEditorParameterListProps {
    parameters: MediaGraphParameterDeclaration[];
    onAddNew?: (newValue: string) => void;
    renderItemList?: (items: MediaGraphParameterDeclaration[], entryContainerStyles: React.CSSProperties, entryDetailsStyles: React.CSSProperties) => JSX.Element; // TODO: fix
    setSelectedValue?: (newValue: string) => void;
}

export const ParameterEditorParameterList: React.FunctionComponent<IParameterEditorParameterListProps> = (props) => {
    const { parameters, onAddNew, renderItemList, setSelectedValue } = props;
    const [shownFilteredItems, setShownFilteredItems] = React.useState<MediaGraphParameterDeclaration[]>([]);
    const [isCreateFormShown, { toggle: toggleCreateForm }] = useBoolean(false);
    const [filterText, setFilterText] = React.useState<string>("");
    const [paramCreateConfig, setParamCreateConfig] = React.useState<ParamCreateConfig | undefined>();
    Definitions.IsLegacyModule;
    const items: MediaGraphParameterDeclaration[] = [
        ...parameters,
        ...(Definitions.IsLegacyModule
            ? [
                  {
                      name: "System.DateTime",
                      type: MediaGraphParameterType.String
                  },
                  {
                      name: "System.GraphTopologyName",
                      type: MediaGraphParameterType.String
                  },
                  {
                      name: "System.GraphInstanceName",
                      type: MediaGraphParameterType.String
                  }
              ]
            : [
                  { name: "System.TopologyName", type: MediaGraphParameterType.String },
                  { name: "System.PipelineName", type: MediaGraphParameterType.String },
                  { name: "System.Runtime.DateTime", type: MediaGraphParameterType.String },
                  { name: "System.Runtime.PreciseDateTime", type: MediaGraphParameterType.String }
              ])
    ];

    let renderItemsFunction = renderItemList;
    if (!renderItemsFunction) {
        const selection = new Selection({
            onSelectionChanged: () => {
                const selectedItems = selection.getSelection();
                if (selectedItems?.length) {
                    if (setSelectedValue) {
                        setSelectedValue(`$\{${(selectedItems[0] as IColumn).name}}`);
                    }
                }
            },
            selectionMode: SelectionMode.single
        });

        renderItemsFunction = (items: MediaGraphParameterDeclaration[], entryContainerStyles: React.CSSProperties, entryDetailsStyles: React.CSSProperties) => {
            return (
                <div style={{ position: "relative", minHeight: 200 }}>
                    <ScrollablePane>
                        <DetailsList
                            items={items}
                            layoutMode={DetailsListLayoutMode.justified}
                            checkboxVisibility={CheckboxVisibility.always}
                            columns={[
                                { key: "name", name: "name", fieldName: "name", minWidth: 10, isRowHeader: true },
                                { key: "type", name: "type", fieldName: "type", minWidth: 80 },
                                { key: "default", name: "default", fieldName: "default", minWidth: 80 }
                            ]}
                            selection={selection}
                            compact={true}
                        />
                    </ScrollablePane>
                </div>
            );
        };
    }

    const onSearchChange = (event?: React.FormEvent, newValue?: string) => {
        setFilterText(newValue!);
        if (newValue) {
            const lowerCaseQuery = newValue.toLocaleLowerCase();
            setShownFilteredItems(items.filter((item) => item.name.toLocaleLowerCase().includes(lowerCaseQuery)));
        } else {
            setShownFilteredItems([]);
        }
    };

    const onCreateFormAddClick = () => {
        if (paramCreateConfig?.name && paramCreateConfig?.type && onAddNew) {
            createParameter(paramCreateConfig, parameters); //TODO. check for duplicates
            onAddNew(`$\{${paramCreateConfig.name}}`);
            toggleCreateForm();
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
                <TextField
                    label={Localizer.l("parameterEditorParameterListSearchLabel")}
                    onChange={onSearchChange}
                    styles={onAddNew ? { root: { flexGrow: 1 } } : { root: { maxWidth: 350 } }}
                />
                {onAddNew && (
                    <DefaultButton
                        disabled={isCreateFormShown}
                        text={Localizer.l("parameterEditorParameterListAddButtonLabel")}
                        iconProps={{ iconName: "Add" }}
                        onClick={toggleCreateForm}
                        style={{ alignSelf: "flex-end" }}
                    />
                )}
            </Stack>
            {isCreateFormShown && (
                <Stack horizontal tokens={{ childrenGap: "s1" }} verticalAlign={"end"}>
                    <ParameterEditorCreateForm setParamCreateConfig={setParamCreateConfig} horizontal={true} parameters={parameters} />
                    <DefaultButton
                        iconProps={{ iconName: "Add" }}
                        onClick={onCreateFormAddClick}
                        disabled={paramCreateConfig == null || paramCreateConfig.name == null || paramCreateConfig.type == null || !!paramCreateConfig.nameError}
                    />
                </Stack>
            )}
            <Announced message={Localizer.l("parameterEditorParameterListFilteredAnnounce").format(shownFilteredItems.length || items.length)} />
            {renderItemsFunction(filterText ? shownFilteredItems : items, parameterListEntryStyles, parameterListEntryDetailsStyles)}
        </Stack>
    );
};
