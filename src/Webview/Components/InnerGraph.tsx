import * as React from "react";
import {
    CanvasMouseMode,
    Graph,
    GraphDataChangeType,
    GraphFeatures,
    GraphNodeState,
    GraphValueControlled,
    ICanvasData,
    ICanvasNode,
    IGraphDataChangeEvent,
    IPropsAPI,
    IZoomPanSettings,
    RegisterEdge,
    RegisterPanel,
    TSetData,
    TSetZoomPanSettings,
    usePropsAPI
} from "@vienna/react-dag-editor";
import { MediaGraphParameterDeclaration } from "../../Common/Types/LVASDKTypes";
import { ValidationError } from "../Types/GraphTypes";
import LocalizerHelpers from "../Utils/LocalizerHelpers";
import { CustomEdgeConfig } from "./CustomEdgeConfig";
import { NodePropertiesPanel } from "./NodePropertiesPanel";
import { ValidationErrorPanel } from "./ValidationErrorPanel";

export interface IInnerGraphProps {
    data: ICanvasData;
    setData: TSetData;
    zoomPanSettings: IZoomPanSettings;
    setZoomPanSettings: TSetZoomPanSettings;
    canvasMouseMode: CanvasMouseMode;
    isHorizontal?: boolean;
    onChange?: (evt: IGraphDataChangeEvent) => void;
    triggerValidation?: () => void;
    readOnly?: boolean;
    parameters?: MediaGraphParameterDeclaration[];
    propsApiRef: React.RefObject<IPropsAPI>;
    validationErrors?: ValidationError[];
    showValidationErrors?: boolean;
    toggleValidationErrorPanel?: () => void;
    updateNodeName: (oldName: string, newName: string) => void | undefined;
}

export const InnerGraph: React.FunctionComponent<IInnerGraphProps> = (props) => {
    const { readOnly = false, parameters = [], propsApiRef, triggerValidation, updateNodeName } = props;

    const svgRef = React.useRef<SVGSVGElement>(null);
    const propsAPI = usePropsAPI();

    // open node inspector panel when recovering state, a node is clicked, or a node is added
    const inspectNode = (node?: ICanvasNode) => {
        if (node && propsApiRef.current) {
            propsApiRef.current.openSidePanel("node", node);
        }
    };
    props.data.nodes.forEach((node) => {
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

    const onChange = (evt: IGraphDataChangeEvent, ref: React.RefObject<SVGSVGElement>) => {
        if (props.onChange) {
            props.onChange(evt);
        }
        switch (evt.type) {
            case GraphDataChangeType.deleteNode: // in case just a node is removed
            case GraphDataChangeType.deleteMultiple: // in case nodes + attached edges are removed
                dismissSidePanel();
                break;
            default:
        }
    };

    const itemStyles: React.CSSProperties = {
        maxHeight: "200px"
    };

    const readOnlyFeatures = new Set(["a11yFeatures", "canvasScrollable", "panCanvas", "clickNodeToSelect", "sidePanel", "editNode"]) as Set<GraphFeatures>;

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
            <GraphValueControlled data={props.data} setData={props.setData} zoomPanSettings={props.zoomPanSettings} setZoomPanSettings={props.setZoomPanSettings}>
                <Graph
                    svgRef={svgRef}
                    propsAPIRef={propsApiRef}
                    onCanvasClick={dismissSidePanel}
                    onNodeClick={onNodeClick}
                    onChange={onChange}
                    defaultNodeShape="module"
                    defaultPortShape="modulePort"
                    defaultEdgeShape="customEdge"
                    canvasMouseMode={props.canvasMouseMode}
                    getNodeAriaLabel={LocalizerHelpers.getNodeAriaLabel}
                    getPortAriaLabel={LocalizerHelpers.getPortAriaLabel}
                    //features={props.readOnly ? readOnlyFeatures : undefined}
                />
            </GraphValueControlled>
        </>
    );
};
