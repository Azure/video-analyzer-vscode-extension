import * as React from "react";
import {
    getRectHeight,
    getRectWidth,
    GraphNodeState,
    hasState,
    ICanvasNode,
    ICanvasPort,
    IItemConfigArgs,
    IRectConfig
} from "@vienna/react-dag-editor";
import Localizer from "../Localization/Localizer";
import { NodeContainer } from "./NodeContainer";

export class NodeBase implements IRectConfig<ICanvasNode> {
    private readonly readOnly: boolean;
    private ref?: React.RefObject<HTMLDivElement>;
    private height = 50;

    private newRef = React.useRef<HTMLDivElement>(null);
    constructor(readOnly: boolean) {
        this.readOnly = readOnly;
    }

    public getMinHeight = (curNode: ICanvasNode): number => {
        if (this.ref?.current?.clientHeight) {
            this.height = this.ref?.current?.clientHeight;
        }
        return this.height;
    };

    public getMinWidth = (): number => {
        return 280;
    };

    public getPorts = (args: { model: ICanvasNode }): ICanvasPort[] => {
        const ports = args.model.ports;

        return (
            ports?.map((port) => {
                return {
                    ...port,
                    position: [0.5, 0]
                };
            }) ?? []
        );
    };

    private setRef(ref: React.RefObject<HTMLDivElement>) {
        this.ref = ref;
    }

    public render = (args: IItemConfigArgs<ICanvasNode>): React.ReactNode => {
        const node = args.model;

        const iconName = node.data!.iconName;
        const accentColor = node.data!.color;
        const nodeType = node.data!.nodeProperties["@type"];
        const dragging = node.data!.nodeProperties.dragging;
        const description = Localizer.l(nodeType.split(".").pop());

        const rectHeight = getRectHeight<ICanvasNode>(this, node);
        console.log("NodeBase -> rectHeight", rectHeight);
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
                    children={<div style={{ height: 70 }}></div>}
                    setNodeRef={this.setRef.bind(this)}
                />
            </foreignObject>
        );
    };
}
