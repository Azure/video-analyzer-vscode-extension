import "./App.css";
import React, { useEffect } from "react";
import { ITheme, Spinner, SpinnerSize } from "@fluentui/react";
import { ThemeProvider } from "@fluentui/react/lib/Foundation";
import { useBoolean } from "@uifabric/react-hooks";
import { GraphData } from "../Models/GraphData";
import { VSCodeState } from "../Types/VSCodeDelegationTypes";
import * as Constants from "../Utils/Constants";
import { ExtensionInteraction } from "../Utils/ExtensionInteraction";
import IconSetupHelpers from "../Utils/IconSetupHelpers";
import PostMessage from "../Utils/PostMessage";
import ThemeHelpers from "../Utils/ThemeHelpers";

const GraphInstance = React.lazy(() => import("./GraphInstance"));
const GraphTopology = React.lazy(() => import("./GraphTopology"));
IconSetupHelpers.initializeIcons();

interface IProps {
    state: VSCodeState;
    vsCodeSetState: (state: any) => void;
}

export const App: React.FunctionComponent<IProps> = (props) => {
    const [theme, setTheme] = React.useState<ITheme>(ThemeHelpers.getAdaptedTheme());
    const [pageType, setPageType] = React.useState<Constants.PageType>(Constants.PageType.spinner);

    const [graph, setGraph] = React.useState<GraphData>(new GraphData());
    const [graphInstance] = React.useState<any>({ instance: null });
    const observer = ThemeHelpers.attachHtmlStyleAttrListener(() => {
        setTheme(ThemeHelpers.getAdaptedTheme());
    });
    const { pageViewType, graphData, zoomPanSettings = { transformMatrix: [1, 0, 0, 1, 0, 0] }, instance } = props.state;

    const [isEditMode, { setTrue: setEditModeTrue }] = useBoolean(props.state.editMode);
    const [isGraphHorizontal, { setTrue: setHorizontalTrue, setFalse: setHorizontalFalse }] = useBoolean(props.state.isHorizontal ?? true);

    // when unmounting, disconnect the observer to prevent leaked references
    useEffect(() => {
        return () => {
            observer.disconnect();
        };
    });

    if (pageViewType || graphData) {
        if (pageType !== pageViewType) {
            setPageType(pageViewType);
        }
        if (graphData) {
            graph.setGraphData(graphData);
            if (instance) {
                graphInstance.instance = instance;
            }
        }
    } else {
        PostMessage.sendMessageToParent(
            { name: Constants.PostMessageNames.getInitialData },
            {
                name: Constants.PostMessageNames.setInitialData,
                callback: (initialData) => {
                    const { graphData, pageType, graphInstanceData, editMode, isHorizontal } = initialData;
                    if (editMode) {
                        setEditModeTrue();
                    }
                    if (isHorizontal !== isGraphHorizontal) {
                        if (isHorizontal) {
                            setHorizontalTrue();
                        } else {
                            setHorizontalFalse();
                        }
                    }
                    if (graphData) {
                        graph.setTopology(graphData, isHorizontal);
                    }

                    if (graphInstanceData) {
                        graphInstance.instance = graphInstanceData;
                    }

                    if (pageType) {
                        setPageType(pageType);
                    }
                },
                onlyOnce: true
            }
        );
    }
    return (
        <ThemeProvider theme={theme}>
            <React.Suspense fallback={<></>}>
                {pageType === Constants.PageType.graphPage && (
                    <GraphTopology
                        graph={graph}
                        zoomPanSettings={zoomPanSettings}
                        isHorizontal={isGraphHorizontal}
                        vsCodeSetState={props.vsCodeSetState}
                        isEditMode={isEditMode}
                    />
                )}
                {pageType === Constants.PageType.instancePage && (
                    <GraphInstance
                        graph={graph}
                        zoomPanSettings={zoomPanSettings}
                        isHorizontal={isGraphHorizontal}
                        instance={graphInstance.instance}
                        vsCodeSetState={props.vsCodeSetState}
                        isEditMode={isEditMode}
                    />
                )}
                {pageType === Constants.PageType.spinner && <Spinner size={SpinnerSize.xSmall} />}
            </React.Suspense>
        </ThemeProvider>
    );
};

export default App;
