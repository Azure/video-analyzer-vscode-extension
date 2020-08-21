import { IZoomPanSettings } from "@vienna/react-dag-editor";
import { PageType } from "../Utils/Constants";
import { GraphInfo } from "./GraphTypes";
import { MediaGraphInstance } from "./LVASDKTypes";

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
