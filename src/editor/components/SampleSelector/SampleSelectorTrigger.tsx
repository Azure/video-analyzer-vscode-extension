import * as React from "react";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { useBoolean } from "@uifabric/react-hooks";
import { SampleSelector } from "./SampleSelector";

interface ISampleSelectorTriggerProps {
  setTopology: (topology: any) => void;
  hasUnsavedChanges: boolean;
}

export const SampleSelectorTrigger: React.FunctionComponent<ISampleSelectorTriggerProps> = (
  props
) => {
  const [showSelector, { toggle: toggleSelector }] = useBoolean(false);

  function loadTopology(topology: any) {
    toggleSelector();
    props.setTopology(topology);
  }

  return (
    <>
      <DefaultButton text="Select Sample" onClick={toggleSelector} />

      {showSelector && (
        <SampleSelector
          loadTopology={loadTopology}
          noSelection={() => null}
          hasUnsavedChanges={props.hasUnsavedChanges}
        />
      )}
    </>
  );
};
