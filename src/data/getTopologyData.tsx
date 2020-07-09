import dagre from "dagre";
import { sampleTopology } from "./sampleTopologies.js";
import { v4 as uuid } from "uuid";

import { ICanvasNode, ICanvasEdge } from "@vienna/react-dag-editor";
import { GraphInfo } from "./graphTypes";
import {
  getNodeTypeTitle,
  getNodeProperties,
  getPorts,
} from "./graphFunctions";
import { nodeTypeList } from "./nodes";

const topology: any = sampleTopology;

export const getTopologyData = (): GraphInfo => {
  let nodes: ICanvasNode[] = [];
  const edges: ICanvasEdge[] = [];

  for (const nodeType of nodeTypeList) {
    // source, processor, or sink nodes
    const nodesForType = topology.properties[getNodeTypeTitle(nodeType)];
    for (const node of nodesForType) {
      nodes.push({
        id: uuid(),
        name: node.name,
        ariaLabel: `Node named ${node.name}`,
        data: {
          ...getNodeProperties(nodeType),
          nodeProperties: node,
          nodeType: nodeType,
        },
        ports: getPorts(node, nodeType),
        x: 0,
        y: 0,
      });
    }
  }

  function getNode(nodeName: string) {
    for (const node of nodes) {
      if (node.name === nodeName) {
        return node;
      }
    }
    return null;
  }

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

  for (const nodeType of nodeTypeList) {
    for (const node of topology.properties[getNodeTypeTitle(nodeType)]) {
      if (node.inputs) {
        for (const input of node.inputs) {
          const sourceNode = getNode(input.nodeName);
          const sourcePort = getPort(input.nodeName, false);
          const targetNode = getNode(node.name);
          const targetPort = getPort(node.name, true);

          if (sourceNode && sourcePort && targetNode && targetPort) {
            edges.push({
              source: sourceNode.id,
              target: targetNode.id,
              sourcePortId: sourcePort.id,
              targetPortId: targetPort.id,
              id: uuid(),
            });
          }
        }
      }
    }
  }

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
