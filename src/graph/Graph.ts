import dagre from "dagre";
import { v4 as uuid } from "uuid";
import {
  ICanvasEdge,
  ICanvasNode,
  ICanvasData,
} from "@vienna/react-dag-editor";
import Definitions from "../definitions/Definitions";
import Helpers from "../helpers/Helpers";
import NodeHelpers from "../helpers/NodeHelpers";
import {
  MediaGraphProcessorUnion,
  MediaGraphSinkUnion,
  MediaGraphSourceUnion,
  MediaGraphTopology,
  MediaGraphNodeInput,
} from "../lva-sdk/lvaSDKtypes";
import {
  GraphInfo,
  MediaGraphNodeType,
  CanvasNodeData,
  CanvasNodeProperties,
} from "../types/graphTypes";
import Localizer from "../localization/Localizer";
import LocalizerHelpers from "../helpers/LocalizerHelpers";

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
  private nodes: ICanvasNode<CanvasNodeData>[] = [];
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
    this.nodes = [];
    this.edges = [];

    // go through all the sources, processors, and sinks we are given and flatten them into nodes
    for (const nodeType of Graph.nodeTypeList) {
      const nodesForType =
        topology.properties[NodeHelpers.getNodeTypeKey(nodeType)];
      if (!nodesForType) {
        // no nodes for this type
        continue;
      }

      for (const node of nodesForType) {
        const ports = NodeHelpers.getPorts(node, nodeType).map((port) => {
          return {
            ...port,
            name: LocalizerHelpers.getPortName(node, port),
            ariaLabel: LocalizerHelpers.getPortAriaLabel(
              this.getICanvasData(),
              node,
              port
            ),
          };
        });
        this.nodes.push({
          id: uuid(),
          name: node.name,
          ariaLabel: Localizer.l("ariaNodeLabelNodeDescription").format(
            node.name
          ),
          data: {
            ...NodeHelpers.getNodeAppearance(nodeType),
            nodeProperties: node,
            nodeType: nodeType,
          } as CanvasNodeData,
          ports: ports,
          x: 0,
          y: 0,
        });
      }
    }

    this.forEachNodeInput(
      (node: CanvasNodeProperties, input: MediaGraphNodeInput) => {
        const sourceNode = this.getNode(input.nodeName || "");
        const sourcePort = this.getPort(input.nodeName || "", false);
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
      }
    );

    this.layoutGraph();
  }

  public setName(name: string) {
    this.graphInformation.name = name;
  }

  public setDescription(description: string) {
    if (!this.graphInformation.properties) {
      this.graphInformation.properties = {};
    }
    if (description === "") {
      delete this.graphInformation.properties.description;
    } else {
      this.graphInformation.properties.description = description;
    }
  }

  public getName(): string {
    return this.graphInformation.name;
  }

  public getDescription(): string | undefined {
    if (this.graphInformation.properties) {
      return this.graphInformation.properties.description;
    } else {
      return undefined;
    }
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
          nodeData.nodeProperties as CanvasNodeProperties
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
            this.sources.push(properties as any);
            break;
          case MediaGraphNodeType.Processor:
            this.processors.push(properties as any);
            break;
          case MediaGraphNodeType.Sink:
            this.sinks.push(properties as any);
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
  private forEachNodeInput(
    callback: (node: CanvasNodeProperties, input: MediaGraphNodeInput) => void
  ) {
    if (this.graphInformation && this.graphInformation.properties) {
      for (const nodeType of Graph.nodeTypeList) {
        const nodesForType = (this.graphInformation.properties as Record<
          string,
          CanvasNodeProperties[]
        >)[NodeHelpers.getNodeTypeKey(nodeType)];
        if (!nodesForType) {
          // no nodes for this type
          continue;
        }

        for (const node of nodesForType) {
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
  private getTrimmedNodeProperties(
    nodeProperties: CanvasNodeProperties
  ): CanvasNodeProperties {
    const definition = Definitions.getNodeDefinition(nodeProperties);
    const neededProperties: any = {};

    if (!definition) {
      return {
        "@type": nodeProperties["@type"],
        name: nodeProperties.name,
      };
    }

    // copy over only properties as needed (determined by definition)
    for (const name in definition.properties) {
      const property = definition.properties[name];
      const nestedProperties = (nodeProperties as any)[name];

      if (nestedProperties) {
        if (property && property.type === "object") {
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

    // validate if any required properties are missing
    for (const name in definition.properties) {
      const isRequiredProperty = definition.required?.includes(name);
      const usedProperties = neededProperties[name];
      const propertyIsMissing =
        !usedProperties || Helpers.isEmptyObject(usedProperties);

      if (isRequiredProperty && propertyIsMissing) {
        // TODO bubble up and show with validation errors in interface
        console.log("Expected to see property", name);
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
    return inboundEdges.map(
      (edge) =>
        ({
          nodeName: this.getNodeName(edge.source),
        } as MediaGraphNodeInput)
    );
  }
}
