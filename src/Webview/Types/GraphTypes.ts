import { ICanvasEdge, ICanvasNode } from "@vienna/react-dag-editor";
import {
    MediaGraphNodeInput,
    MediaGraphParameterType,
    MediaGraphTopology
} from "../../Common/Types/LVASDKTypes";

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
    endpoint?: any;
}

export interface CanvasNodeData {
    color: string;
    iconName: string;
    nodeProperties: CanvasNodeProperties | Record<string, any>;
    nodeType: MediaGraphNodeType;
    hasErrors?: boolean;
}

export interface ValidationError {
    description: string;
    type: ValidationErrorType;
    // if a property is missing
    property?: string[];
    // for node count limits and required relations
    nodeType?: string;
    // the type that was expected as parent
    parentType?: string[];
    // node name
    nodeName?: string;
    // an explanatory link if applicable
    helpLink?: string;
}

export enum ValidationErrorType {
    NotConnected = "NotConnected",
    NameAlreadyInUse = "NameAlreadyInUse",
    RegexValidation = "RegexValidation",
    MissingField = "MissingField",
    NodeCountLimit = "NodeCountLimit",
    RequiredDirectlyDownstream = "RequiredDirectlyDownstream",
    ProhibitedDirectlyDownstream = "ProhibitedDirectlyDownstream",
    ProhibitedAnyDownstream = "ProhibitedAnyDownstream",
    ServerError = "ServerError"
}

export interface ServerError {
    value: string;
    logLevel?: string;
    nodeName?: string;
    nodeProperty?: string;
    date?: Date;
}

export interface GraphInstanceParameter {
    name: string;
    defaultValue: string;
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
