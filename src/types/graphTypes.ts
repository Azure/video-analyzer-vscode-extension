import { ICanvasEdge, ICanvasNode } from "@vienna/react-dag-editor";
import { MediaGraphNodeInput, MediaGraphParameterType, MediaGraphTopology } from "../lva-sdk/lvaSDKtypes";

export enum MediaGraphNodeType {
    Source = "source",
    Processor = "processor",
    Sink = "sink",
    Other = "other"
}

export interface GraphInfo {
    meta: MediaGraphTopology;
    nodes: ICanvasNode[];
    edges: ICanvasEdge[];
}

export interface NodeDefinitionProperty {
    type?: string;
    parsedRef?: string;
    format?: string;
    properties?: Record<string, NodeDefinitionProperty | undefined>;
    description?: string;
    required?: string[];
    enum?: string[];
    example?: string;
    "x-ms-discriminator-value"?: string;
}

export interface NodeDefinition extends NodeDefinitionProperty {
    name: string;
    nodeType: MediaGraphNodeType;
    parsedAllOf?: string[];
    localizationKey: string;
}

export interface CanvasNodeProperties {
    "@type": string;
    inputs?: MediaGraphNodeInput[];
    name: string;
}

export interface CanvasNodeData {
    color: string;
    colorAlt: string;
    iconName: string;
    nodeProperties: CanvasNodeProperties | Record<string, any>;
    nodeType: MediaGraphNodeType;
}

export interface GraphInstanceParameter {
    name: string;
    value: string;
    type: MediaGraphParameterType;
    error: string;
}

export interface NestedLocalizedStrings {
    title: string;
    description: string;
    placeholder?: string;
}

export type ParameterizeValueCallback = (parameterizedValue: string) => void;

export type ParameterizeValueRequestFunction = (propertyName: string, callback: ParameterizeValueCallback, previousValue?: string) => void;
