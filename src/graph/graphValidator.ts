import { ValidationErrorType, ValidationError } from "../types/graphTypes";
import Definitions from "../definitions/definitions";
import Helpers from "../helpers/helpers";
import GraphData from "./graphData";
import NodeHelpers from "../helpers/nodeHelpers";
import { ICanvasNode } from "@vienna/react-dag-editor";

type TypeToNodesMap = Record<string, ICanvasNode[]>;

export default class GraphValidator {
  // Limitations from
  // https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/quotas-limitations#limitations-on-graph-topologies-at-preview
  private static limitOnePerGraph = [
    // Only one RTSP source is allowed per graph topology.
    "#Microsoft.Media.MediaGraphRtspSource",
    // HTTP extension processor: There can be at most one such processor per graph topology.
    "#Microsoft.Media.MediaGraphHttpExtension",
    // Motion detection processor: There can be at most one such processor per graph topology.
    "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
  ];
  private static mustBeImmediatelyDownstreamOf = [
    // Frame rate filter processor: Must be immediately downstream from RTSP source or motion detection processor.
    [
      "#Microsoft.Media.MediaGraphFrameRateFilterProcessor",
      [
        "#Microsoft.Media.MediaGraphRtspSource",
        "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
      ],
    ],
    // Motion detection processor: Must be immediately downstream from RTSP source.
    [
      "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
      ["#Microsoft.Media.MediaGraphRtspSource"],
    ],
    // Signal gate processor: Must be immediately downstream from RTSP source.
    [
      "#Microsoft.Media.MediaGraphSignalGateProcessor",
      ["#Microsoft.Media.MediaGraphRtspSource"],
    ],
    // Asset sink: Must be immediately downstream from RTSP source or signal gate processor.
    [
      "#Microsoft.Media.MediaGraphAssetSink",
      [
        "#Microsoft.Media.MediaGraphRtspSource",
        "#Microsoft.Media.MediaGraphSignalGateProcessor",
      ],
    ],
    // File sink: Must be immediately downstream from signal gate processor.
    [
      "#Microsoft.Media.MediaGraphFileSink",
      ["#Microsoft.Media.MediaGraphSignalGateProcessor"],
    ],
  ];
  private static cannotBeImmediatelyDownstreamOf = [
    // File sink: Cannot be immediately downstream of HTTP extension processor, or motion detection processor
    [
      "#Microsoft.Media.MediaGraphFileSink",
      "#Microsoft.Media.MediaGraphHttpExtension",
    ],
    // File sink: Cannot be immediately downstream of HTTP extension processor, or motion detection processor
    [
      "#Microsoft.Media.MediaGraphFileSink",
      "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
    ],
    // IoT Hub Sink: Cannot be immediately downstream of an IoT Hub Source.
    [
      "#Microsoft.Media.MediaGraphIoTHubMessageSink",
      "#Microsoft.Media.MediaGraphIoTHubMessageSource",
    ],
  ];
  private static cannotBeDownstreamOf = [
    // Frame rate filter processor: Cannot be used downstream of a HTTP extension processor.
    [
      "#Microsoft.Media.MediaGraphFrameRateFilterProcessor",
      "#Microsoft.Media.MediaGraphHttpExtension",
    ],
    // Frame rate filter processor: Cannot be upstream from a motion detection processor.
    // note the flipped order as this is an upstream rule
    [
      "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
      "#Microsoft.Media.MediaGraphFrameRateFilterProcessor",
    ],
    // Motion detection processor: Cannot be used downstream of a HTTP extension processor.
    [
      "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
      "#Microsoft.Media.MediaGraphHttpExtension",
    ],
  ];

