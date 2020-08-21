import { ActionButton } from "office-ui-fabric-react/lib/Button";
import * as React from "react";
import { MediaGraphTopology } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { SampleSelector } from "./SampleSelector";
import { Status } from "./statusEnum";

interface ISampleSelectorTriggerProps {
    setTopology: (topology: MediaGraphTopology) => void;
    hasUnsavedChanges: boolean;
}

export const SampleSelectorTrigger: React.FunctionComponent<ISampleSelectorTriggerProps> = (props) => {
    const [status, setStatus] = React.useState<Status>(Status.NoDisplay);

    const loadTopology = (topology: MediaGraphTopology) => {
        setStatus(Status.NoDisplay);
        props.setTopology(topology);
    };

    const openSelector = () => {
        setStatus(props.hasUnsavedChanges ? Status.ConfirmOverwrite : Status.SelectSample);
    };

    return (
        <>
            <ActionButton iconProps={{ iconName: "Flow" }} onClick={openSelector}>
                {Localizer.l("sampleSelectorButtonText")}
            </ActionButton>
            <SampleSelector status={status} setStatus={setStatus} loadTopology={loadTopology} />
        </>
    );
};
