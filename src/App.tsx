import "./App.css";
import { loadTheme } from "office-ui-fabric-react";
import React from "react";
import { initializeIcons } from "@uifabric/icons";
import { IZoomPanSettings } from "@vienna/react-dag-editor";
import { sampleTopology } from "./dev/sampleTopologies.js";
import { GraphHost } from "./editor/components/GraphHost";
import { GraphInfo } from "./types/graphTypes";
import Graph from "./graph/Graph";

initializeIcons();
loadTheme({
  palette: {},
});

interface IProps {
  graphData?: GraphInfo;
  zoomPanSettings?: IZoomPanSettings;
  vsCodeSetState: (state: any) => void;
}

export const App: React.FunctionComponent<IProps> = (props) => {
  const graph = new Graph();

  if (props.graphData) {
    graph.setGraphData(props.graphData);
  } else {
    graph.setTopology(sampleTopology);
  }

  // if there is no state to recover from (in props.graphData or zoomPanSettings), use default
  // (load sampleTopology) and 1x zoom, no translate (stored in a transformation matrix)
  // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
  return (
    <GraphHost
      graph={graph}
      zoomPanSettings={
        props.zoomPanSettings || { transformMatrix: [1, 0, 0, 1, 0, 0] }
      }
      vsCodeSetState={props.vsCodeSetState}
    />
  );
};

export default App;
