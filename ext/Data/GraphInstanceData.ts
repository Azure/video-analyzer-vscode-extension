import { MediaGraphInstance, MediaGraphTopology } from "../lva-sdk/lvaSDKtypes";
import { Constants } from "../Util/Constants";
import { IotHubData } from "./IotHubData";

export class GraphInstanceData {
    public static async getGraphInstances(iotHubData: IotHubData, deviceId: string, moduleId: string): Promise<MediaGraphInstance[]> {
        const response = await iotHubData.directMethodCall(deviceId, moduleId, "GraphInstanceList", {
            "@apiVersion": Constants.ApiVersion.version1
        });
        return response?.value;
    }
}
