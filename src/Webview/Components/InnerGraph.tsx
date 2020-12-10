import * as React from "react";
import {
    CanvasMouseMode,
    defaultFeatures,
    Graph,
    GraphCanvasEvent,
    GraphEdgeEvent,
    GraphFeatures,
    GraphNodeEvent,
    GraphNodeState,
    GraphScrollBarEvent,
    ICanvasNode,
    IEvent,
    IPoint,
    IPropsAPI,
    RegisterEdge,
    RegisterPanel,
    useGraphData,
    useGraphState,
    usePropsAPI
} from "@vienna/react-dag-editor";
import { MediaGraphParameterDeclaration } from "../../Common/Types/LVASDKTypes";
import GraphClass from "../Models/GraphData";
import { GraphInfo, ValidationError } from "../Types/GraphTypes";
import { VSCodeSetState } from "../Types/VSCodeDelegationTypes";
import * as Constants from "../Utils/Constants";
import { useTraceUpdate } from "../Utils/Helpers";
import LocalizerHelpers from "../Utils/LocalizerHelpers";
import { CustomEdgeConfig } from "./CustomEdgeConfig";
import { EdgePropertiesPanel } from "./EdgePropertiesPanel";
import { NodePropertiesPanel } from "./NodePropertiesPanel";
import { ValidationErrorPanel } from "./ValidationErrorPanel";

export interface IInnerGraphProps {
    graph: GraphClass;
    graphTopologyName: string;
    graphDescription: string;
    canvasMouseMode: CanvasMouseMode;
    triggerValidation?: () => void;
    readOnly?: boolean;
    parameters?: MediaGraphParameterDeclaration[];
    propsApiRef: React.RefObject<IPropsAPI>;
    validationErrors?: ValidationError[];
    showValidationErrors?: boolean;
    toggleValidationErrorPanel?: () => void;
    updateNodeName: (oldName: string, newName: string) => void | undefined;
    vsCodeSetState: VSCodeSetState;
}

export const InnerGraph: React.FunctionComponent<IInnerGraphProps> = (props) => {
    useTraceUpdate(props);
    const { readOnly = false, parameters = [], propsApiRef, triggerValidation, updateNodeName, graph, graphTopologyName, graphDescription, vsCodeSetState } = props;

    const svgRef = React.useRef<SVGSVGElement>(null);
    const propsAPI = usePropsAPI();

    // open node inspector panel when recovering state, a node is clicked, or a node is added
    const inspectNode = (node?: ICanvasNode) => {
        if (node && propsApiRef.current) {
            propsApiRef.current.openSidePanel("node", node);
        }
    };

    const { state } = useGraphState();
    const { zoomPanSettings } = state;
    const data = useGraphData();

    data.nodes.forEach((node) => {
        if (node.state === GraphNodeState.selected) {
            inspectNode(node);
        }
    });
    const clamp = (min: number, max: number, value: number): number => {
        if (min > value) {
            return min;
        }
        if (max < value) {
            return max;
        }
        return value;
    };
    const getPositionFromEvent = (e: MouseEvent): IPoint => {
        const rect = propsApiRef.current?.getContainerRectRef().current;
        if (!rect) {
            return {
                x: e.clientX,
                y: e.clientY
            };
        }
        return {
            x: clamp(rect.left + 100, rect.right - 100, e.clientX),
            y: clamp(rect.top + 30, rect.bottom - 30, e.clientY)
        };
    };
    const onNodeClick = (node: ICanvasNode) => {
        if (propsApiRef?.current?.getVisiblePanelName()) {
            if (triggerValidation) {
                triggerValidation();
            }
        }
        inspectNode(node);
    };

    const handleEvent = (event: IEvent) => {
        switch (event.type) {
            case GraphCanvasEvent.Click:
                // This event will be triggered when clicking empty space on canvas
                if (triggerValidation) {
                    triggerValidation();
                }
                break;
            case GraphNodeEvent.Click:
                onNodeClick(event.node);
                break;
            // case GraphEdgeEvent.Click:
            //     propsApiRef.current?.openSidePanel("edgePanel", {
            //         edge: event.edge
            //     });
            //     break;
            default:
        }
    };

    const itemStyles: React.CSSProperties = {
        maxHeight: "200px"
    };
    const graphStyles = {
        svg: { height: "100vh !important" }
    };

    const readOnlyFeatures = new Set(["a11yFeatures", "canvasScrollable", "panCanvas", "clickNodeToSelect", "sidePanel", "editNode"]) as Set<GraphFeatures>;

    const features = defaultFeatures;
    features.delete(GraphFeatures.nodeResizable);

    // save state in VS Code when data or zoomPanSettings change
    React.useEffect(() => {
        graph.setName(graphTopologyName);
        graph.setDescription(graphDescription);
        vsCodeSetState({
            graphData: { ...data.toJSON(), meta: graph.getTopology() } as GraphInfo,
            zoomPanSettings
        } as any);
    }, [data, zoomPanSettings, graphTopologyName, graphDescription, graph, vsCodeSetState]);

    return (
        <>
            {props.showValidationErrors && props.validationErrors && props.validationErrors.length > 0 ? (
                <div style={itemStyles}>
                    <ValidationErrorPanel validationErrors={props.validationErrors} toggleValidationErrorPanel={props.toggleValidationErrorPanel} />
                </div>
            ) : (
                ""
            )}
            {/* <RegisterPanel name={"edgePanel"} config={new EdgePropertiesPanel(readOnly)} /> */}
            <RegisterPanel name={"node"} config={new NodePropertiesPanel(readOnly, parameters, updateNodeName)} />
            <RegisterEdge name={"customEdge"} config={new CustomEdgeConfig(propsAPI)} />
            <Graph
                svgRef={svgRef}
                propsAPIRef={propsApiRef}
                onEvent={handleEvent}
                defaultNodeShape="module"
                defaultPortShape="modulePort"
                defaultEdgeShape="customEdge"
                canvasMouseMode={props.canvasMouseMode}
                getPositionFromEvent={getPositionFromEvent}
                getNodeAriaLabel={LocalizerHelpers.getNodeAriaLabel}
                getPortAriaLabel={LocalizerHelpers.getPortAriaLabel}
                styles={graphStyles}
                canvasBoundaryPadding={200}
                features={features}
            />
        </>
    );
};
