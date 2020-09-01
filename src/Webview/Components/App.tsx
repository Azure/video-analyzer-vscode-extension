import "./App.css";
import { ITheme, Spinner, SpinnerSize } from "office-ui-fabric-react";
import { ThemeProvider } from "office-ui-fabric-react/lib/Foundation";
import React, { useEffect } from "react";
import Graph from "../Models/GraphData";
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

    const [graph, setGraph] = React.useState<Graph>(new Graph());
    const observer = ThemeHelpers.attachHtmlStyleAttrListener(() => {
        setTheme(ThemeHelpers.getAdaptedTheme());
    });

    const { pageViewType, graphData, zoomPanSettings = { transformMatrix: [1, 0, 0, 1, 0, 0] }, instance = { name: "" } } = props.state;

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
        }
    } else {
        PostMessage.sendMessageToParent(
            { name: Constants.PostMessageNames.getInitialData },
            {
                name: Constants.PostMessageNames.setInitialData,
                callback: (initialData) => {
                    console.log(initialData);
                    const { graphData, pageType } = initialData;
                    if (graphData) {
                        graph.setTopology(graphData);
                    }

                    if (pageType) {
                        setPageType(pageType);
                    }
                },
                onlyOnce: true
            }
        );
    }

    const getPageType = (currentPageType: Constants.PageType) => {
        switch (currentPageType) {
            case Constants.PageType.graphPage:
                return <GraphTopology graph={graph} zoomPanSettings={zoomPanSettings} vsCodeSetState={props.vsCodeSetState} />;
            case Constants.PageType.instancePage:
                return <GraphInstance graph={graph} zoomPanSettings={zoomPanSettings} instance={instance} vsCodeSetState={props.vsCodeSetState} />;
            default:
                return <Spinner size={SpinnerSize.xSmall} />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <React.Suspense fallback={<></>}>{getPageType(pageType)}</React.Suspense>
        </ThemeProvider>
    );
};

export default App;
