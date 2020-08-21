import { mergeStyleSets, Text, TextField } from "office-ui-fabric-react";
import * as React from "react";
import Localizer from "../Localization/Localizer";
import { GraphInstanceParameter } from "../Types/GraphTypes";

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
            <h2>{Localizer.l("sidebarHeadingParameters")}</h2>
            <p>{Localizer.l("sidebarGraphInstanceParameterText")}</p>
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
    const { name, defaultValue, type, error } = parameter;
    const [value, setValue] = React.useState<string>("");

    const onChange = (event: React.FormEvent, newValue?: string) => {
        if (newValue !== undefined) {
            let error = "";
            if (!defaultValue && !newValue) {
                error = Localizer.l("sidebarGraphInstanceParameterMissing");
            }

            // TODO: Perform additional validation

            setParameter({ ...parameter, error, value: newValue });
            setValue(newValue);
        }
    };

    const styles = mergeStyleSets({
        textField: {
            marginBottom: 5
        },
        defaultText: {
            marginBottom: 5
        }
    });

    return (
        <>
            <TextField
                label={name}
                value={value}
                placeholder={Localizer.l("sidebarGraphInstanceParameterPlaceholder").format(type)}
                onChange={onChange}
                errorMessage={error}
                required={!defaultValue}
                className={styles.textField}
            />
            {defaultValue && (
                <Text variant="small" className={styles.defaultText} block>
                    {Localizer.l("sidebarGraphInstanceParameterDefaultText").format(defaultValue)}
                </Text>
            )}
        </>
    );
};
