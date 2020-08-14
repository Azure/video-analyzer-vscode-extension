import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import * as React from "react";
import Localizer from "../../../localization/Localizer";
import { MediaGraphTopology } from "../../../lva-sdk/lvaSDKtypes";
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
            <DefaultButton text={Localizer.l("sampleSelectorButtonText")} onClick={openSelector} />

            <SampleSelector status={status} setStatus={setStatus} loadTopology={loadTopology} />
        </>
    );
};
