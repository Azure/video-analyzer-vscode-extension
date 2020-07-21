import { ICanvasNode, ICanvasEdge } from "@vienna/react-dag-editor";

export default class GraphData {
  private nodes: ICanvasNode[] = [];
  private edges: ICanvasEdge[] = [];

  public setNodes(nodes: ICanvasNode[]) {
    this.nodes = nodes;
  }

  public setEdges(edges: ICanvasEdge[]) {
    this.edges = edges;
  }

  public getNodes() {
    return this.nodes;
  }

  public getEdges() {
    return this.edges;
  }

  // helper method that converts a node ID -> name
  public getNodeName(nodeId: string) {
    for (const node of this.nodes) {
      if (node.id === nodeId) {
        return node.name;
      }
    }
    return null;
  }

  // converts from edges (u, v) to an array of nodes [u] pointing to v
  public getNodeInputs(nodeId: string) {
    const inboundEdges = this.edges.filter((edge) => edge.target === nodeId);
    return inboundEdges.map((edge) => ({
      nodeName: this.getNodeName(edge.source),
    }));
  }

  public isGraphConnected() {
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
  public getConnectedNodes(nodeId: string) {
    const pointedAtBy = this.edges
      .filter((edge) => edge.target === nodeId)
      .map((edge) => edge.source);
    const pointingTo = this.edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => edge.target);
    return [...pointedAtBy, ...pointingTo];
  }

  // helper that gets a node object from its string
  public getNode(nodeName: string) {
    for (const node of this.nodes) {
      if (node.name === nodeName) {
        return node;
      }
    }
    return null;
  }

  // get the input or output port for a node named nodeName
  public getPort(nodeName: string, input: boolean) {
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

  public isNodeOfTypeChildOf(nodeType: string, nodeId: string) {
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

  public isNodeOfTypeDownstreamOf(nodeType: string, nodeId: string) {
    //
  }

  private getNodeTypeFromId(nodeId: string): string | undefined {
    for (const node of this.nodes) {
      if (node.id === nodeId) {
        return node.data && node.data.nodeProperties.type;
      }
    }
  }
}
