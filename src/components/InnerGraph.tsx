import * as React from "react";
import {
  Graph,
  GraphDataChangeType,
  ICanvasData,
  ICanvasNode,
  ICanvasPort,
  IGraphDataChangeEvent,
  IGraphStyles,
  IPoint,
  IPropsAPI,
  IZoomPanSettings,
  RegisterEdge,
  RegisterPanel,
  TSetData,
  TSetZoomPanSettings,
  usePropsAPI,
  CanvasMouseMode,
  GraphNodeState,
} from "@vienna/react-dag-editor";
import { CustomEdgeConfig } from "./CustomEdgeConfig";
import { NodePanel } from "./NodePanel";

export interface IInnerGraphProps {
  data: ICanvasData;
  setData: TSetData;
  zoomPanSettings: IZoomPanSettings;
  setZoomPanSettings: TSetZoomPanSettings;
  canvasMouseMode: CanvasMouseMode;
  isHorizontal?: boolean;
  onNodeAdded?: (node: ICanvasNode) => void;
  onNodeRemoved?: (nodes: Set<string>) => void;
}

function between(min: number, max: number, value: number): number {
  let result = value;
  if (min > result) {
    result = min;
  }
  if (max < result) {
    result = max;
  }
  return result;
}

function getPortAriaLabel(
  data: ICanvasData,
  node: ICanvasNode,
  port: ICanvasPort
): string {
  const sourceEdges = data.edges.filter((it) => it.source === node.id);
  const targetEdges = data.edges.filter((it) => it.target === node.id);
  const sourceEdge = sourceEdges.find((it) => it.sourcePortId === port.id);
  const targetEdge = targetEdges.find((it) => it.targetPortId === port.id);
  let anotherNode: ICanvasNode | undefined;
  let anotherPort: ICanvasPort | undefined;
  if (sourceEdge) {
    anotherNode = data.nodes.find((it) => it.id === sourceEdge.target);
    anotherPort = anotherNode?.ports?.find(
      (it) => it.id === sourceEdge.targetPortId
    );
  } else if (targetEdge) {
    anotherNode = data.nodes.find((it) => it.id === targetEdge.source);
    anotherPort = anotherNode?.ports?.find(
      (it) => it.id === targetEdge.sourcePortId
    );
  }
  const connectedTo =
    anotherNode && anotherPort
      ? `connected to ${anotherPort.name} of ${anotherNode.name}`
      : "";
  return `port ${port.name}. port type is ${port.shape ?? ""} parent node is: ${
    node.name
  } ${connectedTo}`;
}

function getNodeAriaLabel(node: ICanvasNode): string {
  const portNames = node.ports?.length
    ? `ports of the node are ${node.ports.map((it) => it.name).join(",")}`
    : "";
  const status = node.data?.status
    ? `current status is ${node.data.status}`
    : "";
  return `node ${node.name}. ${portNames} ${status}`;
}

export const InnerGraph: React.FunctionComponent<IInnerGraphProps> = (
  props
) => {
  const propsApiRef = React.useRef<IPropsAPI>(null);
  const propsApi = usePropsAPI();
  const svgRef = React.useRef<SVGSVGElement>(null);

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
    inspectNode(node);
  };
  const onAddNode = (node?: ICanvasNode) => {
    inspectNode(node);
  };

  const dismissSidePanel = () => {
    if (propsApiRef.current) {
      propsApiRef.current.dismissSidePanel();
    }
  };

  const onChange = (
    evt: IGraphDataChangeEvent,
    ref: React.RefObject<SVGSVGElement>
  ) => {
    switch (evt.type) {
      case GraphDataChangeType.addNode:
        onAddNode(evt.payload);
        if (props.onNodeAdded && evt.payload) props.onNodeAdded(evt.payload);
        break;
      case GraphDataChangeType.deleteNode: // in case just a node is removed
      case GraphDataChangeType.deleteMultiple: // in case nodes + attached edges are removed
        dismissSidePanel();
        if (props.onNodeRemoved && evt.payload && evt.payload.selectedNodeIds)
          props.onNodeRemoved(evt.payload.selectedNodeIds);
        break;
      default:
    }
  };

  const graphStyles: IGraphStyles = {
    root: {
      height: "100vh",
      width: "100%",
    },
  };

  const getPositionFromEvent = (ev: MouseEvent): IPoint => {
    const e = ev as React.MouseEvent;
    const svg = svgRef.current as any;
    const rect = svg.getBoundingClientRect();
    if (!rect) {
      return {
        x: e.clientX,
        y: e.clientY,
      };
    }
    return {
      x: between(rect.left + 100, rect.right - 100, e.clientX),
      y: between(rect.top + 30, rect.bottom - 30, e.clientY),
    };
  };

  return (
    <>
      <RegisterPanel name={"node"} config={new NodePanel(propsApi)} />
      <RegisterEdge
        name={"customEdge"}
        config={new CustomEdgeConfig(propsApi)}
      />
      <Graph
        svgRef={svgRef}
        propsAPIRef={propsApiRef}
        data={props.data}
        setData={props.setData}
        styles={graphStyles}
        onCanvasClick={dismissSidePanel}
        zoomPanSettings={props.zoomPanSettings}
        setPanZoomPanSettings={props.setZoomPanSettings}
        onNodeClick={onNodeClick}
        isAutoFitDisabled={true}
        isKeyboardConnectingEnable={true}
        onChange={onChange}
        defaultNodeShape="module"
        defaultPortShape="modulePort"
        defaultEdgeShape="customEdge"
        canvasMouseMode={props.canvasMouseMode}
        getPositionFromEvent={getPositionFromEvent}
        getNodeAriaLabel={getNodeAriaLabel}
        getPortAriaLabel={getPortAriaLabel}
        isA11yEnable={true}
      />
    </>
  );
};
