import dagre from "dagre";
import { v4 as uuid } from "uuid";
import {
  ICanvasEdge,
  ICanvasNode,
  ICanvasPort,
  ICanvasData,
} from "@vienna/react-dag-editor";
import NodeHelpers from "../helpers/nodeHelpers";
import {
  MediaGraphProcessorUnion,
  MediaGraphSinkUnion,
  MediaGraphSourceUnion,
  MediaGraphTopology,
} from "../lva-sdk/lvaSDKtypes";
import {
  GraphInfo,
  MediaGraphNodeType,
  ValidationError,
} from "../types/graphTypes";
import Localizer from "../localization";
import GraphData from "./graphData";
import GraphValidator from "./graphValidator";

export default class Graph {
  private static readonly nodeTypeList = [
    MediaGraphNodeType.Source,
    MediaGraphNodeType.Processor,
    MediaGraphNodeType.Sink,
  ];

  // what we initialized with (contains name, description, etc.)
  private graphInformation: MediaGraphTopology = { name: "" };

  // the target format expects dividing up the nodes into these three types
  private sources: MediaGraphSourceUnion[] = [];
  private processors: MediaGraphProcessorUnion[] = [];
  private sinks: MediaGraphSinkUnion[] = [];

  private nodesAndEdges: GraphData = new GraphData();

  public setGraphData(graphInfo: GraphInfo) {
    this.graphInformation = graphInfo.meta;
    this.nodesAndEdges.setNodes(graphInfo.nodes);
    this.nodesAndEdges.setEdges(graphInfo.edges);
  }

  public setGraphDataFromICanvasData(canvasData: ICanvasData) {
    // need to use spread operator because these are readonly properties
    this.nodesAndEdges.setNodes([...canvasData.nodes]);
    this.nodesAndEdges.setEdges([...canvasData.edges]);
  }

  // converts internal representation to topology that can be sent using a direct method call
  public setTopology(topology: any) {
    this.graphInformation = topology;

    // go through all the sources, processors, and sinks we are given and flatten them into nodes
    const nodes: ICanvasNode[] = [];
    for (const nodeType of Graph.nodeTypeList) {
      const nodesForType =
        topology.properties[NodeHelpers.getNodeTypeKey(nodeType)];
      for (const node of nodesForType) {
        const ports = NodeHelpers.getPorts(node, nodeType).map((port) => {
          const label = this.getPortAriaLabel(node, port);
          return {
            ...port,
            name: label,
            ariaLabel: label,
          };
        });
        nodes.push({
          id: uuid(),
          name: node.name,
          ariaLabel: Localizer.l("Node named {name}").format(node.name),
          data: {
            ...NodeHelpers.getNodeProperties(nodeType),
            nodeProperties: node,
            nodeType: nodeType,
          },
          ports: ports,
          x: 0,
          y: 0,
        });
      }
    }
    this.nodesAndEdges.setNodes(nodes);

    const edges: ICanvasEdge[] = [];
    this.forEachNodeInput((node: any, input: any) => {
      const sourceNode = this.nodesAndEdges.getNode(input.nodeName);
      const sourcePort = this.nodesAndEdges.getPort(input.nodeName, false);
      const targetNode = this.nodesAndEdges.getNode(node.name);
      const targetPort = this.nodesAndEdges.getPort(node.name, true);

      // since we know all of the inputs for node, we can form edges (input, node)
      if (sourceNode && sourcePort && targetNode && targetPort) {
        edges.push({
          source: sourceNode.id,
          target: targetNode.id,
          sourcePortId: sourcePort.id,
          targetPortId: targetPort.id,
          id: uuid(),
        });
      }
    });
    this.nodesAndEdges.setEdges(edges);

    this.layoutGraph();
  }

  public getTopology() {
    this.sources = [];
    this.processors = [];
    this.sinks = [];

    for (const node of this.nodesAndEdges.getNodes()) {
      const nodeData = node.data;

      if (nodeData) {
        // only save used node properties i.e. those that match the selected types
        const properties = NodeHelpers.getTrimmedNodeProperties(
          nodeData.nodeProperties
        );
        properties.name = nodeData.nodeProperties.name;

        // get nodes pointing to this node
        properties.inputs = this.nodesAndEdges.getNodeInputs(node.id);
        if (properties.inputs.length === 0) {
          delete properties.inputs;
        }

        // filter into three categories
        switch (nodeData.nodeType) {
          case MediaGraphNodeType.Source:
            this.sources.push(properties);
            break;
          case MediaGraphNodeType.Processor:
            this.processors.push(properties);
            break;
          case MediaGraphNodeType.Sink:
            this.sinks.push(properties);
            break;
        }
      }
    }

    const topology: MediaGraphTopology = {
      name: this.graphInformation.name,
      properties: {
        ...this.graphInformation.properties,
        sources: this.sources,
        processors: this.processors,
        sinks: this.sinks,
      },
    };
    if (this.graphInformation.systemData) {
      topology.systemData = this.graphInformation.systemData;
    }
    if (this.graphInformation.apiVersion) {
      // AutoRest changes @apiVersion to apiVersion, here it is changed back
      (topology as any)["@apiVersion"] = this.graphInformation.apiVersion;
    }

    return topology;
  }

  public getICanvasData(): ICanvasData {
    return {
      nodes: this.nodesAndEdges.getNodes(),
      edges: this.nodesAndEdges.getEdges(),
    };
  }

  public getGraphInfo(): GraphInfo {
    const graphInfo = {
      meta: this.getTopology(),
      nodes: this.nodesAndEdges.getNodes(),
      edges: this.nodesAndEdges.getEdges(),
    };

    if (this.graphInformation.properties) {
      const props = graphInfo.meta.properties as any;
      props.description = this.graphInformation.properties.description;
      props.parameters = this.graphInformation.properties.parameters;
    }

    return graphInfo;
  }

  public validate(): ValidationError[] {
    return GraphValidator.validate(this.nodesAndEdges);
  }

  // Internal functions

  private layoutGraph() {
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      marginx: 30,
      marginy: 30,
    });
    g.setDefaultEdgeLabel(function () {
      return {};
    });

    const width = 350;
    const height = 70;

    for (const node of this.nodesAndEdges.getNodes()) {
      g.setNode(node.id, {
        width: width,
        height: height,
      });
    }
    for (const edge of this.nodesAndEdges.getEdges()) {
      g.setEdge((edge.source as unknown) as dagre.Edge, edge.target);
    }

    dagre.layout(g);

    this.nodesAndEdges.setNodes(
      this.nodesAndEdges.getNodes().map((node) => ({
        ...node,
        x: g.node(node.id).x - width / 2,
        y: g.node(node.id).y - height / 2,
      }))
    );
  }

  private getPortAriaLabel(node: ICanvasNode, port: ICanvasPort) {
    const type = port.isOutputDisabled
      ? Localizer.l("input")
      : Localizer.l("output");
    return Localizer.l("{node name} {type} port").format(node.name, type);
  }

  // helper to loop through all inputs for all nodes
  private forEachNodeInput(callback: (node: any, input: any) => void) {
    if (this.graphInformation && this.graphInformation.properties) {
      for (const nodeType of Graph.nodeTypeList) {
        const thisTypesNodesProperties = (this.graphInformation
          .properties as Record<string, any[]>)[
          NodeHelpers.getNodeTypeKey(nodeType)
        ];
        for (const node of thisTypesNodesProperties) {
          if (node.inputs) {
            for (const input of node.inputs) {
              callback(node, input);
            }
          }
        }
      }
    }
  }
}
