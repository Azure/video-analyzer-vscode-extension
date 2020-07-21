import { v4 as uuid } from "uuid";
import { ICanvasNode, ICanvasPort } from "@vienna/react-dag-editor";
import { MediaGraphNodeType } from "../types/graphTypes";
import Definitions from "../definitions/definitions";
import Helpers from "./helpers";

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

  // returns the appropriate ports for a node (proper input and input according to type)
  static getPorts(node: any, type?: MediaGraphNodeType): ICanvasPort[] {
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
        name: `${node.name} input port`,
        ariaLabel: `input port for ${node.name}`, // will be localized in topology converter
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
        name: `${node.name} output port`, // will be localized in topology converter
      });
    }

    return ports;
  }

  // determines appearance properties for a node
  static getNodeProperties(type: MediaGraphNodeType) {
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

  /* To be able to switch between multiple different types of properties without
	loosing the values or properties not needed for the selected type, properties
	that might not be needed are retained. We can remove these when exporting. */
  static getTrimmedNodeProperties(nodeProperties: any): any {
    const definition = Definitions.getNodeDefinition(nodeProperties);
    const neededProperties: any = {};

    if (!definition) {
      return {};
    }

    // copy over only properties as needed (determined by definition)
    for (const name in definition.properties) {
      const property = definition.properties[name];
      const nestedProperties = nodeProperties[name];

      if (nestedProperties) {
        if (property.type === "object") {
          if (!Helpers.isEmptyObject(nestedProperties)) {
            neededProperties[name] = this.getTrimmedNodeProperties(
              nestedProperties
            );
          }
        } else {
          neededProperties[name] = nestedProperties;
        }
      }
    }

    return {
      "@type": nodeProperties["@type"],
      ...neededProperties,
    };
  }
}
