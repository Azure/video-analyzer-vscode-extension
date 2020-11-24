import * as React from "react";
import { GraphPortState, hasState, ICanvasData, ICanvasNode, ICanvasPort, IGetConnectableParams, IPortConfig } from "@vienna/react-dag-editor";
import NodeHelpers from "../Utils/NodeHelpers";
import { PortInner } from "./PortInner";

export interface ICanvasPortCustomized extends ICanvasPort {
    label: string;
}

export const modulePort: IPortConfig = {
    getIsConnectable(args: IGetConnectableParams): boolean | undefined {
        const { data, model: port, parentNode } = args;
        const { nodes = [] } = data;

        // edge cannot be made from input port (violates edge direction)
        if (port.isInputDisabled) {
            return false;
        }

        // has to connect input <-> output
        let isOutputPort;
        data.mapNodes((node) => {
            if (node.ports) {
                node.ports.forEach((p) => {
                    // find the port being connected
                    if (hasState(GraphPortState.connecting)(p.state)) {
                        // check if we are connecting downstream
                        if (!NodeHelpers.nodeCanConnectToNode(node, parentNode)) {
                            return false;
                        }
                        // check if connecting to self
                        if (node.id === parentNode.id) {
                            return false;
                        }
                        // check input/output connectivity
                        if (!p.isOutputDisabled) {
                            isOutputPort = true;
                        }
                        if (!p.isInputDisabled) {
                            isOutputPort = false;
                        }
                    }
                });
            }

            return node;
        });

        if (isOutputPort === undefined) {
            return undefined;
        }
        if (isOutputPort) {
            return !port.isInputDisabled;
        } else {
            return !port.isOutputDisabled;
        }
    },
    render(args): React.ReactNode {
        const { model, data, x, y, parentNode } = args;
        const port: ICanvasPortCustomized = model as ICanvasPortCustomized;

        return <PortInner data={data} port={port} parentNode={parentNode} modulePort={modulePort} x={x} y={y} />;
    }
};
