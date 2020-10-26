import { ActionButton } from "office-ui-fabric-react/lib/Button";
import React, { useState } from "react";
import { IPropsAPI } from "@vienna/react-dag-editor";
import Localizer from "../../Localization/Localizer";
import { ParameterSelector } from "./ParameterSelector";

interface IParameterSelectorTriggerProps {
    parameters: any;
    graph: any;
    propsApiRef: React.RefObject<IPropsAPI>;
}

export const ParameterSelectorTrigger: React.FunctionComponent<IParameterSelectorTriggerProps> = (props) => {
    const { parameters, graph, propsApiRef } = props;
    const [isOpen, toggleSelector] = useState(false);

    const toggleParameterSelector = () => {
        if (propsApiRef.current) {
            propsApiRef.current.dismissSidePanel();
        }
        toggleSelector(!isOpen);
    };

    return (
        <>
            <ActionButton iconProps={{ iconName: "VariableGroup" }} onClick={toggleParameterSelector}>
                {Localizer.l("manageParamatersButtonText")}
            </ActionButton>
            <ParameterSelector isOpen={isOpen} parameters={parameters} graph={graph} onClose={() => toggleSelector(!isOpen)} propsApiRef={propsApiRef} />
        </>
    );
};
