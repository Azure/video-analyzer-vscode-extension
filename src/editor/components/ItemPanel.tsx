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
import { NodeContainer } from "./NodeContainer";

interface IProps {
    hasNodeWithName: (name: string) => boolean;
}

export const ItemPanel: React.FunctionComponent<IProps> = (props) => {
    const [treeData, setTreeData] = React.useState<ITreeNode[]>([]);
    const propsAPI = usePropsAPI();

    const nodeWillAdd = (node: ICanvasNode): ICanvasNode => {
        // make sure this name hasn't already been used, append number if it has
        let nodeName = node.name || "";
        let duplicateCounter = 1;
        while (props.hasNodeWithName(nodeName)) {
            nodeName = (node.name || "node") + duplicateCounter;
            duplicateCounter++;
        }
        if (node.data) {
            node.data.nodeProperties.name = nodeName;
        }
        return {
            ...node,
            id: uuid(),
            name: nodeName
        };
    };

    const nodeDidAdd = (node: ICanvasNode) => {
        // show the side panel when adding a new node
        propsAPI.selectNodeById(node.id);
    };

    const generateAccordionTitle = (node: ITreeNode) => {
        const nodeTypeStringKey = node.searchKeys[0] as string;
        const styles = NodeHelpers.getNodeAppearance(NodeHelpers.getNodeTypeFromString(nodeTypeStringKey));
        return (
            <Stack horizontal verticalAlign="center" tokens={{ childrenGap: "s1" }} style={{ cursor: "pointer" }}>
                <FontIcon iconName={node.expanded ? "CaretSolidDown" : "CaretSolidRight"} />
                <FontIcon iconName={styles.iconName} />
                <Text variant="medium">
                    {Localizer.l(nodeTypeStringKey)} ({node.children.length})
                </Text>
            </Stack>
        );
    };

    if (treeData.length === 0) {
        const treeNodes: ITreeNode[] = Definitions.getItemPanelNodes().map((category, index) => {
            const children = category.children.map((node) => {
                const internalNode = node.extra as ICanvasNode;
                const description = Localizer.l(internalNode.data!.nodeProperties.name);
                const styles = NodeHelpers.getNodeAppearance(internalNode.data!.nodeType);
                return {
                    title: (
                        <Item key={node.title as string} model={internalNode} nodeWillAdd={nodeWillAdd} nodeDidAdd={nodeDidAdd}>
                            <NodeContainer heading={node.title as string} iconName={styles.iconName!} title={description} background="var(--vscode-editor-background)">
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
                    searchKeys: [node.title as string],
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
