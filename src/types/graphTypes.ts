import { ICanvasEdge, ICanvasNode } from "@vienna/react-dag-editor";
import { MediaGraphTopology } from "../lva-sdk/lvaSDKtypes";

export enum MediaGraphNodeType {
  Source,
  Processor,
  Sink,
  Other,
}

export interface GraphInfo {
  meta: MediaGraphTopology;
  nodes: ICanvasNode[];
  edges: ICanvasEdge[];
}

export interface NodeDefinition {
  description: string;
  name: string;
  nodeType: MediaGraphNodeType;
  properties: any;
  type?: string;
  required?: string[];
  parsedAllOf?: string[];
}

export interface ValidationError {
  description: string;
  type: ValidationErrorType;
  property?: string[];
  nodeType?: string;
}

export enum ValidationErrorType {
  NotConnected,
  MissingProperty,
  NodeCountLimit,
}
