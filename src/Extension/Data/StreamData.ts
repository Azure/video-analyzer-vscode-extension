import { MediaGraphInstance } from "../../Common/Types/LVASDKTypes";
import { ModuleDetails } from "../ModuleExplorerPanel/ModuleItem";
import { IotHubData } from "./IotHubData";

export class StreamData {
    public static async getStream(iotHubData: IotHubData, moduleDetails: ModuleDetails): Promise<MediaGraphInstance[]> {
        try {
            const response = await iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphInstanceList" : "streamList");
            return response?.value;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static putStream(iotHubData: IotHubData, moduleDetails: ModuleDetails, instanceData: MediaGraphInstance): Promise<MediaGraphInstance[]> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphInstanceSet" : "streamSet", instanceData);
    }

    public static startStream(iotHubData: IotHubData, moduleDetails: ModuleDetails, instanceName: string): Promise<void> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphInstanceActivate" : "streamStart", {
            name: instanceName
        });
    }

    public static stopStream(iotHubData: IotHubData, moduleDetails: ModuleDetails, instanceName: string): Promise<void> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphInstanceDeactivate" : "streamStop", {
            name: instanceName
        });
    }

    public static deleteStream(iotHubData: IotHubData, moduleDetails: ModuleDetails, instanceName: string): Promise<void> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphInstanceDelete" : "streamDelete", {
            name: instanceName
        });
    }
}
