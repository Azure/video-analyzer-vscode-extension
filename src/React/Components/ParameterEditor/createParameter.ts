import { MediaGraphParameterDeclaration } from "../../../Types/LVASDKTypes";

export function createParameter(configuration: MediaGraphParameterDeclaration, parameters: MediaGraphParameterDeclaration[]) {
    // TODO: Validate parameter
    parameters.push(configuration);
}
