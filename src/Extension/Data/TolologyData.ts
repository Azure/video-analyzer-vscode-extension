import { PipelineTopology } from "../../Common/Types/LVASDKTypes";
import { ModuleDetails } from "../ModuleExplorerPanel/ModuleItem";
import { IotHubData } from "./IotHubData";

export class TopologyData {
    public static async getTopologies(iotHubData: IotHubData, moduleDetails: ModuleDetails): Promise<PipelineTopology[]> {
        try {
            const response = await iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphTopologyList" : "pipelineTopologyList");
            return response?.value;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static putTopology(iotHubData: IotHubData, moduleDetails: ModuleDetails, graphData: PipelineTopology): Promise<PipelineTopology[]> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphTopologySet" : "pipelineTopologySet", graphData);
    }

    public static deleteTopology(iotHubData: IotHubData, moduleDetails: ModuleDetails, graphName: string): Promise<void> {
        return iotHubData.directMethodCall(moduleDetails, moduleDetails.legacyModule ? "GraphTopologyDelete" : "pipelineTopologyDelete", {
            name: graphName
        });
    }
}
