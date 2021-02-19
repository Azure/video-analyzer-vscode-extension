import * as React from "react";
import { getTheme, mergeStyleSets, Text, TextField } from "@fluentui/react";
import customPropertyTypes from "../Definitions/v2.0.0/customPropertyTypes.json";
import Localizer from "../Localization/Localizer";
import Graph from "../Models/GraphData";
import GraphValidator from "../Models/MediaGraphValidator";
import { GraphInstanceParameter } from "../Types/GraphTypes";
import Helpers from "../Utils/Helpers";

export interface IGraphPanelProps {
    parameters: GraphInstanceParameter[];
    graph: Graph;
    setParameters: (parameters: GraphInstanceParameter[]) => void;
}

enum PropertyFormatType {
    number = "number",
    string = "string",
    isoDuration = "isoDuration",
    boolean = "boolean",
    object = "object",
    array = "array"
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
        const paramsInNode = graph.checkForParamsInGraphNode(parameter.name);
        const localizationKey = paramsInNode[0]?.localizationKey;
        return localizationKey ?? "";
    };
    const { parameter, graph, setParameter } = props;
    const { name, defaultValue, type, error } = parameter;
    const [localizationKey] = React.useState<string>(getLocalizationKey());
    const [value, setValue] = React.useState<string>(getInitialValue());

    function getInitialValue() {
        let initValue = parameter.value;
        if (initValue && (customPropertyTypes as any)[localizationKey] === PropertyFormatType.isoDuration) {
            initValue = Helpers.isoToSeconds(initValue) as any;
        }

        return initValue;
    }

    const onChange = (event: React.FormEvent, newValue?: string) => {
        if (newValue !== undefined) {
            const error = "";
            const format = (customPropertyTypes as any)[localizationKey] ?? null;
            if (format === PropertyFormatType.isoDuration) {
                const isoValue = Helpers.secondsToIso(newValue);
                setParameter({ ...parameter, error, value: isoValue });
            } else {
                setParameter({ ...parameter, error, value: newValue });
            }
            setValue(newValue);
        }
    };

    const checkIsIsoDuration = (value: string) => {
        const format = (customPropertyTypes as any)[localizationKey] ?? null;
        if (value && format === PropertyFormatType.isoDuration) {
            return Helpers.isoToSeconds(value);
        }
        return value;
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
                    {Localizer.l("sidebarGraphInstanceParameterDefaultText").format(checkIsIsoDuration(defaultValue))}
                </Text>
            )}
        </>
    );
};
