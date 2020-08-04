import { v4 as uuid } from "uuid";
import { ICanvasNode, ICanvasPort } from "@vienna/react-dag-editor";
import { MediaGraphNodeType, NodeDefinition } from "../types/graphTypes";

export default class NodeHelpers {
  // maps a MediaGraphNodeType to a string to index into the topology JSON
  static getNodeTypeKey(type: MediaGraphNodeType): string {
    switch (type) {
      case MediaGraphNodeType.Source:
        return "sources";
      case MediaGraphNodeType.Processor:
        return "processors";
      case MediaGraphNodeType.Sink:
        return "sinks";
      default:
        return "";
    }
  }

  // maps a string representation of a node's type to a MediaGraphNodeType
  static getNodeTypeFromString(type: string): MediaGraphNodeType {
    switch (type) {
      case "sources":
        return MediaGraphNodeType.Source;
      case "processors":
        return MediaGraphNodeType.Processor;
      case "sinks":
        return MediaGraphNodeType.Sink;
      default:
        return MediaGraphNodeType.Other;
    }
  }

  // returns the appropriate ports for a node (proper input and input according to type)
  static getPorts(
    node: NodeDefinition,
    type?: MediaGraphNodeType
  ): ICanvasPort[] {
    const ports = [];
    // type might be a value of MediaGraphNodeType that maps to 0, which is falsy
    const nodeType = typeof type === "undefined" ? node.nodeType : type;

    if (
      nodeType === MediaGraphNodeType.Source ||
      nodeType === MediaGraphNodeType.Processor
    ) {
      ports.push({
        id: uuid(),
        shape: "modulePort",
        isInputDisabled: true,
        isOutputDisabled: false,
        name: "", // will be localized later
      });
    }

    if (
      nodeType === MediaGraphNodeType.Sink ||
      nodeType === MediaGraphNodeType.Processor
    ) {
      ports.push({
        id: uuid(),
        shape: "modulePort",
        isInputDisabled: false,
        isOutputDisabled: true,
        name: "", // will be localized later
      });
    }

    return ports;
  }

  // determines appearance properties for a node
  static getNodeAppearance(type: MediaGraphNodeType) {
    switch (type) {
      case MediaGraphNodeType.Source:
        return {
          iconName: "SecurityCamera",
          color: "var(--vscode-terminal-ansiBrightBlue)",
          colorAlt: "var(--vscode-terminal-ansiBlue)",
        };
      case MediaGraphNodeType.Processor:
        return {
          iconName: "Processing",
          color: "var(--vscode-terminal-ansiBrightGreen)",
          colorAlt: "var(--vscode-terminal-ansiGreen)",
        };
      case MediaGraphNodeType.Sink:
        return {
          iconName: "CloudImportExport",
          color: "var(--vscode-terminal-ansiBrightYellow)",
          colorAlt: "var(--vscode-terminal-ansiYellow)",
        };
      default:
        return {};
    }
  }

  // evaluates if a node can be connected to another node (has to be downstream)
  static nodeCanConnectToNode(source: ICanvasNode, target: ICanvasNode) {
    if (source.data && target.data) {
      const sourceNodeType = source.data.nodeType;
      const targetNodeType = target.data.nodeType;

      switch (sourceNodeType) {
        case MediaGraphNodeType.Source:
        case MediaGraphNodeType.Processor:
          return (
            MediaGraphNodeType.Processor === targetNodeType ||
            MediaGraphNodeType.Sink === targetNodeType
          );
        case MediaGraphNodeType.Sink:
          return false;
        default:
          break;
      }
    }
    return true;
  }
}
