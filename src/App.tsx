import "./App.css";
import { ITheme } from "office-ui-fabric-react";
import { ThemeProvider } from "office-ui-fabric-react/lib/Foundation";
import React, { useEffect } from "react";
import { IZoomPanSettings } from "@vienna/react-dag-editor";
import { sampleTopology } from "./dev/sampleTopologies.js";
import { GraphInstance } from "./editor/components/GraphInstance";
import { GraphTopology } from "./editor/components/GraphTopology";
import Graph from "./graph/Graph";
import IconSetupHelpers from "./helpers/IconSetupHelpers";
import ThemeHelpers from "./helpers/ThemeHelpers";
import { GraphInfo } from "./types/graphTypes";

IconSetupHelpers.initializeIcons();

interface IProps {
    graphData?: GraphInfo;
    zoomPanSettings?: IZoomPanSettings;
    vsCodeSetState: (state: any) => void;
}

export const App: React.FunctionComponent<IProps> = (props) => {
    const [theme, setTheme] = React.useState<ITheme>(ThemeHelpers.getAdaptedTheme());
    const observer = ThemeHelpers.attachHtmlStyleAttrListener(() => {
        setTheme(ThemeHelpers.getAdaptedTheme());
    });

    // when unmounting, disconnect the observer to prevent leaked references
    useEffect(() => {
        return () => {
            observer.disconnect();
        };
    });

    const editingTopology = true;

    const graph = new Graph();

    if (props.graphData) {
        graph.setGraphData(props.graphData);
        graph.setName(props.graphData.meta.name);
        if (props.graphData.meta.properties && props.graphData.meta.properties.description) {
            graph.setDescription(props.graphData.meta.properties.description);
        }
    } else {
        graph.setTopology(sampleTopology);
    }

    // if there is no state to recover from (in props.graphData or zoomPanSettings), use default
    // (load sampleTopology) and 1x zoom, no translate (stored in a transformation matrix)
    // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
    return (
        <ThemeProvider theme={theme}>
            {editingTopology ? (
                <GraphTopology graph={graph} zoomPanSettings={props.zoomPanSettings || { transformMatrix: [1, 0, 0, 1, 0, 0] }} vsCodeSetState={props.vsCodeSetState} />
            ) : (
                <GraphInstance graph={graph} zoomPanSettings={props.zoomPanSettings || { transformMatrix: [1, 0, 0, 1, 0, 0] }} vsCodeSetState={props.vsCodeSetState} />
            )}
        </ThemeProvider>
    );
};

export default App;
