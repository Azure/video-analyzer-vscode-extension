import * as React from "react";
import {
  getRectHeight,
  getRectWidth,
  GraphNodeState,
  hasState,
  ICanvasNode,
  IItemConfigArgs,
  IRectConfig,
  ITheme,
} from "@vienna/react-dag-editor";
import { IStackStyles } from "office-ui-fabric-react";
import { NodeContainer } from "./NodeContainer";
import Localizer from "../../localization/Localizer";

export class NodeBase implements IRectConfig<ICanvasNode> {
  public getMinHeight = (curNode: ICanvasNode): number => {
    return 50;
  };

  public getMinWidth = (): number => {
    return 280;
  };

  public render = (args: IItemConfigArgs<ICanvasNode>): React.ReactNode => {
    const node = args.model;

    const iconName = node.data && node.data.iconName;
    const nodeType = node.data && node.data.nodeProperties["@type"];
    const description = Localizer.l(nodeType.split(".").pop());

    const rectHeight = getRectHeight<ICanvasNode>(this, node);
    const rectWidth = getRectWidth<ICanvasNode>(this, node);
    const opacity = hasState(GraphNodeState.unconnectedToSelected)(node.state)
      ? "60%"
      : "100%";

    return (
      <foreignObject
        transform={`translate(${node.x}, ${node.y})`}
        height={rectHeight}
        width={rectWidth}
        opacity={opacity}
        overflow="visible"
      >
        <NodeContainer
          heading={node.name as string}
          iconName={iconName}
          title={description}
          selected={hasState(GraphNodeState.selected)(node.state)}
          hovered={hasState(GraphNodeState.activated)(node.state)}
        ></NodeContainer>
      </foreignObject>
    );
  };

  protected readonly getNodeStyle = (
    node: ICanvasNode,
    theme: ITheme
  ): IStackStyles => {
    let borderColor = node.data ? node.data.color : theme.defaultBorderColor;

    if (
      hasState(GraphNodeState.activated | GraphNodeState.selected)(node.state)
    ) {
      borderColor = node.data ? node.data.colorAlt : theme.nodeActivateStroke;
    }

    return {
      root: {
        height: getRectHeight<ICanvasNode>(this, node),
        padding: 8,
        backgroundColor: theme.nodeFill,
        borderRadius: 4,
        cursor: "move",
        border: `2px solid ${borderColor}`,
      },
    };
  };
}
