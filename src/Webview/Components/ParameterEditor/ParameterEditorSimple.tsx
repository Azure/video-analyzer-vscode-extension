import {
    ChoiceGroup,
    DetailsList,
    DetailsListLayoutMode,
    IChoiceGroupOption,
    IColumn,
    ScrollablePane,
    Selection,
    SelectionMode
} from "office-ui-fabric-react";
import * as React from "react";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { ParameterEditorCreateForm } from "./ParameterEditorCreateForm";
import { ParameterEditorParameterList } from "./ParameterEditorParameterList";

interface IParameterEditorSimpleProps {
    parameters: MediaGraphParameterDeclaration[];
    setSelectedValue: (newValue: string) => void;
    setParameterCreationConfiguration: (newParameter: MediaGraphParameterDeclaration) => void;
    resetSelectedValue: () => void;
}

export const ParameterEditorSimple: React.FunctionComponent<IParameterEditorSimpleProps> = (props) => {
    const { parameters, setSelectedValue, setParameterCreationConfiguration, resetSelectedValue } = props;

    const options: IChoiceGroupOption[] = [
        {
            key: "new",
            text: Localizer.l("parameterEditorBasicEditorSourceCreateNewLabel"),
            styles: {
                root: {
                    marginRight: 10,
                    marginTop: 0
                }
            }
        },
        {
            key: "existing",
            text: Localizer.l("parameterEditorBasicEditorSourceUseExistingLabel"),
            styles: {
                root: {
                    marginTop: 0
                }
            }
        }
    ];
    const firstKey = options[0].key;
    const [selectedFormKey, setSelectedFormKey] = React.useState<string>(firstKey);

    const onParameterSourceChange = (ev?: React.FormEvent, option?: IChoiceGroupOption) => {
        if (option) {
            setSelectedFormKey(option.key);
        }
        resetSelectedValue();
    };

    const selection = new Selection({
        onSelectionChanged: () => {
            const selectedItems = selection.getSelection();
            if (selectedItems?.length) {
                console.log(selectedItems);
                setSelectedValue(`$\{${(selectedItems[0] as IColumn).name}}`);
            }
        },
        selectionMode: SelectionMode.single
    });

    const renderItemList = (items: MediaGraphParameterDeclaration[], entryContainerStyles: React.CSSProperties, entryDetailsStyles: React.CSSProperties) => {
        return (
            <div style={{ position: "relative", minHeight: 200 }}>
                <ScrollablePane>
                    <DetailsList
                        items={items}
                        columns={[
                            { key: "name", name: "name", fieldName: "name", minWidth: 10, isRowHeader: true },
                            { key: "type", name: "type", fieldName: "type", minWidth: 80 },
                            { key: "default", name: "default", fieldName: "default", minWidth: 80 }
                        ]}
                        selectionMode={SelectionMode.single}
                        selection={selection}
                    />
                </ScrollablePane>
            </div>
        );
    };

    return (
        <>
            <ChoiceGroup
                defaultSelectedKey={firstKey}
                options={options}
                onChange={onParameterSourceChange}
                label={Localizer.l("parameterEditorBasicEditorSourceChoiceLabel")}
                required={true}
                styles={{
                    flexContainer: {
                        display: "flex"
                    }
                }}
            />
            {selectedFormKey === "new" ? (
                <div
                    style={{
                        marginTop: 10
                    }}
                >
                    <ParameterEditorCreateForm setParameterCreationConfiguration={setParameterCreationConfiguration} />
                </div>
            ) : (
                <ParameterEditorParameterList renderItemList={renderItemList} parameters={parameters} />
            )}
        </>
    );
};
