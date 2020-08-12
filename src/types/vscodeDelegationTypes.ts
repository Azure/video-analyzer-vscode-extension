import { IZoomPanSettings } from "@vienna/react-dag-editor";
import { MediaGraphInstance } from "../lva-sdk/lvaSDKtypes";
import { GraphInfo, GraphInstanceParameter } from "./graphTypes";

export type VSCodeSetState = (state: VSCodeState) => void;

export interface VSCodeDelegate {
    setState: VSCodeSetState;
}

export interface VSCodeState {
    graphData?: GraphInfo;
    zoomPanSettings?: IZoomPanSettings;
    instance?: MediaGraphInstance;
}

export interface InitializationParameters {
    state: VSCodeState;
    vsCodeSetState: VSCodeSetState;
}
