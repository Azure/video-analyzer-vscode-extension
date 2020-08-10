import { TextField } from "office-ui-fabric-react";
import * as React from "react";
import Localizer from "../../localization/Localizer";
import { GraphInstanceParameter } from "../../types/graphTypes";

export interface IGraphPanelProps {
    parameters: GraphInstanceParameter[];
    setParameters: (parameters: GraphInstanceParameter[]) => void;
}

export const ParameterPanel: React.FunctionComponent<IGraphPanelProps> = (props) => {
    const { parameters, setParameters } = props;

    const customEntryEditFunction = (index: number) => {
        return (newValue: string) => {
            parameters[index].value = newValue;
            setParameters(parameters);
        };
    };

    return (
        <>
            <h2
                style={{
                    margin: 0,
                    marginBottom: 10
                }}
            >
                {Localizer.l("sidebarHeadingParameters")}
            </h2>
            {parameters &&
                parameters.map((parameter, i) => {
                    return <GraphPanelEditField key={parameter.name} parameter={parameter} updateParameter={customEntryEditFunction(i)} />;
                })}
        </>
    );
};

interface IGraphPanelEditFieldProps {
    parameter: GraphInstanceParameter;
    updateParameter: (newValue: string) => void;
}

const GraphPanelEditField: React.FunctionComponent<IGraphPanelEditFieldProps> = (props) => {
    const { parameter, updateParameter } = props;
    const [value, setValue] = React.useState<string>(parameter.value);

    const onChange = (event: React.FormEvent, newValue?: string) => {
        if (newValue !== undefined) {
            setValue(newValue);
            updateParameter(newValue);
        }
    };

    const validateInput = (value: string) => {
        if (!value) {
            return Localizer.l("propertyEditorValidationEmpty");
        }

        // TODO: Perform additional validation

        return "";
    };

    return (
        <TextField
            label={parameter.name}
            value={value}
            placeholder={Localizer.l("sidebarGraphInstanceParameterPlaceholder").format(parameter.type)}
            onChange={onChange}
            onGetErrorMessage={validateInput}
            required
        />
    );
};
