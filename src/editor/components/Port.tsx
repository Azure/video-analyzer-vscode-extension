import * as React from "react";
import {
  GraphPortState,
  hasState,
  ICanvasData,
  ICanvasNode,
  ICanvasPort,
  IPortConfig,
} from "@vienna/react-dag-editor";
import NodeHelpers from "../../helpers/nodeHelpers";
import { PortInner } from "./PortInner";

export interface ICanvasPortCustomized extends ICanvasPort {
  label: string;
}

export const modulePort: IPortConfig = {
  getStyle(portOriginal, parentNode, data): Partial<React.CSSProperties> {
    const port: ICanvasPortCustomized = portOriginal as ICanvasPortCustomized;

    const strokeWidth = 1;
    const stroke = "var(--vscode-editorWidget-border)";
    let fill = "var(--vscode-editorWidget-background)";

    if (
      hasState(
        GraphPortState.activated |
          GraphPortState.selected |
          GraphPortState.connecting
      )(port.state)
    ) {
      fill = "var(--vscode-editor-selectionBackground)";
    }

    return {
      stroke,
      strokeWidth,
      fill,
    };
  },
  getIsConnectable(
    port: ICanvasPortCustomized,
    parentNode: ICanvasNode,
    data: ICanvasData
  ): boolean | undefined {
    const { nodes = [] } = data;

    // edge cannot be made from input port (violates edge direction)
    if (port.isInputDisabled) {
      return false;
    }

    // has to connect input <-> output
    let isOutputPort;
    nodes.forEach((node) => {
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

    return (
      <PortInner
        data={data}
        port={port}
        parentNode={parentNode}
        modulePort={modulePort}
        x={x}
        y={y}
      />
    );
  },
};
