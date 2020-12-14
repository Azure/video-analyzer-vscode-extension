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

        const iconName = node.data!.iconName;
        const accentColor = node.data!.color;
        const nodeType = node.data!.nodeProperties["@type"];
        const definition = Definitions.getNodeDefinition(node.data?.nodeProperties?.["@type"]);
        const nodeNameType = Localizer.l("nodeContainerNodeType").format(Localizer.getLocalizedStrings(definition.localizationKey).title);
        const dragging = node.data!.nodeProperties.dragging;
        const description = Localizer.l(nodeType.split(".").pop());
        const hasErrors = node.data!.hasErrors;

        const rectHeight = getRectHeight<ICanvasNode>(this, node);
        const rectWidth = getRectWidth<ICanvasNode>(this, node);

        return (
            <foreignObject transform={`translate(${node.x}, ${node.y})`} width={rectWidth} overflow="visible">
                <NodeContainer
                    nodeName={node.name as string}
                    nodeType={nodeNameType as string}
                    iconName={iconName}
                    accentColor={accentColor}
                    title={description}
                    selected={hasState(GraphNodeState.selected)(node.state)}
                    hovered={hasState(GraphNodeState.activated)(node.state)}
                    dragging={dragging}
                    hasErrors={hasErrors}
                    isDraggable={!this.readOnly}
                    nodeRef={this.nodeRef}
                />
            </foreignObject>
        );
    };
}
