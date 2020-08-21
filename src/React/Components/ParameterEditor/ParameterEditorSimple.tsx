import {
    ChoiceGroup,
    IChoiceGroupOption,
    IStyle,
    Text
} from "office-ui-fabric-react";
import * as React from "react";
import Localizer from "../../../Localization/Localizer";
import { MediaGraphParameterDeclaration } from "../../../Types/LVASDKTypes";
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

    const onParameterValueChange = (ev?: React.FormEvent, option?: IChoiceGroupOption) => {
        if (option && option.key) {
            setSelectedValue(`$\{${option.key}}`);
        }
    };

    const renderItemList = (items: MediaGraphParameterDeclaration[], entryContainerStyles: React.CSSProperties, entryDetailsStyles: React.CSSProperties) => {
        const options: IChoiceGroupOption[] = items.map((item) => ({
            key: item.name,
            text: item.name,
            onRenderLabel: (props, render) => {
                return (
                    <>
                        {render!(props)}
                        <div style={entryDetailsStyles}>
                            <Text variant={"medium"}>{item.type}</Text>
                        </div>
                    </>
                );
            },
            styles: {
                root: entryContainerStyles as IStyle,
                field: {
                    fontWeight: "bold" as const
                }
            }
        }));
        return <ChoiceGroup options={options} styles={{ root: { marginTop: -8 } }} onChange={onParameterValueChange} />;
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
