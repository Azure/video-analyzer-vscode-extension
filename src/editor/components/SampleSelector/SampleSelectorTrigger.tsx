import * as React from "react";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { SampleSelector } from "./SampleSelector";
import Localizer from "../../../localization/Localizer";
import { Status } from "./statusEnum";

interface ISampleSelectorTriggerProps {
  setTopology: (topology: any) => void;
  hasUnsavedChanges: boolean;
}

export const SampleSelectorTrigger: React.FunctionComponent<ISampleSelectorTriggerProps> = (
  props
) => {
  const [status, setStatus] = React.useState<Status>(Status.NoDisplay);

  const loadTopology = (topology: any) => {
    setStatus(Status.NoDisplay);
    props.setTopology(topology);
  };

  const openSelector = () => {
    setStatus(
      props.hasUnsavedChanges ? Status.ConfirmOverwrite : Status.SelectSample
    );
  };

  return (
    <>
      <DefaultButton
        text={Localizer.l("sampleSelectorButtonText")}
        onClick={openSelector}
      />

      <SampleSelector
        status={status}
        setStatus={setStatus}
        loadTopology={loadTopology}
      />
    </>
  );
};
