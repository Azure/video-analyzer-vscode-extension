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

    const customParameterSetter = (index: number) => {
        return (newValue: GraphInstanceParameter) => {
            parameters[index] = newValue;
            setParameters([...parameters]);
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
                    return <GraphPanelEditField key={parameter.name} parameter={parameter} setParameter={customParameterSetter(i)} />;
                })}
        </>
    );
};

interface IGraphPanelEditFieldProps {
    parameter: GraphInstanceParameter;
    setParameter: (newValue: GraphInstanceParameter) => void;
}

const GraphPanelEditField: React.FunctionComponent<IGraphPanelEditFieldProps> = (props) => {
    const { parameter, setParameter } = props;
    const { name, type, error } = parameter;
    const [value, setValue] = React.useState<string>(parameter.value);

    const onChange = (event: React.FormEvent, newValue?: string) => {
        if (newValue !== undefined) {
            let error = "";
            if (!newValue) {
                error = Localizer.l("sidebarGraphInstanceParameterMissing");
            }

            // TODO: Perform additional validation

            setParameter({ ...parameter, error, value: newValue });
            setValue(newValue);
        }
    };

    return (
        <TextField
            label={name}
            value={value}
            placeholder={Localizer.l("sidebarGraphInstanceParameterPlaceholder").format(type)}
            onChange={onChange}
            errorMessage={error}
            required
        />
    );
};
