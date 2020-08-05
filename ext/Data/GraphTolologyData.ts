import { MediaGraphInstance, MediaGraphTopology } from "../lva-sdk/lvaSDKtypes";
import { Constants } from "../Util/Constants";
import { IotHubData } from "./IotHubData";

export class GraphTopologyData {
    public static async getGraphTopologies(iotHubData: IotHubData, deviceId: string, moduleId: string): Promise<MediaGraphTopology[]> {
        const response = await iotHubData.directMethodCall(deviceId, moduleId, "GraphTopologyList", {
            "@apiVersion": Constants.ApiVersion.version1
        });
        return response?.value;
    }
}
