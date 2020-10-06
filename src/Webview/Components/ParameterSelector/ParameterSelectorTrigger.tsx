import { ActionButton } from "office-ui-fabric-react/lib/Button";
import React, { useState } from "react";
import Localizer from "../../Localization/Localizer";
import { ParameterSelector } from "./ParameterSelector";

interface IParameterSelectorTriggerProps {
    parameters: any;
    graph: any;
}

export const ParameterSelectorTrigger: React.FunctionComponent<IParameterSelectorTriggerProps> = (props) => {
    const { parameters, graph } = props;
    const [isOpen, toggleSelector] = useState(false);

    const toggleParameterSelector = () => {
        toggleSelector(!isOpen);
    };

    return (
        <>
            <ActionButton iconProps={{ iconName: "VariableGroup" }} onClick={toggleParameterSelector}>
                {Localizer.l("manageParamatersButtonText")}
            </ActionButton>
            <ParameterSelector isOpen={isOpen} parameters={parameters} graph={graph} onClose={() => toggleSelector(!isOpen)} />
        </>
    );
};
