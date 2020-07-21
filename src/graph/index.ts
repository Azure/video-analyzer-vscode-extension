import dagre from "dagre";
import { v4 as uuid } from "uuid";
import {
  ICanvasEdge,
  ICanvasNode,
  ICanvasPort,
  ICanvasData,
} from "@vienna/react-dag-editor";
import Definitions from "../definitions";
import Helpers from "../helpers/helpers";
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
  ValidationErrorType,
} from "../types/graphTypes";
import Localizer from "../localization";

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

  // output is a list of nodes, edges, and some metadata
  private nodes: ICanvasNode[] = [];
  private edges: ICanvasEdge[] = [];

  public setGraphData(graphInfo: GraphInfo) {
    this.graphInformation = graphInfo.meta;
    this.nodes = graphInfo.nodes;
    this.edges = graphInfo.edges;
  }

  public setGraphDataFromICanvasData(canvasData: ICanvasData) {
    this.nodes = [...canvasData.nodes];
    this.edges = [...canvasData.edges];
  }

  // converts internal representation to topology that can be sent using a direct method call
  public setTopology(topology: any) {
    this.graphInformation = topology;

    // go through all the sources, processors, and sinks we are given and flatten them into nodes
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
        this.nodes.push({
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

    this.forEachNodeInput((node: any, input: any) => {
      const sourceNode = this.getNode(input.nodeName);
      const sourcePort = this.getPort(input.nodeName, false);
      const targetNode = this.getNode(node.name);
      const targetPort = this.getPort(node.name, true);

      // since we know all of the inputs for node, we can form edges (input, node)
      if (sourceNode && sourcePort && targetNode && targetPort) {
        this.edges.push({
          source: sourceNode.id,
          target: targetNode.id,
          sourcePortId: sourcePort.id,
          targetPortId: targetPort.id,
          id: uuid(),
        });
      }
    });

    this.layoutGraph();
  }

  public validate(): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!this.isGraphConnected()) {
      errors.push({
        // localized later
        description: "Graph is not connected",
        type: ValidationErrorType.NotConnected,
      });
    }

    const typeCount: Record<string, number> = {};

    for (const node of this.nodes) {
      const nodeData = node.data;

      if (nodeData) {
        const properties = this.getTrimmedNodeProperties(
          nodeData.nodeProperties
        );
        const missingProperties = this.recursiveCheckForMissingProperties(
          properties,
          [] /* path to the property, this is root, so empty array */,
          [] /* this array will recursively fill with errors */
        );
        errors.push(...missingProperties);

        if (!(properties.type in typeCount)) {
          typeCount[properties.type] = 0;
        }
        typeCount[properties.type]++;
      }
    }

    for (const nodeType in typeCount) {
      const count = typeCount[nodeType];

      if (
        [
          "#Microsoft.Media.MediaGraphRtspSource",
          "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
          "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
        ].includes(nodeType) &&
        count > 1
      ) {
        errors.push({
          description: "More than one {node type}",
          type: ValidationErrorType.NodeCountLimit,
          nodeType,
        });
      }
    }

    for (const edge of this.edges) {
      for (const node of this.nodes) {
        if (node.id === edge.source) {
          return node;
        }
      }
    }

    return errors;
  }

  private isNodeOfTypeChildOf(nodeType: string, nodeId: string) {
    for (const edge of this.edges) {
      for (const node of this.nodes) {
        if (node.id === edge.source) {
          const pointingAt = this.getNodeTypeFromId(edge.target);
          if (pointingAt == nodeType) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private isNodeOfTypeDownstreamOf(nodeType: string, nodeId: string) {}

  private getNodeTypeFromId(nodeId: string): string | undefined {
    for (const node of this.nodes) {
      if (node.id === nodeId) {
        return node.data && node.data.nodeProperties.type;
      }
    }
  }

  private recursiveCheckForMissingProperties(
    nodeProperties: any,
    path: string[],
    errors: ValidationError[]
  ): ValidationError[] {
    const definition = Definitions.getNodeDefinition(nodeProperties);

    if (!definition) {
      return errors;
    }

    // validate if any required properties are missing
    for (const name in definition.properties) {
      const property = definition.properties[name];
      const isRequiredProperty = definition.required?.includes(name);
      const nestedProperties = nodeProperties[name];
      const propertyIsMissing =
        !nestedProperties || Helpers.isEmptyObject(nestedProperties);
      const thisPropertyPath = [...path, name];

      if (isRequiredProperty && propertyIsMissing) {
        errors.push({
          // localized later
          description: "Missing property {property name}",
          type: ValidationErrorType.MissingProperty,
          property: thisPropertyPath,
        });
      } else if (
        property.type === "object" &&
        !Helpers.isEmptyObject(nestedProperties)
      ) {
        this.recursiveCheckForMissingProperties(
          nestedProperties,
          thisPropertyPath,
          errors
        );
      }
    }

    return errors;
  }

  public getTopology() {
    this.sources = [];
    this.processors = [];
    this.sinks = [];

    for (const node of this.nodes) {
      const nodeData = node.data;

      if (nodeData) {
        // only save used node properties i.e. those that match the selected types
        const properties = this.getTrimmedNodeProperties(
          nodeData.nodeProperties
        );
        properties.name = nodeData.nodeProperties.name;

        // get nodes pointing to this node
        properties.inputs = this.getNodeInputs(node.id);
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
      nodes: this.nodes,
      edges: this.edges,
    };
  }

  public getGraphInfo(): GraphInfo {
    const graphInfo = {
      meta: this.getTopology(),
      nodes: this.nodes,
      edges: this.edges,
    };

    if (this.graphInformation.properties) {
      const props = graphInfo.meta.properties as any;
      props.description = this.graphInformation.properties.description;
      props.parameters = this.graphInformation.properties.parameters;
    }

    return graphInfo;
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

    for (const node of this.nodes) {
      g.setNode(node.id, {
        width: width,
        height: height,
      });
    }
    for (const edge of this.edges) {
      g.setEdge((edge.source as unknown) as dagre.Edge, edge.target);
    }

    dagre.layout(g);

    this.nodes = this.nodes.map((node) => ({
      ...node,
      x: g.node(node.id).x - width / 2,
      y: g.node(node.id).y - height / 2,
    }));
  }

  private getPortAriaLabel(node: ICanvasNode, port: ICanvasPort) {
    const type = port.isOutputDisabled
      ? Localizer.l("input")
      : Localizer.l("output");
    return Localizer.l("{node name} {type} port").format(node.name, type);
  }

  // helper that gets a node object from its string
  private getNode(nodeName: string) {
    for (const node of this.nodes) {
      if (node.name === nodeName) {
        return node;
      }
    }
    return null;
  }

  // get the input or output port for a node named nodeName
  private getPort(nodeName: string, input: boolean) {
    const node = this.getNode(nodeName);
    if (node && node.ports) {
      for (const port of node.ports) {
        if (port.isOutputDisabled === input) {
          return port;
        }
      }
    }
    return null;
  }

  // helper to loop through all inputs for all nodes
  private forEachNodeInput(callback: (node: any, input: any) => void) {
    if (this.graphInformation && this.graphInformation.properties) {
      for (const nodeType of Graph.nodeTypeList) {
        for (const node of (this.graphInformation.properties as Record<
          string,
          any[]
        >)[NodeHelpers.getNodeTypeKey(nodeType)]) {
          if (node.inputs) {
            for (const input of node.inputs) {
              callback(node, input);
            }
          }
        }
      }
    }
  }

  /* To be able to switch between multiple different types of properties without
	loosing the values or properties not needed for the selected type, properties
	that might not be needed are retained. We can remove these when exporting. */
  private getTrimmedNodeProperties(nodeProperties: any): any {
    const definition = Definitions.getNodeDefinition(nodeProperties);
    const neededProperties: any = {};

    if (!definition) {
      return {};
    }

    // copy over only properties as needed (determined by definition)
    for (const name in definition.properties) {
      const property = definition.properties[name];
      const nestedProperties = nodeProperties[name];

      if (nestedProperties) {
        if (property.type === "object") {
          if (!Helpers.isEmptyObject(nestedProperties)) {
            neededProperties[name] = this.getTrimmedNodeProperties(
              nestedProperties
            );
          }
        } else {
          neededProperties[name] = nestedProperties;
        }
      }
    }

    return {
      "@type": nodeProperties["@type"],
      ...neededProperties,
    };
  }

  // helper method that converts a node ID -> name
  private getNodeName(nodeId: string) {
    for (const node of this.nodes) {
      if (node.id === nodeId) {
        return node.name;
      }
    }
    return null;
  }

  // converts from edges (u, v) to an array of nodes [u] pointing to v
  private getNodeInputs(nodeId: string) {
    const inboundEdges = this.edges.filter((edge) => edge.target === nodeId);
    return inboundEdges.map((edge) => ({
      nodeName: this.getNodeName(edge.source),
    }));
  }

  private isGraphConnected() {
    if (this.nodes.length == 0) {
      return true;
    }
    // maps a node ID to a boolean that indicates if we saw it
    const hasNodeBeenReached: Record<string, boolean> = {};
    for (const node of this.nodes) {
      hasNodeBeenReached[node.id] = false;
    }
    // pick an arbitrary node
    const nodesToCheck = [this.nodes[0].id];
    // and follow its adjacent nodes and mark them as seen, repeat for their adjacent nodes and so on
    while (nodesToCheck.length > 0) {
      const nodeToCheck = nodesToCheck.pop() || "";
      if (!hasNodeBeenReached[nodeToCheck]) {
        hasNodeBeenReached[nodeToCheck] = true;
        nodesToCheck.push(...this.getConnectedNodes(nodeToCheck));
      }
    }
    // if any node hasn't been seen at this point, not all nodes are connected
    for (const nodeId in hasNodeBeenReached) {
      if (!hasNodeBeenReached[nodeId]) {
        return false;
      }
    }
    return true;
  }

  // gets all nodes connected in either direction to a node
  private getConnectedNodes(nodeId: string) {
    const pointedAtBy = this.edges
      .filter((edge) => edge.target === nodeId)
      .map((edge) => edge.source);
    const pointingTo = this.edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => edge.target);
    return [...pointedAtBy, ...pointingTo];
  }
}
