import compareVersions from "compare-versions";
import { ITreeNode } from "react-accessible-tree";
import { ICanvasNode } from "@vienna/react-dag-editor";
import Localizer from "../Localization/Localizer";
import { NodeDefinition } from "../Types/GraphTypes";
import Helpers from "../Utils/Helpers";

export default class Definitions {
    private static _availableNodes: NodeDefinition[];
    private static _itemPanelNodes: any[];
    public static TypePrefix = "";
    public static VersionFolder = "";

    public static loadDefinitions() {
        this.VersionFolder = (window as any).versionFolder;
        const isLegacyModule = (window as any).isLegacyModule == "true";
        this.TypePrefix = isLegacyModule ? "#Microsoft.Media." : "#Microsoft.VideoAnalyzer.";
        return import(`./${this.VersionFolder}/nodes.json`).then((storedNodes) => {
            Definitions._availableNodes = storedNodes.availableNodes as NodeDefinition[];
            Definitions._itemPanelNodes = storedNodes.itemPanelNodes;
        });
    }

    public static getNodeDefinition(type: string): NodeDefinition {
        return this._availableNodes.filter((x) => type && x.name === type.replace(this.TypePrefix, ""))[0];
    }

    public static getNameFromParsedRef(parsedRef: string) {
        return parsedRef.replace("#/definitions/", "");
    }
    public static getCompatibleNodes(fullParentTypeRef: string) {
        const compatibleNodes = [];
        const parentType = this.getNameFromParsedRef(fullParentTypeRef);

        for (const candidateNode of this._availableNodes) {
            const nodeInheritsFrom = candidateNode.parsedAllOf && candidateNode.parsedAllOf.includes(fullParentTypeRef);
            if (nodeInheritsFrom || (!nodeInheritsFrom && candidateNode.name === parentType && candidateNode.discriminator == null)) {
                compatibleNodes.push(candidateNode);
            }
        }

        return compatibleNodes;
    }

    public static getAllAvailableNodes() {
        return this._availableNodes;
    }

    public static getItemPanelNodes(): ITreeNode[] {
        return this._itemPanelNodes.map((category) => ({
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
