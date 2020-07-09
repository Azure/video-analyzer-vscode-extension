import { MediaGraphNodeType } from "../data/graphTypes";
import { availableNodes } from "../definitions";
import { ICanvasPort, ICanvasNode } from "@vienna/react-dag-editor";
import { v4 as uuid } from "uuid";

export function getCompatibleNodes(fullParentTypeRef: string) {
  const compatibleNodes = [];
  const parentType = fullParentTypeRef.replace("#/definitions/", "");

  for (const candidateNode of availableNodes) {
    const nodeInheritsFrom =
      candidateNode.parsedAllOf &&
      candidateNode.parsedAllOf.includes(fullParentTypeRef);
    if (nodeInheritsFrom || candidateNode.name === parentType) {
      compatibleNodes.push(candidateNode);
    }
  }

  return compatibleNodes;
}

export function getNodeTypeTitle(type: MediaGraphNodeType): string {
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

export function getPorts(node: any, type?: MediaGraphNodeType): ICanvasPort[] {
  const ports = [];
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
      name: `${node.name} input port`,
      ariaLabel: `input port for ${node.name}`,
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
      name: `${node.name} output port`,
      ariaLabel: `output port for ${node.name}`,
    });
  }

  return ports;
}

export function getNodeProperties(type: MediaGraphNodeType) {
  switch (type) {
    case MediaGraphNodeType.Source:
      return {
        iconName: "Upload",
        color: "var(--vscode-terminal-ansiBrightBlue)",
        colorAlt: "var(--vscode-terminal-ansiBlue)",
      };
    case MediaGraphNodeType.Processor:
      return {
        iconName: "ProgressRingDots",
        color: "var(--vscode-terminal-ansiBrightGreen)",
        colorAlt: "var(--vscode-terminal-ansiGreen)",
      };
    case MediaGraphNodeType.Sink:
      return {
        iconName: "Download",
        color: "var(--vscode-terminal-ansiBrightYellow)",
        colorAlt: "var(--vscode-terminal-ansiYellow)",
      };
    default:
      return {};
  }
}

export function nodeCanConnectToNode(source: ICanvasNode, target: ICanvasNode) {
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
