import { ITreeNode } from "react-accessible-tree";
import { ICanvasNode } from "@vienna/react-dag-editor";
import Localizer from "../Localization/Localizer";
import { CanvasNodeProperties, NodeDefinition } from "../Types/GraphTypes";
import Helpers from "../Utils/Helpers";
import * as storedNodes from "./v2.0.0/nodes.json"; // TODO  load the correct version when needed support for multiple versions

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
                const initialNode = node.extra as ICanvasNode<any>;
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
