import { ITreeNode } from "react-accessible-tree";
import { ICanvasNode } from "@vienna/react-dag-editor";
import Helpers from "../helpers/Helpers";
import Localizer from "../localization/Localizer";
import { CanvasNodeProperties, NodeDefinition } from "../types/graphTypes";
import * as storedNodes from "./v1.0/nodes.json";

const availableNodes: NodeDefinition[] = storedNodes.availableNodes as NodeDefinition[];
const itemPanelNodes: any[] = storedNodes.itemPanelNodes;

export default class Definitions {
    public static getNodeDefinition(nodeProperties: CanvasNodeProperties): NodeDefinition {
        return availableNodes.filter((x) => nodeProperties["@type"] && x.name === nodeProperties["@type"].replace("#Microsoft.Media.", ""))[0];
    }

    public static getCompatibleNodes(fullParentTypeRef: string) {
        const compatibleNodes = [];
        const parentType = fullParentTypeRef.replace("#/definitions/", "");

        for (const candidateNode of availableNodes) {
            const nodeInheritsFrom = candidateNode.parsedAllOf && candidateNode.parsedAllOf.includes(fullParentTypeRef);
            if (nodeInheritsFrom || candidateNode.name === parentType) {
                compatibleNodes.push(candidateNode);
            }
        }

        return compatibleNodes;
    }

    public static getAllAvailableNodes() {
        return availableNodes;
    }

    public static getItemPanelNodes(): ITreeNode[] {
        return itemPanelNodes.map((category) => ({
            ...category,
            children: category.children!.map((node: ITreeNode) => {
                const initialNode = node.extra as ICanvasNode;
                const internalName = initialNode.data!.nodeProperties.name as string;
                const localizedName = Localizer.getLocalizedStrings(internalName).title;
                return {
                    ...node,
                    extra: {
                        ...node.extra,
                        name: Helpers.convertToCamel(internalName)
                    },
                    title: localizedName,
                    searchKeys: [localizedName]
                };
            })
        }));
    }
}
