import { IZoomPanSettings } from "@vienna/react-dag-editor";
import { GraphInfo, GraphInstanceParameter } from "./graphTypes";

export type VSCodeSetState = (state: VSCodeState) => void;

export interface VSCodeDelegate {
    setState: VSCodeSetState;
}

export interface VSCodeState {
    graphData?: GraphInfo;
    zoomPanSettings?: IZoomPanSettings;
    parameters?: GraphInstanceParameter[];
}

export interface InitializationParameters {
    state: VSCodeState;
    vsCodeSetState: VSCodeSetState;
}
