import { Icon, IStackStyles, Stack } from "office-ui-fabric-react";
import * as React from "react";
import {
  getRectHeight,
  getRectWidth,
  GraphNodeState,
  hasState,
  ICanvasNode,
  IItemConfigArgs,
  IRectConfig,
  isNodeEditing,
  ITheme
} from "@vienna/react-dag-editor";

export class NodeBase implements IRectConfig<ICanvasNode> {
  public getMinHeight = (curNode: ICanvasNode): number => {
    return (curNode.data && curNode.data.comment) || isNodeEditing(curNode)
      ? 86
      : 56;
  };

  public getMinWidth = (): number => {
    return 280;
  };

  public render = (args: IItemConfigArgs<ICanvasNode>): React.ReactNode => {
    const node = args.model;

    const containerStyles = this.getNodeStyle(node, args.theme);

    const mainContainerStyles = {
      root: {
        marginTop: 6,
        userSelect: "none" as const,
      },
    };

    const iconName = node.data && node.data.iconName;
    const iconStyles = {
      root: {
        marginLeft: 8,
        marginRight: 12,
        color: node.data ? node.data.color : args.theme.primaryColor,
      },
    };

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
      >
        <Stack styles={containerStyles} draggable={true}>
          <Stack
            horizontal={true}
            verticalAlign="center"
            styles={mainContainerStyles}
          >
            <Stack.Item>
              <Icon iconName={iconName} styles={iconStyles} />
            </Stack.Item>
            <Stack.Item
              grow={true}
              disableShrink={true}
              styles={{ root: { width: 200, marginBottom: 5 } }}
            >
              {node.name}
            </Stack.Item>
          </Stack>
        </Stack>
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
