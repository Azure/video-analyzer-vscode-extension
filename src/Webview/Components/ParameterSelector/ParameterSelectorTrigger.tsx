import { ActionButton } from "office-ui-fabric-react/lib/Button";
import React, { useState } from "react";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { ParameterChangeValidation } from "../../Types/GraphTypes";
import { ParameterSelector } from "./ParameterSelector";

interface IParameterSelectorTriggerProps {
    parameters: any;
    paramsThatWillChange: ParameterChangeValidation[];
    checkParameter: (parameter: MediaGraphParameterDeclaration) => void;
    deleteParametersFromNodes: (parameter: MediaGraphParameterDeclaration) => void;
}

export const ParameterSelectorTrigger: React.FunctionComponent<IParameterSelectorTriggerProps> = (props) => {
    const { parameters, paramsThatWillChange, checkParameter, deleteParametersFromNodes } = props;
    const [isOpen, toggleSelector] = useState(false);

    const toggleParameterSelector = () => {
        toggleSelector(!isOpen);
    };

    return (
        <>
            <ActionButton iconProps={{ iconName: "VariableGroup" }} onClick={toggleParameterSelector}>
                {Localizer.l("manageParamatersButtonText")}
            </ActionButton>
            <ParameterSelector
                isOpen={isOpen}
                parameters={parameters}
                onClose={() => toggleSelector(!isOpen)}
                checkParameter={checkParameter}
                paramsThatWillChange={paramsThatWillChange}
                deleteParametersFromNodes={deleteParametersFromNodes}
            />
        </>
    );
};
