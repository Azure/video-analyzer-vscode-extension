import * as React from "react";
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  hiddenContentStyle,
  mergeStyles,
  Dropdown,
  IDropdownOption,
} from "office-ui-fabric-react";
import { useId } from "@uifabric/react-hooks";
import { sampleOptionsList } from "./sampleList";
import { OverwriteConfirmation } from "./OverwriteConfirmation";

const screenReaderOnly = mergeStyles(hiddenContentStyle);
const dialogContentProps = {
  type: DialogType.normal,
  title: "Select a Sample Topology",
  closeButtonAriaLabel: "Close",
  subText: "Jumpstart your topology creation with our built-in samples.",
};

enum Status {
  NoDisplay,
  SelectSample,
  ConfirmOverwrite,
  LoadingSample,
}

interface ISampleSelectorProps {
  loadTopology: (topology: any) => void;
  noSelection: () => void;
  hasUnsavedChanges: boolean;
}

export const SampleSelector: React.FunctionComponent<ISampleSelectorProps> = (
  props
) => {
  const { loadTopology, noSelection, hasUnsavedChanges } = props;

  const [topology, setTopology] = React.useState<any>({});
  const [status, setStatus] = React.useState<Status>(Status.SelectSample);
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

  let selectedSampleApiUrl = "";

  function onChange(
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) {
    if (option) {
      selectedSampleApiUrl = option.key as string;
    }
  }

  function confirmSelection() {
    if (hasUnsavedChanges) {
      setStatus(Status.ConfirmOverwrite);
    } else {
      setStatus(Status.LoadingSample);
    }

    fetch(selectedSampleApiUrl)
      .then((response) => response.json() as any)
      .then((data) => atob(data.content))
      .then((topology) => {
        if (!hasUnsavedChanges) {
          loadTopology(JSON.parse(topology));
          dismissSelector();
        } else {
          setTopology(JSON.parse(topology));
        }
      })
      .catch((error) => {
        noSelection();
      });
  }

  function dismissSelector() {
    setStatus(Status.NoDisplay);
  }

  function selectSample() {
    loadTopology(topology);
    dismissSelector();
  }

  return (
    <>
      <label id={labelId} className={screenReaderOnly}>
        My sample label
      </label>
      <label id={subTextId} className={screenReaderOnly}>
        My sample description
      </label>

      <Dialog
        hidden={status !== Status.SelectSample}
        onDismiss={dismissSelector}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
      >
        <Dropdown
          placeholder="Select an option"
          label="Topology Name"
          options={sampleOptionsList}
          onChange={onChange}
        />
        <DialogFooter>
          <PrimaryButton onClick={confirmSelection} text="Load Sample" />
          <DefaultButton onClick={dismissSelector} text="Cancel" />
        </DialogFooter>
      </Dialog>

      <OverwriteConfirmation
        shown={status === Status.ConfirmOverwrite}
        confirm={selectSample}
        dismiss={dismissSelector}
      />
    </>
  );
};
