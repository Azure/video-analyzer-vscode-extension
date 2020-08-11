import "./App.css";
import { ITheme } from "office-ui-fabric-react";
import { ThemeProvider } from "office-ui-fabric-react/lib/Foundation";
import React, { useEffect } from "react";
import { GraphInstance } from "./editor/components/GraphInstance";
import { GraphTopology } from "./editor/components/GraphTopology";
import Graph from "./graph/Graph";
import IconSetupHelpers from "./helpers/IconSetupHelpers";
import ThemeHelpers from "./helpers/ThemeHelpers";
import { VSCodeState } from "./types/vscodeDelegationTypes";

IconSetupHelpers.initializeIcons();

interface IProps {
    state: VSCodeState;
    vsCodeSetState: (state: any) => void;
}

export const App: React.FunctionComponent<IProps> = (props) => {
    const [theme, setTheme] = React.useState<ITheme>(ThemeHelpers.getAdaptedTheme());
    const observer = ThemeHelpers.attachHtmlStyleAttrListener(() => {
        setTheme(ThemeHelpers.getAdaptedTheme());
    });
    const { graphData, zoomPanSettings = { transformMatrix: [1, 0, 0, 1, 0, 0] }, parameters = [] } = props.state;

    // when unmounting, disconnect the observer to prevent leaked references
    useEffect(() => {
        return () => {
            observer.disconnect();
        };
    });

    const editingTopology = true;

    const graph = new Graph();

    const restoredGraphData = props.state.graphData;
    if (restoredGraphData) {
        graph.setGraphData(restoredGraphData);
        graph.setName(restoredGraphData.meta.name);
        if (restoredGraphData.meta.properties && restoredGraphData.meta.properties.description) {
            graph.setDescription(restoredGraphData.meta.properties.description);
        }
    }

    // if there is no state to recover from (in graphData or zoomPanSettings), use default
    // (load sampleTopology) and 1x zoom, no translate (stored in a transformation matrix)
    // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
    return (
        <ThemeProvider theme={theme}>
            {editingTopology ? (
                <GraphTopology graph={graph} zoomPanSettings={zoomPanSettings} vsCodeSetState={props.vsCodeSetState} />
            ) : (
                <GraphInstance graph={graph} zoomPanSettings={zoomPanSettings} parameters={parameters} vsCodeSetState={props.vsCodeSetState} />
            )}
        </ThemeProvider>
    );
};

export default App;
