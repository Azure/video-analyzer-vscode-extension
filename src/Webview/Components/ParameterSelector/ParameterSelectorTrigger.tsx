import { ActionButton } from "office-ui-fabric-react/lib/Button";
import React, { useState } from "react";
import Localizer from "../../Localization/Localizer";
import { ParameterSelector } from "./ParameterSelector";

interface IParameterSelectorTriggerProps {
    parameters: any;
}

export const ParameterSelectorTrigger: React.FunctionComponent<IParameterSelectorTriggerProps> = (props) => {
    const [isOpen, toggleSelector] = useState(false);

    const toggleParameterSelector = () => {
        console.log("toggle ", isOpen);
        console.log("parameters", props.parameters);
        toggleSelector(!isOpen);
    };

    return (
        <>
            <ActionButton iconProps={{ iconName: "VariableGroup" }} onClick={toggleParameterSelector}>
                {Localizer.l("manageParamatersButtonText")}
            </ActionButton>
            <ParameterSelector isOpen={isOpen} parameters={props.parameters} onClose={() => toggleSelector(!isOpen)} />
        </>
    );
};
