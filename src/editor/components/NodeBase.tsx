import { IStackStyles } from "office-ui-fabric-react";
import * as React from "react";
import { Color } from "vscode";
import {
    getRectHeight,
    getRectWidth,
    GraphNodeState,
    hasState,
    ICanvasNode,
    IItemConfigArgs,
    IRectConfig,
    ITheme
} from "@vienna/react-dag-editor";
import Localizer from "../../localization/Localizer";
import { NodeContainer } from "./NodeContainer";

export class NodeBase implements IRectConfig<ICanvasNode> {
    private readonly readOnly: boolean;

    constructor(readOnly: boolean) {
        this.readOnly = readOnly;
    }

    public getMinHeight = (curNode: ICanvasNode): number => {
        return 50;
    };

    public getMinWidth = (): number => {
        return 280;
    };

    public render = (args: IItemConfigArgs<ICanvasNode>): React.ReactNode => {
        const node = args.model;

        const iconName = node.data!.iconName;
        const accentColor = node.data!.color;
        const nodeType = node.data!.nodeProperties["@type"];
        const dragging = node.data!.nodeProperties.dragging;
        const description = Localizer.l(nodeType.split(".").pop());

        const rectHeight = getRectHeight<ICanvasNode>(this, node);
        const rectWidth = getRectWidth<ICanvasNode>(this, node);

        return (
            <foreignObject transform={`translate(${node.x}, ${node.y})`} height={rectHeight} width={rectWidth} overflow="visible">
                <NodeContainer
                    heading={node.name as string}
                    iconName={iconName}
                    accentColor={accentColor}
                    title={description}
                    selected={hasState(GraphNodeState.selected)(node.state)}
                    hovered={hasState(GraphNodeState.activated)(node.state)}
                    dragging={dragging}
                    isDraggable={!this.readOnly}
                />
            </foreignObject>
        );
    };
}
