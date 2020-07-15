import dagre from "dagre";
import { v4 as uuid } from "uuid";
import { ICanvasEdge, ICanvasNode } from "@vienna/react-dag-editor";
import {
  getNodeProperties,
  getNodeTypeTitle,
  getPorts,
} from "../helpers/nodeHelpers";
import { GraphInfo, MediaGraphNodeType } from "../types/graphTypes";
import { localize } from "../localization";

const nodeTypeList = [
  MediaGraphNodeType.Source,
  MediaGraphNodeType.Processor,
  MediaGraphNodeType.Sink,
];

// converts a topology (from disk or an Edge device for example) to an internally usable format
export const convertTopologyToGraph = (topology: any): GraphInfo => {
  // output is a list of nodes, edges, and some metadata
  let nodes: ICanvasNode[] = [];
  const edges: ICanvasEdge[] = [];

  // go through all the sources, processors, and sinks we are given and flatten them into nodes
  for (const nodeType of nodeTypeList) {
    const nodesForType = topology.properties[getNodeTypeTitle(nodeType)];
    for (const node of nodesForType) {
      const ports = getPorts(node, nodeType).map((port) => {
        const type = port.isOutputDisabled
          ? localize("input")
          : localize("output");
        const name = localize("{node name} {type} port").format(
          node.name,
          type
        );
        return {
          ...port,
          name,
          ariaLabel: name,
        };
      });
      nodes.push({
        id: uuid(),
        name: node.name,
        ariaLabel: localize("Node named {name}").format(node.name),
        data: {
          ...getNodeProperties(nodeType),
          nodeProperties: node,
          nodeType: nodeType,
        },
        ports: ports,
        x: 0,
        y: 0,
      });
    }
  }

  // helper that gets a node object from its string
  function getNode(nodeName: string) {
    for (const node of nodes) {
      if (node.name === nodeName) {
        return node;
      }
    }
    return null;
  }

  // get the input or output port for a node named nodeName
  function getPort(nodeName: string, input: boolean) {
    const node = getNode(nodeName);
    if (node && node.ports) {
      for (const port of node.ports) {
        if (port.isOutputDisabled === input) {
          return port;
        }
      }
    }
    return null;
  }

  // loop through all inputs for all nodes
  function forEachNodeInput(callback: (node: any, input: any) => void) {
    for (const nodeType of nodeTypeList) {
      for (const node of topology.properties[getNodeTypeTitle(nodeType)]) {
        if (node.inputs) {
          for (const input of node.inputs) {
            callback(node, input);
          }
        }
      }
    }
  }

  forEachNodeInput(function (node: any, input: any) {
    const sourceNode = getNode(input.nodeName);
    const sourcePort = getPort(input.nodeName, false);
    const targetNode = getNode(node.name);
    const targetPort = getPort(node.name, true);

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

  for (const node of nodes) {
    g.setNode(node.id, {
      width: width,
      height: height,
    });
  }

  for (const edge of edges) {
    g.setEdge((edge.source as unknown) as dagre.Edge, edge.target);
  }

  dagre.layout(g);

  nodes = nodes.map((node) => ({
    ...node,
    x: g.node(node.id).x - width / 2,
    y: g.node(node.id).y - height / 2,
  }));

  return {
    meta: {
      name: topology.name,
      apiVersion: topology["@apiVersion"], // AutoRest removes the @
      systemData: topology.systemData,
      properties: {
        description: topology.properties.description,
        parameters: topology.properties.parameters,
      },
    },
    nodes,
    edges,
  };
};
