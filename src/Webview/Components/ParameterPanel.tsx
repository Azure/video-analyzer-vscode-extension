import * as React from "react";
import { getTheme, mergeStyleSets, Text, TextField } from "@fluentui/react";
import Definitions from "../Definitions/Definitions";
import Localizer from "../Localization/Localizer";
import { GraphData } from "../Models/GraphData";
import GraphValidator from "../Models/MediaGraphValidator";
import { GraphInstanceParameter } from "../Types/GraphTypes";
import Helpers from "../Utils/Helpers";
import GraphContext from "./GraphContext";
import { PropertyFormatType } from "./GraphInstance";

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

    const graphContext = React.useContext(GraphContext);
    const graph = graphContext.graph;

    return (
        <>
            <h2>{Localizer.l("sidebarHeadingParameters")}</h2>
            <p>{Localizer.l("sidebarGraphInstanceParameterText")}</p>
            {parameters &&
                parameters.map((parameter, i) => {
                    return <GraphPanelEditField key={parameter.name} graph={graph} parameter={parameter} setParameter={customParameterSetter(i)} />;
                })}
        </>
    );
};

interface IGraphPanelEditFieldProps {
    parameter: GraphInstanceParameter;
    graph: GraphData;
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
    const [value, setValue] = React.useState<string>();
    const [defaultString, setDefaultString] = React.useState<string>();
    const moduleVersion = Definitions.ModuleVersion;

    React.useEffect(() => {
        getInitialValue().then((initValue) => {
            if (value !== initValue) {
                setValue(initValue);
            }
        });
    }, []);

    async function getInitialValue() {
        const customPropertyTypes = await import(`../Definitions/v${moduleVersion}/customPropertyTypes.json`);
        let initValue = parameter.value;
        if (initValue && (customPropertyTypes as any)[localizationKey] === PropertyFormatType.isoDuration) {
            initValue = Helpers.isoToSeconds(initValue) as any;
        }

        return initValue;
    }

    const onChange = async (event: React.FormEvent, newValue?: string) => {
        const customPropertyTypes = await import(`../Definitions/v${moduleVersion}/customPropertyTypes.json`);
        if (newValue !== undefined) {
            const error = "";
            const format = (customPropertyTypes as any)[localizationKey] ?? null;
            if (format === PropertyFormatType.isoDuration) {
                const isoValue = Helpers.secondsToIso(newValue);
                console.log("🚀 ~ file: ParameterPanel.tsx ~ line 85 ~ onChange ~ isoValue", isoValue);
                setParameter({ ...parameter, error, value: isoValue ?? newValue });
            } else {
                setParameter({ ...parameter, error, value: newValue });
            }
            setValue(newValue);
        }
    };

    const setDefaultValueString = async (value: string) => {
        const customPropertyTypes = await import(`../Definitions/v${moduleVersion}/customPropertyTypes.json`);
        const format = (customPropertyTypes as any)[localizationKey] ?? null;
        const isoValue = value && format === PropertyFormatType.isoDuration ? Helpers.isoToSeconds(value) : value;
        setDefaultString(Localizer.l("sidebarGraphInstanceParameterDefaultText").format(isoValue));
    };

    const validateInput = async (value: string) => {
        let errorMessage = "";
        if (!defaultValue && !value) {
            errorMessage = Localizer.l("sidebarGraphInstanceParameterMissing");
        }
        if (!errorMessage && localizationKey !== undefined) {
            errorMessage = await GraphValidator.validateProperty(value, localizationKey);
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

    setDefaultValueString(defaultValue);

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
                    {defaultString}
                </Text>
            )}
        </>
    );
};
