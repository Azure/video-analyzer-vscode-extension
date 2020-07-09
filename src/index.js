import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { initThenRun } from "./extensionInteraction.js";

initThenRun((state, vsCodeSetState) => {
  ReactDOM.render(
    <React.StrictMode>
      <App
        graphData={state.data}
        zoomPanSettings={state.zoomPanSettings}
        vsCodeSetState={vsCodeSetState}
      />
    </React.StrictMode>,
    document.getElementById("root")
  );
});
