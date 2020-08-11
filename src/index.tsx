import "./bootstrap.js";
import "./scripts/formatString";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { initializeEnvironment } from "./extension/extensionInteraction";
import { InitializationParameters } from "./types/vscodeDelegationTypes";

initializeEnvironment((window as any).language).then((params: InitializationParameters) => {
    // if we are running in VS Code and have stored state, we can recover it from state
    // vsCodeSetState will allow for setting that state
    // saving and restoring state happens when the webview loses and regains focus
    const { state, vsCodeSetState } = params;

    ReactDOM.render(
        <React.StrictMode>
            <App graphData={state.graphData} zoomPanSettings={state.zoomPanSettings} vsCodeSetState={vsCodeSetState} />
        </React.StrictMode>,
        document.getElementById("root")
    );
});
