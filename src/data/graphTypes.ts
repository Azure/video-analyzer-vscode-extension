import { MediaGraphTopology } from "./index";
import { ICanvasNode, ICanvasEdge } from "@vienna/react-dag-editor";

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

export interface VSCodeDelegate {
  setState: (state: any) => void;
}
