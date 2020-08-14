import { MediaGraphTopology } from "../lva-sdk/lvaSDKtypes";
import { Constants } from "../Util/Constants";
import { IotHubData } from "./IotHubData";

export class GraphTopologyData {
    public static async getGraphTopologies(iotHubData: IotHubData, deviceId: string, moduleId: string): Promise<MediaGraphTopology[]> {
        const response = await iotHubData.directMethodCall(deviceId, moduleId, "GraphTopologyList");
        return response?.value;
    }

    public static putGraphTopology(iotHubData: IotHubData, deviceId: string, moduleId: string, graphData: MediaGraphTopology): Promise<MediaGraphTopology[]> {
        return iotHubData.directMethodCall(deviceId, moduleId, "GraphTopologySet", graphData);
    }

    public static deleteGraphTopology(iotHubData: IotHubData, deviceId: string, moduleId: string, graphName: string): Promise<void> {
        return iotHubData.directMethodCall(deviceId, moduleId, "GraphTopologyDelete", {
            name: graphName
        });
    }
}
