import { MediaGraphInstance } from "../lva-sdk/lvaSDKtypes";
import { Constants } from "../Util/Constants";
import { IotHubData } from "./IotHubData";

export class GraphInstanceData {
    public static async getGraphInstances(iotHubData: IotHubData, deviceId: string, moduleId: string): Promise<MediaGraphInstance[]> {
        const response = await iotHubData.directMethodCall(deviceId, moduleId, "GraphInstanceList");
        return response?.value;
    }

    public static putGraphInstance(iotHubData: IotHubData, deviceId: string, moduleId: string, instanceData: MediaGraphInstance): Promise<MediaGraphInstance[]> {
        return iotHubData.directMethodCall(deviceId, moduleId, "GraphInstanceSet", instanceData);
    }

    public static deleteGraphInstance(iotHubData: IotHubData, deviceId: string, moduleId: string, instanceName: string): Promise<void> {
        return iotHubData.directMethodCall(deviceId, moduleId, "GraphInstanceDelete", {
            name: instanceName
        });
    }
}
