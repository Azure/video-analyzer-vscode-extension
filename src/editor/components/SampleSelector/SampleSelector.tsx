import * as React from "react";
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  IDropdownOption,
} from "office-ui-fabric-react";
import { sampleOptionsList } from "./sampleList";
import { OverwriteConfirmation } from "./OverwriteConfirmation";
import Localizer from "../../../localization";

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

  const dialogContentProps = {
    type: DialogType.close,
    closeButtonAriaLabel: Localizer.l("dialogCloseButtonAriaLabel"),
    title: Localizer.l("sampleSelectorTitle"),
    subText: Localizer.l("sampleSelectorText"),
  };

  const modalProps = {
    isBlocking: false,
  };

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
      <Dialog
        hidden={status !== Status.SelectSample}
        onDismiss={dismissSelector}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
      >
        <Dropdown
          placeholder={Localizer.l("sampleSelectorDropdownPlaceholderText")}
          label={Localizer.l("sampleSelectorDropdownLabel")}
          options={sampleOptionsList}
          onChange={onChange}
        />
        <DialogFooter>
          <PrimaryButton
            onClick={confirmSelection}
            text={Localizer.l("sampleSelectorLoadSampleButtonText")}
          />
          <DefaultButton
            onClick={dismissSelector}
            text={Localizer.l("cancelButtonText")}
          />
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
