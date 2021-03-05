import { MediaGraphTopology } from "../../Common/Types/LVASDKTypes";
import { ModuleDetails } from "../ModuleExplorerPanel/ModuleItem";
import { IotHubData } from "./IotHubData";

export class TopologyData {
    public static async getTopologies(iotHubData: IotHubData, moduleDetails: ModuleDetails): Promise<MediaGraphTopology[]> {
        try {
            const response = await iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphTopologyList" : "topologyList");
            return response?.value;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static putTopology(iotHubData: IotHubData, moduleDetails: ModuleDetails, graphData: MediaGraphTopology): Promise<MediaGraphTopology[]> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphTopologySet" : "topologySet", graphData);
    }

    public static deleteTopology(iotHubData: IotHubData, moduleDetails: ModuleDetails, graphName: string): Promise<void> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphTopologyDelete" : "topologyDelete", {
            name: graphName
        });
    }
}
