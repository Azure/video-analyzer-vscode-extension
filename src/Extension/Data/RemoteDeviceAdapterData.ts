import {
    PipelineTopology,
    RemoteDeviceAdapter
} from "../../Common/Types/VideoAnalyzerSDKTypes";
import { ModuleDetails } from "../ModuleExplorerPanel/ModuleItem";
import { IotHubData } from "./IotHubData";

export class RemoteDeviceAdapterData {
    public static async getRemoteDeviceAdapters(iotHubData: IotHubData, moduleDetails: ModuleDetails): Promise<RemoteDeviceAdapter[]> {
        try {
            const response = await iotHubData.directMethodCall(moduleDetails, "remoteDeviceAdapterList");
            return response?.value;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static putRemoteDeviceAdapter(iotHubData: IotHubData, moduleDetails: ModuleDetails, remoteAdapter: RemoteDeviceAdapter): Promise<RemoteDeviceAdapter[]> {
        return iotHubData.directMethodCall(moduleDetails, "remoteDeviceAdapterSet", remoteAdapter);
    }

    public static deleteRemoteDeviceAdapter(iotHubData: IotHubData, moduleDetails: ModuleDetails, remoteAdapterName: string): Promise<void> {
        return iotHubData.directMethodCall(moduleDetails, "remoteDeviceAdapterDelete", {
            name: remoteAdapterName
        });
    }
}
