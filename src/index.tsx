import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { initThenRun } from "./extension/extensionInteraction.js";
import { VSCodeSetState, VSCodeState } from "./types/vscodeDelegationTypes";

initThenRun((state: VSCodeState, vsCodeSetState: VSCodeSetState) => {
  // if we are running in VS Code and have stored state, we can recover it from state
  // vsCodeSetState will allow for setting that state
  // saving and restoring state happens when the webview loses and regains focus
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
