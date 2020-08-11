import { MediaGraphParameterDeclaration } from "../../../lva-sdk/lvaSDKtypes";

export function createParameter(
  configuration: MediaGraphParameterDeclaration,
  parameters: MediaGraphParameterDeclaration[]
) {
  // TODO: Validate parameter
  parameters.push(configuration);
}
