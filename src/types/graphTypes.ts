import { ICanvasEdge, ICanvasNode } from "@vienna/react-dag-editor";
import {
  MediaGraphTopology,
  MediaGraphNodeInput,
} from "../lva-sdk/lvaSDKtypes";

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
