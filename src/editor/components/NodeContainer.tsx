import * as React from "react";
import { Stack, FontIcon, Text } from "office-ui-fabric-react";

interface INodeContainerProps {
  heading: string;
  title?: string;
  iconName: string;
  children?: React.ReactElement[] | React.ReactElement | string;
  selected?: boolean;
  hovered?: boolean;
}

export const NodeContainer: React.FunctionComponent<INodeContainerProps> = (
  props
) => {
  const {
    iconName,
    heading,
    title,
    children = [],
    selected = false,
    hovered = false,
  } = props;

  const cardStyle = {
    userSelect: "none" as const,
    boxSizing: "border-box" as const,
    cursor: "default",
    transition: "all 0.2s ease-in-out",
    background: selected
      ? "var(--vscode-editor-selectionBackground)"
      : "var(--vscode-button-foreground)",
    border: "1px solid var(--vscode-foreground)",
    boxShadow:
      hovered || selected
        ? "0px 4px 4px rgba(0, 0, 0, 0.25)"
        : "0px 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: 2,
    padding: 4,
    paddingBottom: 8,
    minHeight: 50,
  };

  const iconStyle = {
    padding: 4,
    paddingRight: 0,
  };

  return (
    <>
      <Stack horizontal style={cardStyle} tokens={{ childrenGap: "s1" }}>
        <FontIcon iconName={iconName} style={iconStyle} />
        <Stack title={title} tokens={{ childrenGap: "s2" }}>
          <Text variant="medium">{heading}</Text>
          <div>{children}</div>
        </Stack>
      </Stack>
    </>
  );
};