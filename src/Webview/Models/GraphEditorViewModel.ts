import { ICanvasEdge, ICanvasNode } from "@vienna/react-dag-editor";
import { MediaGraphNodeInput } from "../../Common/Types/LVASDKTypes";
import { CanvasNodeData } from "../Types/GraphTypes";
import NodeHelpers from "../Utils/NodeHelpers";

export default class GraphData {
    // output is a list of nodes, edges, and some metadata
    public nodes: ICanvasNode<CanvasNodeData>[] = [];
    public edges: ICanvasEdge[] = [];

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
    public getNodeInputs(nodeId: string) {
        const inboundEdges = this.edges.filter((edge) => edge.target === nodeId);
        return inboundEdges.map(
            (edge) =>
                ({
                    nodeName: this.getNodeName(edge.source)
                } as MediaGraphNodeInput)
        );
    }

    // checks if a graph is connected (no orphaned nodes)
    public isGraphConnected() {
        if (this.nodes.length === 0) {
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

    // get all immediate parents of a node
    public getDirectParentsOfNodeById(nodeId: string): ICanvasNode[] {
        const parents: ICanvasNode[] = [];
        for (const edge of this.edges) {
            if (edge.target === nodeId) {
                const node = this.getNodeById(edge.source);
                if (node) {
                    parents.push(node);
                }
            }
        }
        return parents;
    }

    // get all parents of a node
    public getAllParentsOfNodeById(nodeId: string): ICanvasNode[] {
        const parents: ICanvasNode[] = this.getDirectParentsOfNodeById(nodeId);
        const nodesToCrawl = parents;
        while (nodesToCrawl.length > 0) {
            const node = nodesToCrawl.pop();
            // TS complains that node might be undefined, so do an explicit check
            if (!node) {
                continue;
            }
            const thisNodesParents = this.getDirectParentsOfNodeById(node.id);
            for (const newParent of thisNodesParents) {
                if (!NodeHelpers.nodeArrayContainsNodeId(parents, newParent.id)) {
                    parents.push(newParent);
                    nodesToCrawl.push(newParent);
                }
            }
        }
        return parents;
    }

    // gets all nodes connected in either direction to a node
    public getConnectedNodes(nodeId: string) {
        const pointedAtBy = this.edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source);
        const pointingTo = this.edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
        return [...pointedAtBy, ...pointingTo];
    }

    // returns the node with the given ID
    public getNodeById(nodeId: string) {
        for (const node of this.nodes) {
            if (node.id === nodeId) {
                return node;
            }
        }
        return null;
    }
}
