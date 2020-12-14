import { ITreeNode } from "react-accessible-tree";
import { ICanvasNode } from "@vienna/react-dag-editor";
import Localizer from "../Localization/Localizer";
import { CanvasNodeProperties, NodeDefinition } from "../Types/GraphTypes";
import Helpers from "../Utils/Helpers";
import * as storedNodes from "./v2.0.0/nodes.json"; // TODO  load the correct version when needed support for multiple versions

const availableNodes: NodeDefinition[] = storedNodes.availableNodes as NodeDefinition[];
const itemPanelNodes: any[] = storedNodes.itemPanelNodes;

export default class Definitions {
    public static getNodeDefinition(type: string): NodeDefinition {
        return availableNodes.filter((x) => type && x.name === type.replace("#Microsoft.Media.", ""))[0];
    }

    public static getNameFromParsedRef(parsedRef: string) {
        return parsedRef.replace("#/definitions/", "");
    }
    public static getCompatibleNodes(fullParentTypeRef: string) {
        const compatibleNodes = [];
        const parentType = this.getNameFromParsedRef(fullParentTypeRef);

        for (const candidateNode of availableNodes) {
            const nodeInheritsFrom = candidateNode.parsedAllOf && candidateNode.parsedAllOf.includes(fullParentTypeRef);
            if (nodeInheritsFrom || (!nodeInheritsFrom && candidateNode.name === parentType && candidateNode.discriminator == null)) {
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
