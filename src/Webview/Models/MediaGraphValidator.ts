import { ICanvasData, ICanvasNode, IPropsAPI } from "@vienna/react-dag-editor";
import Definitions from "../Definitions/Definitions";
import {
    CanvasNodeProperties,
    ValidationError,
    ValidationErrorType
} from "../Types/GraphTypes";
import Helpers from "../Utils/Helpers";
import NodeHelpers from "../Utils/NodeHelpers";
import GraphData from "./GraphEditorViewModel";
import GraphValidationRules from "./GraphValidationRules";

type TypeToNodesMap = Record<string, ICanvasNode[]>;

export default class GraphValidator {
    public static validate(
        graphPropsApi: React.RefObject<IPropsAPI<any, any, any, any>>,
        nodesAndEdges: GraphData,
        errorsFromService?: ValidationError[]
    ): ValidationError[] {
        const errors: ValidationError[] = [...(errorsFromService ?? [])];

        if (!nodesAndEdges.isGraphConnected()) {
            errors.push({
                // localized later
                description: "errorPanelGraphNotConnectedText",
                type: ValidationErrorType.NotConnected
            });
        }

        const nodesByType: TypeToNodesMap = {};

        for (const node of nodesAndEdges.nodes) {
            const nodeData = node.data;

            if (nodeData) {
                // check for required properties
                const properties = NodeHelpers.getTrimmedNodeProperties(nodeData.nodeProperties as CanvasNodeProperties);
                const missingPropErrors = this.getMissingProperties(properties);
                errors.push(
                    ...missingPropErrors.map((error) => ({
                        nodeName: node.name,
                        ...error
                    }))
                );
                const serverErrorsFound = errorsFromService?.some((error) => {
                    return error.nodeName === nodeData.nodeProperties.name;
                });
                graphPropsApi.current?.updateData((prevData: ICanvasData) => {
                    return {
                        ...prevData,
                        nodes: prevData.nodes.map((currNode) => {
                            if (currNode.id === node.id) {
                                return {
                                    ...currNode,
                                    data: {
                                        ...(currNode.data as ICanvasData),
                                        hasErrors: missingPropErrors?.length > 0 || serverErrorsFound
                                    }
                                };
                            }
                            return currNode;
                        })
                    };
                });

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
            if (GraphValidationRules.limitOnePerGraph.includes(nodeType) && count > 1) {
                errors.push({
                    description: "errorPanelOnlyOneNodeOfTypeAllowedText",
                    type: ValidationErrorType.NodeCountLimit,
                    nodeType,
                    helpLink: GraphValidationRules.documentationLinks.limitationsAtPreview
                });
            }

            for (const node of nodesOfType) {
                const immediateParents = nodesAndEdges.getDirectParentsOfNodeById(node.id);
                const allParents = nodesAndEdges.getAllParentsOfNodeById(node.id);

                // check for nodes that have to be immediately downstream from another
                errors.push(...this.checkForRequiredDirectDownstream(nodeType, immediateParents));

                // check for nodes that cannot be immediately downstream from another
                errors.push(...this.checkForProhibitedDirectlyDownstream(nodeType, immediateParents));

                // check for nodes that cannot be immediately downstream from another
                errors.push(...this.checkForProhibitedAnywhereDownstream(nodeType, allParents));
            }
        }

        return errors;
    }

    // ensures nodes are direct children of another
    private static checkForRequiredDirectDownstream(thisNodeType: string, immediateParents: ICanvasNode[]) {
        const errors = [];
        for (const relation of GraphValidationRules.mustBeImmediatelyDownstreamOf) {
            const matchingChildType: string = relation[0] as string;
            const expectedParentTypes: string[] = relation[1] as string[];
            if (thisNodeType === matchingChildType) {
                // nodes of this type have to be immediately downstream of a any node
                // that has any type of parentTypes
                let foundMatchingParent = false;
                for (const parentType of expectedParentTypes) {
                    if (NodeHelpers.nodeArrayContainsNodeOfType(immediateParents, parentType)) {
                        foundMatchingParent = true;
                    }
                }

                if (!foundMatchingParent) {
                    errors.push({
                        description: "errorPanelNodesHaveToBeDirectlyDownstreamText",
                        type: ValidationErrorType.RequiredDirectlyDownstream,
                        nodeType: matchingChildType,
                        parentType: expectedParentTypes,
                        helpLink: GraphValidationRules.documentationLinks.limitationsAtPreview
                    });
                }
            }
        }
        return errors;
    }

    // checks for nodes that cannot be a direct child or one of their children
    private static checkForProhibitedAnywhereDownstream(thisNodeType: string, immediateParents: ICanvasNode[]) {
        const errors = [];
        for (const [matchingChildType, forbiddenParentType] of GraphValidationRules.cannotBeDownstreamOf) {
            if (thisNodeType === matchingChildType) {
                // nodes of this type cannot be immediately downstream of a node of type parentType
                if (NodeHelpers.nodeArrayContainsNodeOfType(immediateParents, forbiddenParentType)) {
                    errors.push({
                        description: "nodesCannotBeDirectlyDownstream",
                        type: ValidationErrorType.ProhibitedDirectlyDownstream,
                        nodeType: matchingChildType,
                        parentType: [forbiddenParentType],
                        helpLink: GraphValidationRules.documentationLinks.limitationsAtPreview
                    });
                }
            }
        }
        return errors;
    }

    // checks for nodes that cannot be direct children of another node
    private static checkForProhibitedDirectlyDownstream(thisNodeType: string, immediateParents: ICanvasNode[]) {
        const errors = [];
        for (const [matchingChildType, forbiddenParentType] of GraphValidationRules.cannotBeImmediatelyDownstreamOf) {
            if (thisNodeType === matchingChildType) {
                // nodes of this type cannot be anywhere downstream of a node of type parentType
                if (NodeHelpers.nodeArrayContainsNodeOfType(immediateParents, forbiddenParentType)) {
                    errors.push({
                        description: "nodesCannotBeAnywhereDownstream",
                        type: ValidationErrorType.ProhibitedAnyDownstream,
                        nodeType: matchingChildType,
                        parentType: [forbiddenParentType],
                        helpLink: GraphValidationRules.documentationLinks.limitationsAtPreview
                    });
                }
            }
        }
        return errors;
    }

    // helper function to get an array of validation errors
    private static getMissingProperties(properties: any) {
        return this.recursiveCheckForMissingProperties(
            properties,
            [] /* path to the property, this is root, so empty array */,
            [] /* this array will recursively fill with errors */
        );
    }

    // recursively checks for missing properties and returns a list of errors
    private static recursiveCheckForMissingProperties(nodeProperties: any, path: string[], errors: ValidationError[]): ValidationError[] {
        const definition = Definitions.getNodeDefinition(nodeProperties);

        if (!definition) {
            return errors;
        }

        // validate if any required properties are missing
        for (const name in definition.properties) {
            const property = definition.properties[name];
            const isRequiredProperty = definition.required?.includes(name);
            const nestedProperties = nodeProperties[name];
            const propertyIsMissing = !nestedProperties || Helpers.isEmptyObject(nestedProperties);
            const thisPropertyPath = [...path, name];

            if (isRequiredProperty && propertyIsMissing) {
                errors.push({
                    // localized later
                    description: "errorPanelMissingPropertyText",
                    type: ValidationErrorType.MissingField,
                    property: thisPropertyPath
                });
            } else if (property!.type === "object" && !Helpers.isEmptyObject(nestedProperties)) {
                this.recursiveCheckForMissingProperties(nestedProperties, thisPropertyPath, errors);
            }
        }

        return errors;
    }
}
