import * as React from "react";
import {
    DefaultButton,
    Dialog,
    DialogFooter,
    DialogType,
    FontWeights,
    getTheme,
    mergeStyleSets,
    Pivot,
    PivotItem,
    Stack
} from "@fluentui/react";
import { useId } from "@uifabric/react-hooks";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { ParameterizeValueCallback } from "../../Types/GraphTypes";
import { ParamCreateConfig } from "../ParameterSelector/ParameterSelector";
import { AdjustedIconButton } from "../ThemeAdjustedComponents/AdjustedIconButton";
import { AdjustedPrimaryButton } from "../ThemeAdjustedComponents/AdjustedPrimaryButton";
import { createParameter } from "./createParameter";
import { ParameterEditorAdvanced } from "./ParameterEditorAdvanced";
import { ParameterEditorChoice } from "./ParameterEditorChoice";

interface IParameterEditorProps {
    onSelectValue: ParameterizeValueCallback;
    parameters: MediaGraphParameterDeclaration[];
    isShown: boolean;
    hideModal: () => void;
    propertyName: string;
    prevValue?: string;
}

const ParameterEditor: React.FunctionComponent<IParameterEditorProps> = (props) => {
    const { onSelectValue, parameters, isShown, hideModal, propertyName, prevValue = "" } = props;
    const [selectedValue, setSelectedValue] = React.useState<string>("");
    const [paramCreateConfig, setParamCreateConfig] = React.useState<ParamCreateConfig | undefined>();

    // use the advanced editor if there are more than two parameters
    const useAdvancedEditor = prevValue.split("${").length > 2;

    const theme = getTheme();

    const contentStyles = mergeStyleSets({
        container: {
            minWidth: 600,
            maxHeight: 400
        },
        body: {
            flex: 1,
            overflowY: "auto"
        },
        scrollContainer: {
            display: "flex",
            flexDirection: "column"
        }
    });

    const titleId = useId("title");

    const onClickUse = () => {
        if (paramCreateConfig) {
            createParameter(paramCreateConfig, parameters); // TODO. check for duplicates.
            onSelectValue(`$\{${paramCreateConfig.name}}`);
        } else if (selectedValue) {
            onSelectValue(selectedValue);
        }
        hideModal();
    };

    const resetSelectedValue = () => {
        setSelectedValue("");
        setParamCreateConfig(undefined);
    };

    const setButtonDisabled = () => {
        return (paramCreateConfig == null && selectedValue === "") || paramCreateConfig?.name == "";
    };

    return (
        <Dialog
            hidden={!isShown}
            onDismiss={hideModal}
            maxWidth={800}
            dialogContentProps={{
                styles: { inner: { minWidth: 600 }, innerContent: { maxHeight: 800 } },
                titleProps: { id: titleId },
                type: DialogType.close,
                title: Localizer.l("parameterEditorTitle").format(propertyName),
                subText: Localizer.l("parameterEditorText")
            }}
            modalProps={{ isBlocking: true, titleAriaId: titleId, topOffsetFixed: false }}
        >
            <div className={contentStyles.body}>
                <ParameterEditorChoice
                    parameters={parameters}
                    setSelectedValue={setSelectedValue}
                    setParamCreateConfig={setParamCreateConfig}
                    resetSelectedValue={resetSelectedValue}
                    prevValue={prevValue}
                />
            </div>
            <DialogFooter>
                <AdjustedPrimaryButton text={Localizer.l("parameterEditorUseParameterInPropertyButtonText")} onClick={onClickUse} disabled={setButtonDisabled()} />
                <DefaultButton text={Localizer.l("cancelButtonText")} onClick={hideModal} />
            </DialogFooter>
        </Dialog>
    );
};

export default ParameterEditor;
