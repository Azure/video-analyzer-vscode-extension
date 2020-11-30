import { v4 as uuid } from "uuid";
import { MediaGraphNodeType, NodeDefinition } from "../Types/GraphTypes";

export default class SharedNodeHelpers {
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
    static getPortsWithOutLayout(node: NodeDefinition, type?: MediaGraphNodeType) {
        const ports = [];
        // type might be a value of MediaGraphNodeType that maps to 0, which is falsy
        const nodeType = typeof type === "undefined" ? node.nodeType : type;

        if (nodeType === MediaGraphNodeType.Source || nodeType === MediaGraphNodeType.Processor) {
            ports.push({
                id: uuid(),
                shape: "modulePort",
                isInputDisabled: true,
                isOutputDisabled: false,
                name: "" // will be localized later
            });
        }

        if (nodeType === MediaGraphNodeType.Sink || nodeType === MediaGraphNodeType.Processor) {
            ports.push({
                id: uuid(),
                shape: "modulePort",
                isInputDisabled: false,
                isOutputDisabled: true,
                name: "" // will be localized later
            });
        }

        return ports;
    }
}
