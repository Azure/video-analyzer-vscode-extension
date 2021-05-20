import * as React from "react";
import {
    CheckboxVisibility,
    ChoiceGroup,
    DetailsList,
    DetailsListLayoutMode,
    IChoiceGroupOption,
    IColumn,
    ScrollablePane,
    Selection,
    SelectionMode
} from "@fluentui/react";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/VideoAnalyzerSDKTypes";
import Localizer from "../../Localization/Localizer";
import { ParamCreateConfig } from "../ParameterSelector/ParameterSelector";
import { ParameterEditorAdvanced } from "./ParameterEditorAdvanced";
import { ParameterEditorCreateForm } from "./ParameterEditorCreateForm";
import { ParameterEditorParameterList } from "./ParameterEditorParameterList";

interface IParameterEditorChoiceProps {
    parameters: MediaGraphParameterDeclaration[];
    setSelectedValue: (newValue: string) => void;
    setParamCreateConfig: (newParameter: ParamCreateConfig) => void;
    resetSelectedValue: () => void;
    prevValue: string;
}

export const ParameterEditorChoice: React.FunctionComponent<IParameterEditorChoiceProps> = (props) => {
    const { parameters, setSelectedValue, setParamCreateConfig, resetSelectedValue, prevValue } = props;

    const options: IChoiceGroupOption[] = [
        {
            key: "new",
            text: Localizer.l("parameterEditorChoiceCreateNewLabel"),
            styles: {
                root: {
                    marginRight: 10,
                    marginTop: 0
                }
            }
        },
        {
            key: "existing",
            text: Localizer.l("parameterEditorChoiceUseExistingLabel"),
            styles: {
                root: {
                    marginRight: 10,
                    marginTop: 0
                }
            }
        },
        {
            key: "advanced",
            text: Localizer.l("parameterEditorChoiceAdvancedLabel"),
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

    const selectPanel = (selectedKey: string) => {
        switch (selectedKey) {
            case "new":
                return <ParameterEditorCreateForm setParamCreateConfig={setParamCreateConfig} parameters={parameters} />;
            case "existing":
                return <ParameterEditorParameterList parameters={parameters} setSelectedValue={setSelectedValue} />;
            default:
                return <ParameterEditorAdvanced parameters={parameters} setSelectedValue={setSelectedValue} prevValue={prevValue} />;
        }
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
            <React.Suspense fallback={<></>}>
                <div
                    style={{
                        marginTop: 10
                    }}
                >
                    {selectPanel(selectedFormKey)}
                </div>
            </React.Suspense>
        </>
    );
};
