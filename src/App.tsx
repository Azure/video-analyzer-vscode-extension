import React from "react";
import "./App.css";
import { Graph } from "./components/Graph";
import { getTopologyData } from "./data/getTopologyData";
import { initializeIcons } from "@uifabric/icons";
import { loadTheme } from "office-ui-fabric-react";
import { GraphInfo } from "./data/graphTypes";
import { IZoomPanSettings } from "@vienna/react-dag-editor";

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
  return (
    <Graph
      initData={props.graphData || getTopologyData()}
      initZoomPanSettings={
        props.zoomPanSettings || { transformMatrix: [1, 0, 0, 1, 0, 0] }
      }
      vsCodeSetState={props.vsCodeSetState}
    />
  );
};

export default App;
