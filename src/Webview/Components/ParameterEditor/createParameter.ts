import { MediaGraphParameterDeclaration } from "../../../Common/Types/LVASDKTypes";

export function createParameter(configuration: MediaGraphParameterDeclaration, parameters: MediaGraphParameterDeclaration[]) {
    // TODO: Validate parameter
    parameters.push(configuration);
}

export function deleteParameter(index: number, parameters: MediaGraphParameterDeclaration[]) {
    parameters.splice(index, 1);
}

export function editParameter(configuration: MediaGraphParameterDeclaration, parameters: MediaGraphParameterDeclaration[], index: number) {
    parameters[index] = configuration;
}
