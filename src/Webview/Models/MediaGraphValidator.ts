import {
    GraphModel,
    ICanvasData,
    ICanvasNode,
    IPropsAPI
} from "@vienna/react-dag-editor";
import Definitions from "../Definitions/Definitions";
import customPropertyTypes from "../Definitions/v2.0.0/customPropertyTypes.json";
import validationJson from "../Definitions/v2.0.0/validation.json";
import Localizer from "../Localization/Localizer";
import {
    CanvasNodeProperties,
    ServerError,
    ValidationError,
    ValidationErrorType
} from "../Types/GraphTypes";
import Helpers from "../Utils/Helpers";
import NodeHelpers from "../Utils/NodeHelpers";
import GraphData from "./GraphEditorViewModel";
import GraphValidationRules from "./GraphValidationRules";

type TypeToNodesMap = Record<string, ICanvasNode[]>;

export default class GraphValidator {
    public static validate(graphPropsApi: React.RefObject<IPropsAPI<any, any, any>>, nodesAndEdges: GraphData, errorsFromService?: ValidationError[]): ValidationError[] {
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
                const missingPropErrors = this.getValidationErrors(properties);
                errors.push(
                    ...missingPropErrors.map((error) => ({
                        nodeName: node.name,
                        ...error
                    }))
                );
                const serverErrorsFound = errorsFromService?.some((error) => {
                    return error.nodeName === nodeData.nodeProperties.name;
                });
                graphPropsApi.current?.updateData((prev: GraphModel) => {
                    prev.updateNodesPositionAndSize;
                    return prev.updateNode(node.id, (currNode) => {
                        return {
                            ...currNode,
                            data: {
                                ...(currNode.data as ICanvasData),
                                hasErrors: missingPropErrors?.length > 0 || serverErrorsFound
                            }
                        };
                    });
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
    private static getValidationErrors(properties: any) {
        return this.recursiveGetValidationErrors(
            properties?.["@type"],
            properties,
            [] /* path to the property, this is root, so empty array */,
            [] /* this array will recursively fill with errors */
        );
    }

    // recursively checks for missing properties and returns a list of errors
    private static recursiveGetValidationErrors(type: string, nodeProperties: any, path: string[], errors: ValidationError[]): ValidationError[] {
        const definition = Definitions.getNodeDefinition(type);

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

            if (name === "inputs") {
                continue;
            }
            if (isRequiredProperty && propertyIsMissing) {
                errors.push({
                    // localized later
                    description: "errorPanelMissingPropertyText",
                    type: ValidationErrorType.MissingField,
                    property: thisPropertyPath
                });
            } else if (property?.type === "string" && nestedProperties != null && nestedProperties !== "" && !nestedProperties.includes("${")) {
                const key = `${definition.localizationKey}.${name}`;
                const format = (customPropertyTypes as any)[key] ?? null;
                let value = nestedProperties;
                if (format === "isoDuration") {
                    value = Helpers.isoToSeconds(nestedProperties);
                }
                const validationError = GraphValidator.validateProperty(value, key);
                if (validationError !== "") {
                    errors.push({
                        description: validationError,
                        type: ValidationErrorType.PropertyValueValidationError,
                        property: thisPropertyPath
                    });
                }
            } else if (property!.type === "object" && nestedProperties) {
                this.recursiveGetValidationErrors(
                    property?.discriminator ? nestedProperties["@type"] : Definitions.getNameFromParsedRef(property?.parsedRef!),
                    nestedProperties,
                    thisPropertyPath,
                    errors
                );
            }
        }

        return errors;
    }

    static validateRequiredProperty(value: string, propertyType: string) {
        switch (propertyType) {
            case "boolean":
                if (value === "") {
                    return Localizer.l("propertyEditorValidationUndefined");
                }
                break;
            case "string":
                if (!value) {
                    return Localizer.l("propertyEditorValidationUndefinedOrEmpty");
                }
                break;
            default:
                if (value) {
                    try {
                        JSON.parse(value);
                    } catch (e) {
                        return Localizer.l("propertyEditorValidationInvalidJSON");
                    }
                } else {
                    return Localizer.l("propertyEditorValidationEmpty");
                }
                break;
        }
        return "";
    }

    static validateProperty(value: string, key: any) {
        if (value === "" || value == undefined) {
            return "";
        }
        const format = (customPropertyTypes as any)[key];
        if (format === "urlFormat") {
            const r = new RegExp('^(rtsp|ftp|http|https|tcp)://[^ "]+$');
            if (!r.test(value)) {
                return Localizer.l("notValidUrl");
            }
        } else if (format === "number" || format === "isoDuration") {
            const isNum = /^-?\d+$/.test(value);
            if (!isNum) {
                return Localizer.l("valueMustBeNumbersError");
            }
        }
        const validationValue = (validationJson as any)[key];
        if (validationValue) {
            const validationType = validationValue.type;
            const propertyValue = validationValue.value;
            switch (validationType) {
                case "regex": {
                    const r = new RegExp(propertyValue);
                    if (!r.test(value)) {
                        return Localizer.l("regexPatternError").format(propertyValue);
                    }
                    return "";
                }
                case "maxLength": {
                    if (value.length > propertyValue) {
                        return Localizer.l("maxLengthError").format(propertyValue);
                    }
                    return "";
                }
                case "minLength": {
                    return "";
                }
                case "minMaxLength": {
                    if (value.length < propertyValue[0] || value.length > propertyValue[1]) {
                        return Localizer.l("minMaxLengthError").format(propertyValue[0], propertyValue[1]);
                    }
                    return "";
                }
                case "minValue": {
                    if (value < propertyValue) {
                        return Localizer.l("minValueError").format(propertyValue);
                    }
                    return "";
                }
                case "minMaxValue": {
                    if (value < propertyValue[0] || value > propertyValue[1]) {
                        return Localizer.l("minMaxError").format(propertyValue[0], propertyValue[1], propertyValue[2]);
                    }
                    return "";
                }
            }
        }

        return "";
    }
}
