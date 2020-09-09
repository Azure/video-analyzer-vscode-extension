import {
    FontIcon,
    FontWeights,
    mergeStyleSets,
    Stack,
    Text
} from "office-ui-fabric-react";
import * as React from "react";
import { usePropsAPI } from "@vienna/react-dag-editor";

interface INodeContainerProps {
    heading: string;
    title?: string;
    iconName: string;
    accentColor: string;
    children?: React.ReactElement[] | React.ReactElement | string;
    selected?: boolean;
    dragging?: boolean;
    hovered?: boolean;
    background?: string;
    isDraggable: boolean;
    hideShadow?: boolean;
    setNodeRef?: (nodeRef: React.RefObject<HTMLDivElement>) => void;
    nodeRef?: React.RefObject<HTMLDivElement>;
}

export const NodeContainer: React.FunctionComponent<INodeContainerProps> = (props) => {
    const {
        iconName,
        accentColor,
        heading,
        title,
        children = [],
        selected = false,
        dragging = false,
        hovered = false,
        isDraggable,
        hideShadow = false,
        setNodeRef,
        nodeRef
    } = props;
    //let {nodeRef } = props;
    const propsAPI = usePropsAPI();
    // const nodeRef = React.useRef<HTMLDivElement>(null);
    // if (setNodeRef) {
    //     setNodeRef(nodeRef);
    // }
    const transformMatrix = propsAPI.getZoomPanSettings().transformMatrix;
    const transform = dragging ? `matrix(${transformMatrix.join(",")})` : "none";

    const background = props.background || "var(--vscode-editor-background)";
    const selectionOutline = selected ? `, 0 0 0 1px  ${accentColor}` : "";
    const dropShadow = hovered || selected ? `0px 4px 12px rgba(var(--node-shadow-color), 0.25)` : `0px 4px 6px rgba(var(--node-shadow-color), 0.1)`;

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
            paddingLeft: 4
        },
        children: {
            paddingTop: 4
        }
    });

    return (
        <div ref={nodeRef}>
            <Stack horizontal className={styles.card}>
                <Stack.Item className={styles.accentBar}>
                    <FontIcon iconName={iconName} className={styles.icon} />
                </Stack.Item>
                <Stack title={title} className={styles.content} tokens={{ childrenGap: "s2" }}>
                    <Text variant="medium" className={styles.headingText}>
                        {heading}
                    </Text>
                    <Stack.Item className={styles.children}>{children}</Stack.Item>
                </Stack>
            </Stack>
        </div>
    );
};
