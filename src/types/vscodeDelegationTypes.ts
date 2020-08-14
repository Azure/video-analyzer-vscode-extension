import { IZoomPanSettings } from "@vienna/react-dag-editor";
import { MediaGraphInstance } from "../lva-sdk/lvaSDKtypes";
import { PageType } from "../utils/Constants";
import { GraphInfo, GraphInstanceParameter } from "./graphTypes";

export type VSCodeSetState = (state: VSCodeState) => void;

export interface VSCodeDelegate {
    setState: VSCodeSetState;
}

export interface VSCodeState {
    pageViewType: PageType;
    graphData?: GraphInfo;
    zoomPanSettings?: IZoomPanSettings;
    instance?: MediaGraphInstance;
}

export interface InitializationParameters {
    state: VSCodeState;
    vsCodeSetState: VSCodeSetState;
}
