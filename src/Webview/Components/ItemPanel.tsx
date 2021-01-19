import "./ItemPanel.css";
import * as React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionItemButton,
    AccordionItemHeading,
    AccordionItemPanel
} from "react-accessible-accordion";
import { v4 as uuid } from "uuid";
import { Text } from "@fluentui/react";
import { ICanvasNode, Item, usePropsAPI } from "@vienna/react-dag-editor";
import Definitions from "../Definitions/Definitions";
import Localizer from "../Localization/Localizer";
import { CanvasNodeData } from "../Types/GraphTypes";
import NodeHelpers from "../Utils/NodeHelpers";
import AppContext from "./AppContext";
import { NodeContainer } from "./NodeContainer";

export const ItemPanel: React.FunctionComponent = (props) => {
    const appContext = React.useContext(AppContext);
    const propsAPI = usePropsAPI();

    const hasNodeWithName = (name: string) => {
        const nodes = propsAPI.getData().nodes;
        for (const [, node] of nodes) {
            if (node.name === name) {
                return true;
            }
        }
        return false;
    };

    const nodeWillAdd = (node: ICanvasNode<any>): ICanvasNode => {
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
            name: nodeName,
            ...(node.data && { ports: NodeHelpers.getPorts(node.data as any, appContext.isHorizontal) })
        };
    };

    const dragWillStart = (node: ICanvasNode<any>) => {
        if (node.data) {
            node.data.nodeProperties.dragging = true;
        }
    };

    const nodeDidAdd = (node: ICanvasNode) => {
        // show the side panel when adding a new node
        propsAPI.openSidePanel("node", node);
    };

    const generateAccordionTitle = (node: any) => {
        const nodeTypeStringKey = node.searchKeys[0] as string;
        return (
            <Text variant="medium" style={{ marginLeft: 10, fontWeight: 600 }}>
                {Localizer.l(nodeTypeStringKey)} ({node.children.length})
            </Text>
        );
    };

    return (
        <>
            <h2>{Localizer.l("sidebarTopologyComponentTitle")}</h2>
            <p>{Localizer.l("sidebarTopologyComponentText")}</p>
            <Accordion allowZeroExpanded preExpanded={[Definitions.getItemPanelNodes()[0].id]}>
                {Definitions.getItemPanelNodes().map((category, index) => {
                    const children = category.children.map((node) => {
                        const initialNode = node.extra as ICanvasNode<any>;
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
                        return (
                            <Item
                                key={internalName}
                                model={internalNode}
                                dragWillStart={dragWillStart}
                                nodeWillAdd={nodeWillAdd}
                                nodeDidAdd={nodeDidAdd}
                                style={{ margin: "5px 0" }}
                            >
                                <NodeContainer
                                    nodeType={localizedName}
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
                                            ["WebkitLineClamp" as any]: "2",
                                            ["WebkitBoxOrient" as any]: "vertical"
                                        }}
                                    >
                                        {description}
                                    </Text>
                                </NodeContainer>
                            </Item>
                        );
                    });

                    return (
                        <AccordionItem style={{ padding: "5px 0" }} uuid={category.id} key={category.id}>
                            <AccordionItemHeading>
                                <AccordionItemButton>{generateAccordionTitle(category)}</AccordionItemButton>
                            </AccordionItemHeading>
                            <AccordionItemPanel>{children}</AccordionItemPanel>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </>
    );
};
