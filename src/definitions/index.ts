import { ITreeNode } from "react-accessible-tree";
import { NodeDefinition } from "../types/graphTypes";
import * as storedNodes from "./v1.0/nodes.json";

const availableNodes: NodeDefinition[] = storedNodes.availableNodes;
const itemPanelNodes: ITreeNode[] = storedNodes.itemPanelNodes;

function getNodeDefinition(nodeProperties: any) {
  return availableNodes.filter(
    (x: any) =>
      nodeProperties["@type"] &&
      x.name === nodeProperties["@type"].replace("#Microsoft.Media.", "")
  )[0];
}

function getCompatibleNodes(fullParentTypeRef: string) {
  const compatibleNodes = [];
  const parentType = fullParentTypeRef.replace("#/definitions/", "");

  for (const candidateNode of availableNodes) {
    const nodeInheritsFrom =
      candidateNode.parsedAllOf &&
      candidateNode.parsedAllOf.includes(fullParentTypeRef);
    if (nodeInheritsFrom || candidateNode.name === parentType) {
      compatibleNodes.push(candidateNode);
    }
  }

  return compatibleNodes;
}

export {
  availableNodes,
  itemPanelNodes,
  getNodeDefinition,
  getCompatibleNodes,
};
