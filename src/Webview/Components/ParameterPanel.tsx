import * as React from "react";
import { getTheme, mergeStyleSets, Text, TextField } from "@fluentui/react";
import nameToLocalizationKey from "../Definitions/v2.0.0/nameToLocalizationKey.json";
import Localizer from "../Localization/Localizer";
import Graph from "../Models/GraphData";
import GraphValidator from "../Models/MediaGraphValidator";
import { GraphInstanceParameter } from "../Types/GraphTypes";

export interface IGraphPanelProps {
    parameters: GraphInstanceParameter[];
    graph: Graph;
    setParameters: (parameters: GraphInstanceParameter[]) => void;
}

export const ParameterPanel: React.FunctionComponent<IGraphPanelProps> = (props) => {
    const { parameters, graph, setParameters } = props;

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
                    return <GraphPanelEditField key={parameter.name} parameter={parameter} graph={graph} setParameter={customParameterSetter(i)} />;
                })}
        </>
    );
};

interface IGraphPanelEditFieldProps {
    parameter: GraphInstanceParameter;
    graph: Graph;
    setParameter: (newValue: GraphInstanceParameter) => void;
}

const GraphPanelEditField: React.FunctionComponent<IGraphPanelEditFieldProps> = (props) => {
    const getLocalizationKey = () => {
        const key = graph.getLocalizationKeyOfParameter(parameter.name);
        const localizationKey = (nameToLocalizationKey as any)[key];
        return localizationKey ?? "";
    };
    const { parameter, graph, setParameter } = props;
    const { name, defaultValue, type, error } = parameter;
    const [value, setValue] = React.useState<string>(parameter.value);
    const [localizationKey] = React.useState<string>(getLocalizationKey());

    const onChange = (event: React.FormEvent, newValue?: string) => {
        if (newValue !== undefined) {
            const error = "";
            setParameter({ ...parameter, error, value: newValue });
            setValue(newValue);
        }
    };

    const validateInput = (value: string) => {
        let errorMessage = "";
        if (!defaultValue && !value) {
            errorMessage = Localizer.l("sidebarGraphInstanceParameterMissing");
        }
        if (!errorMessage && localizationKey !== undefined) {
            errorMessage = GraphValidator.validateProperty(value, localizationKey);
        }

        return errorMessage;
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
                required={!defaultValue}
                className={styles.textField}
                onGetErrorMessage={validateInput}
            />
            {defaultValue && (
                <Text variant="small" className={styles.defaultText} block>
                    {Localizer.l("sidebarGraphInstanceParameterDefaultText").format(defaultValue)}
                </Text>
            )}
        </>
    );
};
