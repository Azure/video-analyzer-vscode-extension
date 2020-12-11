export enum PostMessageNames {
    closeWindow = "closeWindow",
    saveGraph = "saveGraph",
    saveInstance = "saveInstance",
    saveAndActivate = "saveAndActivate",
    getInitialData = "getInitialData",
    setInitialData = "setInitialData",
    nameAvailableCheck = "nameAvailableCheck",
    failedOperationReason = "failedOperationReason"
}

export enum PageType {
    graphPage = "graphPage",
    instancePage = "instancePage",
    spinner = "spinner"
}

export const graphTheme = {
    primaryColor: "var(--vscode-foreground)",
    defaultColor: "var(--vscode-foreground)",
    borderColor: "var(--vscode-input-border)",
    defaultBorderColor: "var(--vscode-input-border)",
    defaultBackgroundColor: "var(--vscode-editor-background)",
    annotationBgColor: "var(--vscode-peekViewEditor-background)",
    connectedPortColor: "var(--vscode-editor-selectionBackground)",
    nodeActivateFill: "var(--vscode-editor-inactiveSelectionBackground)",
    nodeActivateStroke: "var(--vscode-editor-selectionBackground)",
    nodeFill: "var(--vscode-editorWidget-background)",
    nodeStroke: "var(--vscode-editorWidget-border)",
    contextMenuBackground: "var(--vscode-menu-background)",
    contextMenuBorder: "var(--vscode-menu-separatorBackground)",
    contextMenuHoverBackground: "var(--vscode-menu-selectionBackground)",
    fontColor: "var(--vscode-foreground)",
    canvasBackground: "var(--vscode-editorWidget-background)",
    edgeColor: "var(--vscode-breadcrumb-foreground)",
    edgeColorSelected: "var(--vscode-pickerGroup-foreground)",
    minimapShadow: "var(--vscode-widget-shadow)",
    outlineStyle: "none",
    focusOutlineColor: "var(--vscode-focusBorder)",
    dummyNodeStroke: "var(--vscode-foreground)",
    inputFocusBorderAlt: "var(--vscode-foreground)",
    buttonBorder: "var(--vscode-input-border)",
    buttonForeground: "var(--vscode-button-foreground)",
    buttonBackground: "var(--vscode-button-background)"
};

export const horizontalLayoutOptions = {
    globalLayoutOption: {
        "elk.direction": "RIGHT"
    }
};
