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
} from "office-ui-fabric-react";
import * as React from "react";
import { useId } from "@uifabric/react-hooks";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { ParameterizeValueCallback } from "../../Types/GraphTypes";
import { AdjustedIconButton } from "../ThemeAdjustedComponents/AdjustedIconButton";
import { AdjustedPrimaryButton } from "../ThemeAdjustedComponents/AdjustedPrimaryButton";
import { createParameter } from "./createParameter";
import { ParameterEditorAdvanced } from "./ParameterEditorAdvanced";
import { ParameterEditorSimple } from "./ParameterEditorSimple";

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
    const [parameterCreationConfiguration, setParameterCreationConfiguration] = React.useState<MediaGraphParameterDeclaration | undefined>();

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
        if (parameterCreationConfiguration) {
            createParameter(parameterCreationConfiguration, parameters); // TODO. check for duplicates.
            onSelectValue(`$\{${parameterCreationConfiguration.name}}`);
        } else if (selectedValue) {
            onSelectValue(selectedValue);
        }
        hideModal();
    };

    const resetSelectedValue = () => {
        setSelectedValue("");
        setParameterCreationConfiguration(undefined);
    };

    return (
        <Dialog
            hidden={!isShown}
            onDismiss={hideModal}
            maxWidth={800}
            dialogContentProps={{
                //className: contentStyles.container,
                styles: { inner: { minWidth: 600 }, innerContent: { maxHeight: 800 } },
                titleProps: { id: titleId },
                type: DialogType.normal,
                title: Localizer.l("parameterEditorTitle").format(propertyName),
                subText: Localizer.l("parameterEditorText")
            }}
            modalProps={{ isBlocking: true, titleAriaId: titleId, topOffsetFixed: true }}
        >
            <div className={contentStyles.body}>
                <Pivot
                    aria-label={Localizer.l("parameterEditorPivotAriaLabel")}
                    styles={{
                        itemContainer: {
                            paddingTop: 10
                        }
                    }}
                    onLinkClick={resetSelectedValue}
                    defaultSelectedIndex={useAdvancedEditor ? 1 : 0}
                >
                    <PivotItem headerText={Localizer.l("parameterEditorPivotBasicTabLabel")}>
                        <ParameterEditorSimple
                            parameters={parameters}
                            setSelectedValue={setSelectedValue}
                            setParameterCreationConfiguration={setParameterCreationConfiguration}
                            resetSelectedValue={resetSelectedValue}
                        />
                    </PivotItem>
                    <PivotItem headerText={Localizer.l("parameterEditorPivotAdvancedTabLabel")}>
                        <ParameterEditorAdvanced parameters={parameters} setSelectedValue={setSelectedValue} prevValue={prevValue} />
                    </PivotItem>
                </Pivot>
            </div>
            <DialogFooter>
                <AdjustedPrimaryButton text={Localizer.l("parameterEditorUseParameterInPropertyButtonText")} onClick={onClickUse} />
                <DefaultButton text={Localizer.l("cancelButtonText")} onClick={hideModal} />
            </DialogFooter>
        </Dialog>
    );
};

export default ParameterEditor;
