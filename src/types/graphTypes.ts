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
  // if a property is missing
  property?: string[];
  // node count limits and required relations
  nodeType?: string;
  // the type that was expected as parent
  parentType?: string[];
}

export enum ValidationErrorType {
  NotConnected,
  MissingProperty,
  NodeCountLimit,
  RequiredDirectlyDownstream,
  ProhibitedDirectlyDownstream,
  ProhibitedAnyDownstream,
}
