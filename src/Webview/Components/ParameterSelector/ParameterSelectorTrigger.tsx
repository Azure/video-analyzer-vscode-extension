import React, { useState } from "react";
import { ActionButton, CommandBarButton } from "@fluentui/react";
import { IPropsAPI } from "@vienna/react-dag-editor";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { ParameterSelector } from "./ParameterSelector";

interface IParameterSelectorTriggerProps {
    parameters: MediaGraphParameterDeclaration[];
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
            <CommandBarButton iconProps={{ iconName: "VariableGroup" }} onClick={toggleParameterSelector}>
                {Localizer.l("manageParametersButtonText")}
            </CommandBarButton>
            <ParameterSelector isOpen={isOpen} parameters={parameters} graph={graph} onClose={() => toggleSelector(!isOpen)} propsApiRef={propsApiRef} />
        </>
    );
};
