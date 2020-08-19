import { FontIcon, Stack, Text } from "office-ui-fabric-react";
import * as React from "react";
import {
    IAccessibleTreeStyles,
    ITreeNode,
    ReactAccessibleTree
} from "react-accessible-tree";
import { v4 as uuid } from "uuid";
import { ICanvasNode, Item, usePropsAPI } from "@vienna/react-dag-editor";
import Definitions from "../../definitions/Definitions";
import NodeHelpers from "../../helpers/NodeHelpers";
import Localizer from "../../localization/Localizer";
import { CanvasNodeData } from "../../types/graphTypes";
import { NodeContainer } from "./NodeContainer";

export const ItemPanel: React.FunctionComponent = (props) => {
    const [treeData, setTreeData] = React.useState<ITreeNode[]>([]);
    const propsAPI = usePropsAPI();

    const hasNodeWithName = (name: string) => {
        const nodes = propsAPI.getData().nodes;
        for (const node of nodes) {
            if (node.name === name) {
                return true;
            }
        }
        return false;
    };

    const nodeWillAdd = (node: ICanvasNode): ICanvasNode => {
        // make sure this name hasn't already been used, append number if it has
        let nodeName = node.name || "";
        let duplicateCounter = 1;
        while (hasNodeWithName(nodeName)) {
            nodeName = (node.name || "node") + duplicateCounter;
            duplicateCounter++;
        }
        if (node.data) {
            node.data.nodeProperties.name = nodeName;
            delete node.data.nodeProperties.dragging;
        }
        return {
            ...node,
            id: uuid(),
            name: nodeName
        };
    };

    const dragWillStart = (node: ICanvasNode) => {
        if (node.data) {
            node.data.nodeProperties.dragging = true;
        }
    };

    const nodeDidAdd = (node: ICanvasNode) => {
        // show the side panel when adding a new node
        propsAPI.selectNodeById(node.id);
    };

    const generateAccordionTitle = (node: ITreeNode) => {
        const nodeTypeStringKey = node.searchKeys[0] as string;
        return (
            <Stack horizontal verticalAlign="center" tokens={{ childrenGap: "s1" }} style={{ cursor: "pointer" }}>
                <FontIcon iconName={node.expanded ? "ChevronDownMed" : "ChevronRightMed"} />
                <Text variant="medium">
                    {Localizer.l(nodeTypeStringKey)} ({node.children.length})
                </Text>
            </Stack>
        );
    };

    if (treeData.length === 0) {
        const treeNodes: ITreeNode[] = Definitions.getItemPanelNodes().map((category, index) => {
            const children = category.children.map((node) => {
                const initialNode = node.extra as ICanvasNode;
                const description = Localizer.getLocalizedStrings(initialNode.data!.nodeProperties.name).description;
                const styles = NodeHelpers.getNodeAppearance({
                    nodeProperties: initialNode.data!.nodeProperties,
                    nodeType: initialNode.data!.nodeType
                } as CanvasNodeData);
                const internalName = initialNode.data!.nodeProperties.name as string;
                const localizedName = node.title as string;
                const internalNode = {
                    ...initialNode,
                    data: {
                        ...initialNode.data,
                        ...styles
                    }
                };
                return {
                    title: (
                        <Item key={internalName} model={internalNode} dragWillStart={dragWillStart} nodeWillAdd={nodeWillAdd} nodeDidAdd={nodeDidAdd}>
                            <NodeContainer
                                heading={localizedName}
                                iconName={styles.iconName!}
                                accentColor={styles.color!}
                                title={description}
                                background="var(--vscode-editorWidget-background)"
                                isDraggable
                                hideShadow
                            >
                                <Text
                                    variant="small"
                                    style={{
                                        overflow: "hidden",
                                        display: "-webkit-box",
                                        // these properties aren't recognized
                                        ["-webkit-line-clamp" as any]: "2",
                                        ["-webkit-box-orient" as any]: "vertical"
                                    }}
                                >
                                    {description}
                                </Text>
                            </NodeContainer>
                        </Item>
                    ),
                    id: uuid(),
                    searchKeys: [localizedName],
                    children: []
                };
            });
            // collapse all except first by default
            category.expanded = index === 0;
            category.title = generateAccordionTitle(category);
            return {
                ...category,
                children
            };
        });
        setTreeData(treeNodes);
    }

    const onChange = (nextData: ITreeNode[]) => {
        nextData.forEach((category) => {
            category.title = generateAccordionTitle(category);
        });
        setTreeData(nextData);
    };

    const treeViewStyles: IAccessibleTreeStyles = {
        root: {
            padding: 0,
            margin: 0
        },
        group: {
            paddingTop: 5,
            paddingLeft: 0
        },
        item: {
            listStyle: "none",
            padding: "5px 0"
        }
    };

    return (
        <>
            <h2>{Localizer.l("sidebarTopologyComponentTitle")}</h2>
            <p>{Localizer.l("sidebarTopologyComponentText")}</p>
            <ReactAccessibleTree treeData={treeData} onChange={onChange} styles={treeViewStyles} />
        </>
    );
};
