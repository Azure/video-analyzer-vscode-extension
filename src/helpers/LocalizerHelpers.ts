import {
    ICanvasData,
    ICanvasNode,
    ICanvasPort
} from "@vienna/react-dag-editor";
import Localizer from "../localization/Localizer";

export default class LocalizerHelpers {
    static getPortName(node: ICanvasNode, port: ICanvasPort) {
        const isOutputPort = port.isInputDisabled;
        const localizationKey = isOutputPort ? "ariaOutputPortDescription" : "ariaInputPortDescription";
        return `${Localizer.l(localizationKey).format(node.name)}`;
    }

    static getPortAriaLabel(data: ICanvasData, node: ICanvasNode, port: ICanvasPort): string {
        const connectedNodeNames: string[] = [];
        const isOutputPort = port.isInputDisabled;
        if (isOutputPort) {
            // for output ports we need to find all edges starting here and
            // then get all nodes that are pointed to by the edge
            data.edges
                .filter((edge) => node.id === edge.source)
                .map((edge) => data.nodes.filter((otherNode) => otherNode.id === edge.target))
                .forEach((connectedNodes) => {
                    // we now have a list of nodes connected to this port, add their names
                    connectedNodeNames.push(...connectedNodes.map((node) => node.name || ""));
                });
        } else {
            // for input ports use the same approach, but vice versa
            data.edges
                .filter((edge) => node.id === edge.target)
                .map((edge) => data.nodes.filter((otherNode) => otherNode.id === edge.source))
                .forEach((connectedNodes) => {
                    connectedNodeNames.push(...connectedNodes.map((node) => node.name || ""));
                });
        }
        if (connectedNodeNames.length > 0) {
            return `${LocalizerHelpers.getPortName(node, port)}. ${Localizer.l("ariaPortLabelConnectedToNodes").format(connectedNodeNames.join(", "))}`;
        } else {
            return LocalizerHelpers.getPortName(node, port);
        }
    }

    static getNodeAriaLabel(node: ICanvasNode): string {
        let portDescription = "";
        if (node.ports && node.ports?.length > 0) {
            let hasInput = false;
            let hasOutput = false;
            node.ports?.forEach((port) => {
                if (!port.isInputDisabled) {
                    hasInput = true;
                } else if (!port.isOutputDisabled) {
                    hasOutput = true;
                }
            });

            if (hasInput && hasOutput) {
                portDescription = Localizer.l("ariaHasBothPortsLabel");
            } else if (hasInput) {
                portDescription = Localizer.l("ariaHasInputPortLabel");
            } else if (hasOutput) {
                portDescription = Localizer.l("ariaHasOutputPortLabel");
            }
        }
        return Localizer.l("ariaNodeLabelNodeNameWithPorts").format(node.name, portDescription);
    }
}
