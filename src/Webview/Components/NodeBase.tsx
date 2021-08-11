import * as React from "react";
import {
    getRectHeight,
    getRectWidth,
    GraphNodeState,
    hasState,
    ICanvasNode,
    ICanvasPort,
    IItemConfigArgs,
    IRectConfig,
    NodeModel
} from "@vienna/react-dag-editor";
import Definitions from "../Definitions/Definitions";
import Localizer from "../Localization/Localizer";
import { NodeContainer } from "./NodeContainer";

export class NodeBase implements IRectConfig<ICanvasNode> {
    private readonly readOnly: boolean;
    private nodeRef?: React.RefObject<HTMLDivElement>;
    private height = 56;

    constructor(readOnly: boolean) {
        this.readOnly = readOnly;
        this.nodeRef = React.createRef();
    }

    public getMinHeight = (curNode: ICanvasNode): number => {
        if (this.nodeRef?.current?.clientHeight) {
            this.height = this.nodeRef?.current?.clientHeight;
        }
        return this.height;
    };

    public getMinWidth = (): number => {
        return 280;
    };

    public render = (args: IItemConfigArgs<ICanvasNode>): React.ReactNode => {
        const node = args.model as NodeModel<any>;

        const rectHeight = getRectHeight<ICanvasNode>(this, node);
        const rectWidth = getRectWidth<ICanvasNode>(this, node);

        return (
            <foreignObject transform={`translate(${node.x}, ${node.y})`} width={rectWidth} height={rectHeight} overflow="visible">
                <NodeContainer nodeId={node.id} isDraggable={!this.readOnly} nodeRef={this.nodeRef} />
            </foreignObject>
        );
    };
}
