import { ConfigurationTarget } from "vscode";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/VideoAnalyzerSDKTypes";

export function createParameter(configuration: MediaGraphParameterDeclaration, parameters: MediaGraphParameterDeclaration[]) {
    // TODO: Validate parameter
    if (configuration.default === "") {
        delete configuration.default;
    }
    parameters.push(configuration);
}

export function deleteParameter(index: number, parameters: MediaGraphParameterDeclaration[]) {
    parameters.splice(index, 1);
}

export function editParameter(configuration: MediaGraphParameterDeclaration, parameters: MediaGraphParameterDeclaration[], index: number) {
    parameters[index] = configuration;
}
