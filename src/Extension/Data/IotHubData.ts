import { Client, Registry } from "azure-iothub";
import { Constants } from "../Util/Constants";

export interface DirectMethodError {
    message: string;
    details: DirectMethodErrorDetail[];
}
export interface DirectMethodErrorDetail {
    message: string;
    code: string;
}

export class IotHubData {
    private iotHubClient?: Client;
    private registryClient?: Registry;

    constructor(connectionString: string) {
        this.iotHubClient = Client.fromConnectionString(connectionString);
        this.registryClient = Registry.fromConnectionString(connectionString);
    }

    public directMethodCall(deviceId: string, moduleId: string, methodName: string, payload?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.iotHubClient) {
                reject("Iot hub client not found");
                return;
            }
            this.iotHubClient.invokeDeviceMethod(
                deviceId,
                moduleId,
                {
                    methodName,
                    payload: {
                        "@apiVersion": Constants.ApiVersion.version1,
                        ...payload
                    },
                    responseTimeoutInSeconds: 10,
                    connectTimeoutInSeconds: 10
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result?.payload?.error) {
                        reject(result.payload.error);
                    } else {
                        resolve(result.payload);
                    }
                }
            );
        });
    }

    public async getDevices() {
        const response = await this.registryClient?.list();
        return response?.responseBody;
    }

    public async getDevice(deviceId: string) {
        const response = await this.registryClient?.get(deviceId);
        return response?.responseBody;
    }

    public async getModules(deviceId: string) {
        const response = await this.registryClient?.getModulesOnDevice(deviceId);
        return response?.responseBody;
    }

    public async getModule(deviceId: string, moduleId: string) {
        const response = await this.registryClient?.getModule(deviceId, moduleId);
        return response?.responseBody;
    }

    public async getVersion(deviceId: string, moduleId: string) {
        const twinResult = await this.registryClient?.getModuleTwin(deviceId, moduleId);
        const productInfo = twinResult?.responseBody?.properties?.reported?.ProductInfo;
        if (productInfo) {
            const infoParts = productInfo.split(":");
            if (infoParts.length === 2 && infoParts[0] == "live-video-analytics") {
                return infoParts[1];
            }
        }
        return null;
    }
}
