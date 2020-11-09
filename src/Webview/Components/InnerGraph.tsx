import * as React from "react";
import {
    CanvasMouseMode,
    Graph,
    GraphFeatures,
    GraphNodeState,
    ICanvasNode,
    IPropsAPI,
    RegisterEdge,
    RegisterPanel,
    useGraphData,
    useGraphState,
    usePropsAPI
} from "@vienna/react-dag-editor";
import GraphClass from "../Models/GraphData";
import { MediaGraphParameterDeclaration } from "../../Common/Types/LVASDKTypes";
import { GraphInfo, ValidationError } from "../Types/GraphTypes";
import LocalizerHelpers from "../Utils/LocalizerHelpers";
import { CustomEdgeConfig } from "./CustomEdgeConfig";
import { NodePropertiesPanel } from "./NodePropertiesPanel";
import { ValidationErrorPanel } from "./ValidationErrorPanel";
import { VSCodeSetState } from "../Types/VSCodeDelegationTypes";
import * as Constants from "../Utils/Constants";

export interface IInnerGraphProps {
    graph: GraphClass;
    graphTopologyName: string;
    graphDescription: string;
    canvasMouseMode: CanvasMouseMode;
    isHorizontal?: boolean;
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
    const onNodeClick = (_e: React.MouseEvent, node: ICanvasNode) => {
        if (propsApiRef?.current?.getVisiblePanelName()) {
            if (triggerValidation) {
                triggerValidation();
            }
        }
        inspectNode(node);
    };

    const dismissSidePanel = () => {
        if (propsApiRef.current) {
            propsApiRef.current.dismissSidePanel();
        }
        if (triggerValidation) {
            triggerValidation();
        }
    };

    // const onChange = (evt: IGraphDataChangeEvent, ref: React.RefObject<SVGSVGElement>) => {
    //     if (props.onChange) {
    //         props.onChange(evt);
    //     }
    //     switch (evt.type) {
    //         case GraphDataChangeType.deleteNode: // in case just a node is removed
    //         case GraphDataChangeType.deleteMultiple: // in case nodes + attached edges are removed
    //             dismissSidePanel();
    //             break;
    //         default:
    //     }
    // };

    const itemStyles: React.CSSProperties = {
        maxHeight: "200px"
    };

    const readOnlyFeatures = new Set(["a11yFeatures", "canvasScrollable", "panCanvas", "clickNodeToSelect", "sidePanel", "editNode"]) as Set<GraphFeatures>;

    // save state in VS Code when data or zoomPanSettings change
    React.useEffect(() => {
        graph.setName(graphTopologyName);
        graph.setDescription(graphDescription);
        vsCodeSetState({
            pageViewType: Constants.PageType.graphPage,
            graphData: { ...data.toJSON(), meta: graph.getTopology() } as GraphInfo,
            zoomPanSettings
        });
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
            <RegisterPanel name={"node"} config={new NodePropertiesPanel(readOnly, parameters, updateNodeName)} />
            <RegisterEdge name={"customEdge"} config={new CustomEdgeConfig(propsAPI)} />
            <Graph
                svgRef={svgRef}
                propsAPIRef={propsApiRef}
                onCanvasClick={dismissSidePanel}
                onNodeClick={onNodeClick}
                defaultNodeShape="module"
                defaultPortShape="modulePort"
                defaultEdgeShape="customEdge"
                canvasMouseMode={props.canvasMouseMode}
                getNodeAriaLabel={LocalizerHelpers.getNodeAriaLabel}
                getPortAriaLabel={LocalizerHelpers.getPortAriaLabel}
                features={props.readOnly ? readOnlyFeatures : undefined}
            />
        </>
    );
};
