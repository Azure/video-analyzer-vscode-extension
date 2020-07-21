import { ValidationErrorType, ValidationError } from "../types/graphTypes";
import Definitions from "../definitions/definitions";
import Helpers from "../helpers/helpers";
import GraphData from "./graphData";
import NodeHelpers from "../helpers/nodeHelpers";

export default class GraphValidator {
  public static validate(nodesAndEdges: GraphData): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!nodesAndEdges.isGraphConnected()) {
      errors.push({
        // localized later
        description: "Graph is not connected",
        type: ValidationErrorType.NotConnected,
      });
    }

    const typeCount: Record<string, number> = {};

    for (const node of nodesAndEdges.getNodes()) {
      const nodeData = node.data;

      if (nodeData) {
        const properties = NodeHelpers.getTrimmedNodeProperties(
          nodeData.nodeProperties
        );
        const missingProperties = this.recursiveCheckForMissingProperties(
          properties,
          [] /* path to the property, this is root, so empty array */,
          [] /* this array will recursively fill with errors */
        );
        errors.push(...missingProperties);

        if (!(properties.type in typeCount)) {
          typeCount[properties.type] = 0;
        }
        typeCount[properties.type]++;
      }
    }

    for (const nodeType in typeCount) {
      const count = typeCount[nodeType];

      if (
        [
          "#Microsoft.Media.MediaGraphRtspSource",
          "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
          "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
        ].includes(nodeType) &&
        count > 1
      ) {
        errors.push({
          description: "More than one {node type}",
          type: ValidationErrorType.NodeCountLimit,
          nodeType,
        });
      }
    }

    // for (const edge of nodesAndEdges.getEdges()) {
    //   for (const node of nodesAndEdges.getNodes()) {
    //     if (node.id === edge.source) {
    //       return node;
    //     }
    //   }
    // }

    return errors;
  }

  private static recursiveCheckForMissingProperties(
    nodeProperties: any,
    path: string[],
    errors: ValidationError[]
  ): ValidationError[] {
    const definition = Definitions.getNodeDefinition(nodeProperties);

    if (!definition) {
      return errors;
    }

    // validate if any required properties are missing
    for (const name in definition.properties) {
      const property = definition.properties[name];
      const isRequiredProperty = definition.required?.includes(name);
      const nestedProperties = nodeProperties[name];
      const propertyIsMissing =
        !nestedProperties || Helpers.isEmptyObject(nestedProperties);
      const thisPropertyPath = [...path, name];

      if (isRequiredProperty && propertyIsMissing) {
        errors.push({
          // localized later
          description: "Missing property {property name}",
          type: ValidationErrorType.MissingProperty,
          property: thisPropertyPath,
        });
      } else if (
        property.type === "object" &&
        !Helpers.isEmptyObject(nestedProperties)
      ) {
        this.recursiveCheckForMissingProperties(
          nestedProperties,
          thisPropertyPath,
          errors
        );
      }
    }

    return errors;
  }
}