  public static validate(nodesAndEdges: GraphData): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!nodesAndEdges.isGraphConnected()) {
      errors.push({
        // localized later
        description: "graphNotConnected",
        type: ValidationErrorType.NotConnected,
      });
    }

    const nodesByType: TypeToNodesMap = {};

    for (const node of nodesAndEdges.getNodes()) {
      const nodeData = node.data;

      if (nodeData) {
        // check for required properties
        const properties = NodeHelpers.getTrimmedNodeProperties(
          nodeData.nodeProperties
        );
        errors.push(...this.getMissingProperties(properties));

        // count the number of nodes of each type
        if (!(properties["@type"] in nodesByType)) {
          nodesByType[properties["@type"]] = [];
        }
        nodesByType[properties["@type"]].push(node);
      }
    }

    for (const nodeType in nodesByType) {
      const nodesOfType = nodesByType[nodeType];
      const count = nodesOfType.length;

      // only one of these nodes is allowed per graph
      if (GraphValidator.limitOnePerGraph.includes(nodeType) && count > 1) {
        errors.push({
          description: "onlyOneNodeOfTypeAllowed",
          type: ValidationErrorType.NodeCountLimit,
          nodeType,
        });
      }

      for (const node of nodesOfType) {
        const immediateParents = nodesAndEdges.getDirectParentsOfNodeById(
          node.id
        );
        const allParents = nodesAndEdges.getAllParentsOfNodeById(node.id);

        // check for nodes that have to be immediately downstream from another
        errors.push(
          ...this.checkForRequiredDirectDownstream(nodeType, immediateParents)
        );

        // check for nodes that cannot be immediately downstream from another
        errors.push(
          ...this.checkForProhibitedDirectlyDownstream(
            nodeType,
            immediateParents
          )
        );

        // check for nodes that cannot be immediately downstream from another
        errors.push(
          ...this.checkForProhibitedAnywhereDownstream(nodeType, allParents)
        );
      }
    }

    return errors;
  }

  private static checkForRequiredDirectDownstream(
    thisNodeType: string,
    immediateParents: ICanvasNode[]
  ) {
    const errors = [];
    for (const relation of this.mustBeImmediatelyDownstreamOf) {
      const matchingChildType: string = relation[0] as string;
      const expectedParentTypes: string[] = relation[1] as string[];
      if (thisNodeType === matchingChildType) {
        // nodes of this type have to be immediately downstream of a any node
        // that has any type of parentTypes
        let foundMatchingParent = false;
        for (const parentType of expectedParentTypes) {
          if (
            NodeHelpers.nodeArrayContainsNodeOfType(
              immediateParents,
              parentType
            )
          ) {
            foundMatchingParent = true;
          }
        }

        if (!foundMatchingParent) {
          errors.push({
            description: "nodesHaveToBeDirectlyDownstream",
            type: ValidationErrorType.RequiredDirectlyDownstream,
            nodeType: matchingChildType,
            parentType: expectedParentTypes,
          });
        }
      }
    }
    return errors;
  }

  private static checkForProhibitedAnywhereDownstream(
    thisNodeType: string,
    immediateParents: ICanvasNode[]
  ) {
    const errors = [];
    for (const [matchingChildType, forbiddenParentType] of this
      .cannotBeDownstreamOf) {
      if (thisNodeType === matchingChildType) {
        // nodes of this type cannot be immediately downstream of a node of type parentType
        if (
          NodeHelpers.nodeArrayContainsNodeOfType(
            immediateParents,
            forbiddenParentType
          )
        ) {
          errors.push({
            description: "nodesCannotBeDirectlyDownstream",
            type: ValidationErrorType.ProhibitedDirectlyDownstream,
            nodeType: matchingChildType,
            parentType: [forbiddenParentType],
          });
        }
      }
    }
    return errors;
  }

  private static checkForProhibitedDirectlyDownstream(
    thisNodeType: string,
    immediateParents: ICanvasNode[]
  ) {
    const errors = [];
    for (const [matchingChildType, forbiddenParentType] of this
      .cannotBeImmediatelyDownstreamOf) {
      if (thisNodeType === matchingChildType) {
        // nodes of this type cannot be anywhere downstream of a node of type parentType
        if (
          NodeHelpers.nodeArrayContainsNodeOfType(
            immediateParents,
            forbiddenParentType
          )
        ) {
          errors.push({
            description: "nodesCannotBeAnywhereDownstream",
            type: ValidationErrorType.ProhibitedAnyDownstream,
            nodeType: matchingChildType,
            parentType: [forbiddenParentType],
          });
        }
      }
    }
    return errors;
  }

  private static getMissingProperties(properties: any) {
    return this.recursiveCheckForMissingProperties(
      properties,
      [] /* path to the property, this is root, so empty array */,
      [] /* this array will recursively fill with errors */
    );
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
          description: "missingProperty",
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
