import { LivePipeline } from "../../Common/Types/LVASDKTypes";
import { ModuleDetails } from "../ModuleExplorerPanel/ModuleItem";
import { IotHubData } from "./IotHubData";

export class LivePipelineData {
    public static async getLivePipeline(iotHubData: IotHubData, moduleDetails: ModuleDetails): Promise<LivePipeline[]> {
        try {
            const response = await iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphInstanceList" : "livePipelineList");
            return response?.value;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static putLivePipeline(iotHubData: IotHubData, moduleDetails: ModuleDetails, instanceData: LivePipeline): Promise<LivePipeline[]> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphInstanceSet" : "livePipelineSet", instanceData);
    }

    public static startLivePipeline(iotHubData: IotHubData, moduleDetails: ModuleDetails, instanceName: string): Promise<void> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphInstanceActivate" : "livePipelineActivate", {
            name: instanceName
        });
    }

    public static stopLivePipeline(iotHubData: IotHubData, moduleDetails: ModuleDetails, instanceName: string): Promise<void> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphInstanceDeactivate" : "livePipelineDeactivate", {
            name: instanceName
        });
    }

    public static deleteLivePipeline(iotHubData: IotHubData, moduleDetails: ModuleDetails, instanceName: string): Promise<void> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphInstanceDelete" : "livePipelineDelete", {
            name: instanceName
        });
    }
}
