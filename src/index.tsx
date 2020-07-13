import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { initThenRun } from "./extension/extensionInteraction.js";
import { VSCodeSetState, VSCodeState } from "./types/vscodeDelegationTypes";

initThenRun((state: VSCodeState, vsCodeSetState: VSCodeSetState) => {
  ReactDOM.render(
    <React.StrictMode>
      <App
        graphData={state.graphData}
        zoomPanSettings={state.zoomPanSettings}
        vsCodeSetState={vsCodeSetState}
      />
    </React.StrictMode>,
    document.getElementById("root")
  );
});
