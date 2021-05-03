import { IZoomPanSettings } from "@vienna/react-dag-editor";
import { LivePipeline } from "../../Common/Types/LVASDKTypes";
import { PageType } from "../Utils/Constants";
import { GraphInfo } from "./GraphTypes";

export type VSCodeSetState = (state: VSCodeState) => void;

export interface VSCodeDelegate {
    setState: VSCodeSetState;
}

export interface VSCodeState {
    pageViewType: PageType;
    editMode: boolean;
    isHorizontal: boolean;
    graphData?: GraphInfo;
    zoomPanSettings?: IZoomPanSettings;
    instance?: LivePipeline;
}

export interface InitializationParameters {
    state: VSCodeState;
    vsCodeSetState: VSCodeSetState;
}
