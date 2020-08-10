import { IZoomPanSettings } from "@vienna/react-dag-editor";
import { GraphInfo } from "./graphTypes";

export type VSCodeSetState = (state: VSCodeState) => void;

export interface VSCodeDelegate {
    setState: VSCodeSetState;
}

export interface VSCodeState {
    graphData?: GraphInfo;
    zoomPanSettings?: IZoomPanSettings;
}

export interface InitializationParameters {
    state: VSCodeState;
    vsCodeSetState: VSCodeSetState;
}
