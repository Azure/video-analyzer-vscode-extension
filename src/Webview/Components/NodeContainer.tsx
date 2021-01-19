import * as React from "react";
import {
    FontIcon,
    FontWeights,
    mergeStyleSets,
    Stack,
    Text
} from "@fluentui/react";
import {
    GraphNodeState,
    hasState,
    NodeModel,
    useGraphData,
    usePropsAPI
} from "@vienna/react-dag-editor";
import Definitions from "../Definitions/Definitions";
import Localizer from "../Localization/Localizer";
import { StatusIcon } from "./StatusIcon";

interface INodeContainerProps {
    nodeId?: string;
    nodeType?: string;
    nodeName?: string;
    title?: string;
    iconName?: string;
    accentColor?: string;
    children?: React.ReactElement[] | React.ReactElement | string;
    selected?: boolean;
    dragging?: boolean;
    hovered?: boolean;
    background?: string;
    isDraggable: boolean;
    hideShadow?: boolean;
    hasErrors?: boolean;
    nodeRef?: any;
}

export const NodeContainer: React.FunctionComponent<INodeContainerProps> = (props) => {
    const { nodeId, nodeRef, isDraggable, hideShadow = false, children = [] } = props;
    let { iconName, accentColor, nodeType, nodeName, title, selected = false, dragging = false, hovered = false, hasErrors } = props;
    const propsAPI = usePropsAPI();
    const data = useGraphData();
    const transformMatrix = propsAPI.getZoomPanSettings().transformMatrix;
    const transform = dragging ? `matrix(${transformMatrix.join(",")})` : "none";

    const background = props.background || "var(--vscode-editor-background)";
    const selectionOutline = selected ? `, 0 0 0 1px  ${accentColor}` : "";
    const dropShadow = hovered || selected ? `0px 4px 12px rgba(var(--node-shadow-color), 0.1)` : `0px 4px 6px rgba(var(--node-shadow-color), 0.1)`;

    if (nodeId) {
        const currentNode: NodeModel<any> | undefined = data.nodes.find((node) => {
            return node.id === nodeId;
        });
        if (currentNode) {
            iconName = currentNode.data!.iconName;
            accentColor = currentNode.data!.color;
            nodeName = currentNode.name;
            const type = currentNode.data!.nodeProperties["@type"];
            const definition = Definitions.getNodeDefinition(currentNode.data?.nodeProperties?.["@type"]);
            selected = hasState(GraphNodeState.selected)(currentNode.state);
            hovered = hasState(GraphNodeState.activated)(currentNode.state);
            nodeType = Localizer.l("nodeContainerNodeType").format(Localizer.getLocalizedStrings(definition.localizationKey).title);
            dragging = currentNode.data!.nodeProperties.dragging;
            title = Localizer.l(type.split(".").pop());
            hasErrors = currentNode.data!.hasErrors;
        }
    }

    const styles = mergeStyleSets({
        card: {
            userSelect: "none" as const,
            boxSizing: "border-box" as const,
            cursor: isDraggable ? "grab" : "default",
            transition: "all 0.2s ease-in-out",
            background,
            border: "1px solid",
            borderColor: selected ? accentColor : "var(--vscode-editorWidget-border)",
            color: selected ? "var(--vscode-editor-foreground)" : "var(--vscode-editorWidget-foreground)",
            boxShadow: hideShadow ? selectionOutline : `${dropShadow} ${selectionOutline}`,
            borderRadius: 3,
            minHeight: 50,
            transform
        },
        accentBar: {
            borderLeft: `10px solid ${accentColor}`,
            margin: -1,
            borderRadius: 3
        },
        headingText: {
            fontWeight: FontWeights.semibold
        },
        icon: {
            height: 16,
            width: 16,
            lineHeight: "16px",
            padding: 4,
            margin: 6,
            textAlign: "center" as const,
            background: accentColor,
            borderRadius: 4,
            color: "white"
        },
        content: {
            paddingTop: 6,
            paddingRight: 6,
            paddingBottom: 8,
            paddingLeft: 4,
            flexGrow: 1
        },
        children: {
            paddingTop: 4
        },
        statusIcon: {
            userSelect: "none"
        }
    });

    return (
        <div ref={nodeRef}>
            <Stack horizontal className={styles.card}>
                <Stack.Item className={styles.accentBar}>
                    <FontIcon iconName={iconName} className={styles.icon} />
                </Stack.Item>
                <Stack title={title} className={styles.content} tokens={{ childrenGap: "s2" }}>
                    <Stack horizontal>
                        <Stack.Item grow>
                            {nodeName ? (
                                <Stack>
                                    <Text variant="small">{nodeType}</Text>
                                    <Text variant="large" className={styles.headingText}>
                                        {nodeName}
                                    </Text>
                                </Stack>
                            ) : (
                                <Text variant="medium" className={styles.headingText}>
                                    {nodeType}
                                </Text>
                            )}
                        </Stack.Item>
                        <Stack.Item align="end" className={styles.statusIcon}>
                            <StatusIcon hasErrors={hasErrors ?? false} />
                        </Stack.Item>
                    </Stack>
                    <Stack.Item className={styles.children}>{children}</Stack.Item>
                </Stack>
            </Stack>
        </div>
    );
};
