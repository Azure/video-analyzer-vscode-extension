import React, { useContext } from "react";
import {
    ActionButton,
    CommandBarButton,
    DefaultButton,
    FontWeights,
    IconButton,
    mergeStyles,
    Stack,
    Text
} from "@fluentui/react";
import {
    applyDefaultPortsPosition,
    applyHorizontalGraphPortsPosition,
    GraphModel,
    ICanvasData,
    IPropsAPI,
    updatePort
} from "@vienna/react-dag-editor";
import Localizer from "../Localization/Localizer";
import Graph from "../Models/GraphData";
import { VSCodeSetState } from "../Types/VSCodeDelegationTypes";
import * as Constants from "../Utils/Constants";
import { ExtensionInteraction } from "../Utils/ExtensionInteraction";
import NodeHelpers from "../Utils/NodeHelpers";
import PostMessage from "../Utils/PostMessage";
import AppContext from "./AppContext";
import { AdjustedPrimaryButton } from "./ThemeAdjustedComponents/AdjustedPrimaryButton";

export interface IGraphPanelProps {
    name: string;
    cancelAction: () => void;
    primaryAction: () => void;
    secondaryAction?: {
        text: string;
        callback: () => void;
    };
    toggleSidebar: () => void;
    graphPropsApiRef: React.RefObject<IPropsAPI<any, any, any>>;
    isSidebarShown: boolean;
    vsCodeSetState: VSCodeSetState;
}

export const Toolbar: React.FunctionComponent<IGraphPanelProps> = (props) => {
    const { name, cancelAction, primaryAction, secondaryAction, toggleSidebar, isSidebarShown, graphPropsApiRef } = props;
    const { isHorizontal, toggleIsHorizontal } = useContext(AppContext);

    const titleContainer = {
        root: {
            fontWeight: FontWeights.semibold
        }
    };

    const toolbarStyles = {
        root: {
            borderBottom: "1px solid var(--vscode-editorWidget-border)",
            height: 40
        }
    };

    const paddedToolbarStyles = {
        root: mergeStyles(toolbarStyles.root, {
            padding: 10
        })
    };

    const iconButtonStyles = {
        height: "100%",
        width: 40,
        margin: 0,
        color: Constants.graphTheme.buttonBackground
    };

    const autoLayout = () => {
        const data = graphPropsApiRef.current?.getData();
        if (data) {
            graphPropsApiRef.current?.setData(GraphModel.fromJSON(NodeHelpers.autoLayout(data.toJSON(), isHorizontal)));
        }
    };

    const changeLayout = () => {
        const data = graphPropsApiRef.current?.getData();
        if (data) {
            const nodes = data.toJSON().nodes;
            const finalData = {
                ...data.toJSON(),
                nodes: nodes.map((node) => {
                    return {
                        ...node,
                        ports: node.ports ? (!isHorizontal ? applyHorizontalGraphPortsPosition(node.ports) : applyDefaultPortsPosition(node.ports)) : undefined
                    };
                })
            };
            const newLayoutData = NodeHelpers.autoLayout(finalData, !isHorizontal);
            graphPropsApiRef.current?.setData(GraphModel.fromJSON(newLayoutData));
        }
        props.vsCodeSetState({ isHorizontal: !isHorizontal } as any);
        toggleIsHorizontal();
        if (ExtensionInteraction.getVSCode()) {
            PostMessage.sendMessageToParent({ name: Constants.PostMessageNames.setGraphAlignment, data: !isHorizontal });
        }
    };

    return (
        <>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: "s1" }} styles={paddedToolbarStyles}>
                <Text styles={titleContainer}>{name}</Text>
                <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: "s1" }}>
                    <AdjustedPrimaryButton text={Localizer.l("saveButtonText")} onClick={primaryAction} />
                    {secondaryAction && <DefaultButton text={secondaryAction.text} onClick={secondaryAction.callback} />}
                    <DefaultButton text={Localizer.l("cancelButtonText")} onClick={cancelAction} />
                </Stack>
            </Stack>
            <Stack horizontal tokens={{ childrenGap: "s1" }} styles={toolbarStyles}>
                <IconButton
                    iconProps={{ iconName: "Library" }}
                    onClick={toggleSidebar}
                    title={isSidebarShown ? Localizer.l("toolbarHideLeftSidebar") : Localizer.l("toolbarShowLeftSidebar")}
                    style={iconButtonStyles}
                ></IconButton>
                <IconButton iconProps={{ iconName: "TriggerAuto" }} onClick={autoLayout} style={iconButtonStyles} title={Localizer.l("toolbarAutoLayout")}></IconButton>
                <IconButton
                    iconProps={{ iconName: isHorizontal ? "Orientation" : "Orientation2" }}
                    onClick={changeLayout}
                    title={isHorizontal ? Localizer.l("toolbarToVertical") : Localizer.l("toolbarToHorizontal")}
                    style={iconButtonStyles}
                ></IconButton>
                {props.children}
            </Stack>
        </>
    );
};
