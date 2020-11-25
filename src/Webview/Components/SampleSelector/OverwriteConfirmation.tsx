import * as React from "react";
import {
    DefaultButton,
    Dialog,
    DialogFooter,
    DialogType
} from "@fluentui/react";
import Localizer from "../../Localization/Localizer";
import { AdjustedPrimaryButton } from "../ThemeAdjustedComponents/AdjustedPrimaryButton";

interface IOverwriteConfirmationProps {
    shown: boolean;
    confirm: () => void;
    dismiss: () => void;
}

export const OverwriteConfirmation: React.FunctionComponent<IOverwriteConfirmationProps> = (props: IOverwriteConfirmationProps) => {
    const dialogContentProps = {
        type: DialogType.normal,
        title: Localizer.l("sampleSelectorOverwriteConfirmationTitle"),
        subText: Localizer.l("sampleSelectorOverwriteConfirmationText")
    };

    return (
        <>
            <Dialog hidden={!props.shown} onDismiss={props.dismiss} dialogContentProps={dialogContentProps}>
                <DialogFooter>
                    <AdjustedPrimaryButton onClick={props.confirm} text={Localizer.l("sampleSelectorOverwriteConfirmButtonText")} />
                    <DefaultButton onClick={props.dismiss} text={Localizer.l("sampleSelectorOverwriteKeepButtonText")} />
                </DialogFooter>
            </Dialog>
        </>
    );
};
