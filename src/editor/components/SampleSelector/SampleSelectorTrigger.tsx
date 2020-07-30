import * as React from "react";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { useBoolean } from "@uifabric/react-hooks";
import { SampleSelector } from "./SampleSelector";
import Localizer from "../../../localization";

interface ISampleSelectorTriggerProps {
  setTopology: (topology: any) => void;
  hasUnsavedChanges: boolean;
}

export const SampleSelectorTrigger: React.FunctionComponent<ISampleSelectorTriggerProps> = (
  props
) => {
  const [showSelector, { toggle: toggleSelector }] = useBoolean(false);

  const loadTopology = (topology: any) => {
    toggleSelector();
    props.setTopology(topology);
  };

  return (
    <>
      <DefaultButton
        text={Localizer.l("sampleSelectorButtonText")}
        onClick={toggleSelector}
      />

      {showSelector && (
        <SampleSelector
          loadTopology={loadTopology}
          hasUnsavedChanges={props.hasUnsavedChanges}
        />
      )}
    </>
  );
};
