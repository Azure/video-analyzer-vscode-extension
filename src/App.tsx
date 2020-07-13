import "./App.css";
import { loadTheme } from "office-ui-fabric-react";
import React from "react";
import { initializeIcons } from "@uifabric/icons";
import { IZoomPanSettings } from "@vienna/react-dag-editor";
import { convertTopologyToGraph } from "./converters/convertTopologyToGraph";
import { sampleTopology } from "./dev/sampleTopologies.js";
import { Graph } from "./editor/components/Graph";
import { GraphInfo } from "./types/graphTypes";

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
  // if there is no state to recover from (in props.graphData or zoomPanSettings), use default
  // (load sampleTopology) and 1x zoom, no translate (stored in a transformation matrix)
  // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
  return (
    <Graph
      initData={props.graphData || convertTopologyToGraph(sampleTopology)}
      initZoomPanSettings={
        props.zoomPanSettings || { transformMatrix: [1, 0, 0, 1, 0, 0] }
      }
      vsCodeSetState={props.vsCodeSetState}
    />
  );
};

export default App;
