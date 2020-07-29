import * as React from "react";
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  hiddenContentStyle,
  mergeStyles,
} from "office-ui-fabric-react";
import { useId } from "@uifabric/react-hooks";

const screenReaderOnly = mergeStyles(hiddenContentStyle);
const dialogContentProps = {
  type: DialogType.normal,
  title: "Existing Changes",
  closeButtonAriaLabel: "Close",
  subText:
    "Your existing changes will be lost if you continue. Do you want to overwrite or keep your changes?",
};

interface IOverwriteConfirmationProps {
  shown: boolean;
  confirm: () => void;
  dismiss: () => void;
}

export const OverwriteConfirmation: React.FunctionComponent<IOverwriteConfirmationProps> = (
  props: IOverwriteConfirmationProps
) => {
  const labelId: string = useId("dialogLabel");
  const subTextId: string = useId("subTextLabel");

  const modalProps = React.useMemo(
    () => ({
      titleAriaId: labelId,
      subtitleAriaId: subTextId,
      isBlocking: false,
    }),
    [labelId, subTextId]
  );

  return (
    <>
      <label id={labelId} className={screenReaderOnly}>
        My sample label
      </label>
      <label id={subTextId} className={screenReaderOnly}>
        My sample description
      </label>

      <Dialog
        hidden={!props.shown}
        onDismiss={props.dismiss}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
      >
        <DialogFooter>
          <PrimaryButton onClick={props.confirm} text="Overwrite" />
          <DefaultButton onClick={props.dismiss} text="Keep" />
        </DialogFooter>
      </Dialog>
    </>
  );
};
