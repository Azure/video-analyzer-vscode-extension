import * as storedNodes from "./data/nodes.json";
import localizable from "./data/i18n.en.json";
import { NodeDefinition } from "../data/graphTypes";
import { ITreeNode } from "react-accessible-tree";

const availableNodes: NodeDefinition[] = storedNodes.availableNodes;
const itemPanelNodes: ITreeNode[] = storedNodes.itemPanelNodes;
const localized = (localizable as unknown) as Record<string, string>;

function getNodeDefinition(nodeProperties: any) {
  return availableNodes.filter(
    (x: any) =>
      nodeProperties["@type"] &&
      x.name === nodeProperties["@type"].replace("#Microsoft.Media.", "")
  )[0];
}

function localize(key: string) {
  return localized[key];
}

export { availableNodes, itemPanelNodes, getNodeDefinition, localize };
