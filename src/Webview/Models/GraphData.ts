import clone from "lodash/clone";
import remove from "lodash/remove";
import { v4 as uuid } from "uuid";
import {
    GraphModel,
    ICanvasData,
    ICanvasNode,
    IPropsAPI,
    isWithinThreshold
} from "@vienna/react-dag-editor";
import {
    MediaGraphNodeInput,
    MediaGraphOutputSelectorOperator,
    MediaGraphParameterDeclaration,
    MediaGraphProcessorUnion,
    MediaGraphSinkUnion,
    MediaGraphSourceUnion,
    PipelineTopology
} from "../../Common/Types/VideoAnalyzerSDKTypes";
import Definitions from "../Definitions/Definitions";
import Localizer from "../Localization/Localizer";
import {
    CanvasNodeData,
    CanvasNodeProperties,
    GraphInfo,
    MediaGraphNodeType,
    OutputSelectorValueType,
    PropertyReferenceForParameter,
    ValidationError
} from "../Types/GraphTypes";
import Helpers from "../Utils/Helpers";
import LocalizerHelpers from "../Utils/LocalizerHelpers";
import NodeHelpers from "../Utils/NodeHelpers";
import SharedNodeHelpers from "../Utils/SharedNodeHelpers";
import GraphEditorViewModel from "./GraphEditorViewModel";
import GraphValidator from "./MediaGraphValidator";

export class GraphData {
    private static readonly nodeTypeList = [MediaGraphNodeType.Source, MediaGraphNodeType.Processor, MediaGraphNodeType.Sink];

    // what we initialized with (contains name, description, etc.)
    private graphInformation: PipelineTopology = { name: "", properties: { parameters: [] } };

    // the target format expects dividing up the nodes into these three types
    private sources: MediaGraphSourceUnion[] = [];
    private processors: MediaGraphProcessorUnion[] = [];
    private sinks: MediaGraphSinkUnion[] = [];

    private graphStructureStore = new GraphEditorViewModel();

    public setGraphData(graphInfo: GraphInfo) {
        this.graphInformation = graphInfo.meta;
        this.graphStructureStore.nodes = graphInfo.nodes;
        this.graphStructureStore.edges = graphInfo.edges;
    }

    public setGraphDataFromICanvasData(canvasData: ICanvasData<any>) {
        this.graphStructureStore.nodes = [...canvasData.nodes];
        this.graphStructureStore.edges = [...canvasData.edges];
    }

    // converts internal representation to topology that can be sent using a direct method call
    public setTopology(topology: any, isHorizontal: boolean) {
        this.graphInformation = topology;
        this.graphStructureStore.nodes = [];
        this.graphStructureStore.edges = [];

        // go through all the sources, processors, and sinks we are given and flatten them into nodes
        for (const nodeType of GraphData.nodeTypeList) {
            const nodesForType = topology.properties[SharedNodeHelpers.getNodeTypeKey(nodeType)];
            if (!nodesForType) {
                // no nodes for this type
                continue;
            }

            for (const node of nodesForType) {
                const ports = NodeHelpers.getPorts(node, isHorizontal, nodeType).map((port) => {
                    return {
                        ...port,
                        name: LocalizerHelpers.getPortName(node, port),
                        ariaLabel: LocalizerHelpers.getPortAriaLabel(GraphModel.fromJSON(this.getICanvasData()), node, port)
                    };
                });
                const newNode = {
                    nodeProperties: node,
                    nodeType: nodeType
                } as CanvasNodeData;
                this.graphStructureStore.nodes.push({
                    id: uuid(),
                    name: node.name,
                    ariaLabel: Localizer.l("ariaNodeLabelNodeDescription").format(node.name),
                    data: { ...NodeHelpers.getNodeAppearance(newNode), ...newNode },
                    ports: ports,
                    x: 0,
                    y: 0
                });
            }
        }

        this.forEachNodeInput((node: CanvasNodeProperties, input: MediaGraphNodeInput) => {
            const sourceNode = this.graphStructureStore.getNode(input.nodeName || "");
            const sourcePort = this.graphStructureStore.getPort(input.nodeName || "", false);
            const targetNode = this.graphStructureStore.getNode(node.name);
            const targetPort = this.graphStructureStore.getPort(node.name, true);

            const outputTypes: string[] = [];
            if (input.outputSelectors) {
                const isNotItems = input.outputSelectors.filter((selector) => selector.operator?.toLowerCase() === MediaGraphOutputSelectorOperator.IsNot.toLowerCase());
                if (isNotItems.length) {
                    outputTypes.push(...Object.values(OutputSelectorValueType));
                    isNotItems.forEach((selector) => {
                        remove(outputTypes, (item) => item === selector.value);
                    });
                }
                const isItems = input.outputSelectors.filter((selector) => selector.operator?.toLowerCase() === MediaGraphOutputSelectorOperator.Is.toLowerCase());
                if (isItems.length) {
                    isItems.forEach((selector) => {
                        if (selector.value) {
                            outputTypes.push(selector.value);
                        }
                    });
                }
            }

            if (sourceNode && sourcePort && targetNode && targetPort) {
                this.graphStructureStore.edges.push({
                    source: sourceNode.id,
                    target: targetNode.id,
                    sourcePortId: sourcePort.id,
                    targetPortId: targetPort.id,
                    data: { source: sourceNode.name, target: targetNode.name, types: outputTypes },
                    id: uuid()
                });
            }
        });

        this.setGraphDataFromICanvasData(NodeHelpers.autoLayout(this.getICanvasData(), isHorizontal));
    }

    public getTopology() {
        this.sources = [];
        this.processors = [];
        this.sinks = [];

        for (const node of this.graphStructureStore.nodes) {
            const nodeData = node.data;

            if (nodeData) {
                // only save used node properties i.e. those that match the selected types
                const properties = NodeHelpers.getTrimmedNodeProperties(nodeData.nodeProperties as CanvasNodeProperties);
                properties.name = nodeData.nodeProperties.name;

                // get nodes pointing to this node
                properties.inputs = this.graphStructureStore.getNodeInputs(node.id);
                if (properties.inputs.length === 0) {
                    delete properties.inputs;
                }

                // filter into three categories
                switch (nodeData.nodeType) {
                    case MediaGraphNodeType.Source:
                        this.sources.push(properties as any);
                        break;
                    case MediaGraphNodeType.Processor:
                        this.processors.push(properties as any);
                        break;
                    case MediaGraphNodeType.Sink:
                        this.sinks.push(properties as any);
                        break;
                }
            }
        }

        let parameters = clone(this.graphInformation.properties?.parameters);
        parameters = parameters?.map((parameter) => {
            delete (parameter as any)["nameError"];
            return parameter;
        });

        const topology: PipelineTopology = {
            name: this.graphInformation.name,
            properties: {
                ...this.graphInformation.properties,
                sources: this.sources,
                processors: this.processors,
                sinks: this.sinks,
                parameters: parameters
            }
        };
        if (this.graphInformation.systemData) {
            topology.systemData = this.graphInformation.systemData;
        }
        if (this.graphInformation.apiVersion) {
            // AutoRest changes @apiVersion to apiVersion, here it is changed back
            (topology as any)["@apiVersion"] = this.graphInformation.apiVersion;
        }

        return Helpers.removeEmptyObjects(topology);
    }

    public getParameters(): MediaGraphParameterDeclaration[] {
        return this.graphInformation.properties?.parameters || [];
    }

    public setName(name: string) {
        this.graphInformation.name = name;
    }

    public setDescription(description: string) {
        if (!this.graphInformation.properties) {
            this.graphInformation.properties = {};
        }
        if (description === "") {
            delete this.graphInformation.properties.description;
        } else {
            this.graphInformation.properties.description = description;
        }
    }

    public getName(): string {
        return this.graphInformation.name;
    }

    public getDescription(): string | undefined {
        if (this.graphInformation.properties) {
            return this.graphInformation.properties.description;
        } else {
            return undefined;
        }
    }

    public getICanvasData(): ICanvasData {
        return {
            nodes: this.graphStructureStore.nodes,
            edges: this.graphStructureStore.edges
        };
    }

    public getGraphInfo(): GraphInfo {
        const graphInfo = {
            meta: this.getTopology(),
            nodes: this.graphStructureStore.nodes,
            edges: this.graphStructureStore.edges
        };

        if (this.graphInformation.properties) {
            const props = graphInfo.meta.properties as any;
            props.description = this.graphInformation.properties.description;
            props.parameters = this.graphInformation.properties.parameters;
        }

        return graphInfo;
    }

    public async validate(graphPropsApi: React.RefObject<IPropsAPI<any, any, any>>, errorsFromService?: ValidationError[]): Promise<ValidationError[]> {
        return GraphValidator.validate(graphPropsApi, this.graphStructureStore, errorsFromService);
    }

    public getPropertiesWithExactParameter(parameter: string) {
        const parameterString = "${" + parameter + "}";
        return this.getAllNodePropertiesMatching((propertyValue) => {
            return propertyValue === parameterString;
        });
    }

    public getPropertiesContaining(value: string) {
        return this.getAllNodePropertiesMatching((propertyValue) => {
            return propertyValue.indexOf(value) !== -1;
        });
    }

    public getAllNodePropertiesMatching(filter: (propertyValue: string) => boolean) {
        const nodes = this.graphStructureStore.nodes;
        let affectedParameters: PropertyReferenceForParameter[] = [];
        for (const node of nodes) {
            affectedParameters = affectedParameters.concat(
                this.getPropertiesInNode(node, filter).map((propertyLocation) => {
                    return {
                        node: node,
                        nodeType: node.data!.nodeProperties["@type"],
                        nodeName: node.name,
                        ...propertyLocation
                    } as PropertyReferenceForParameter;
                })
            );
        }
        return affectedParameters;
    }

    // returns an array that shows what properties match a given filter for a single node
    public getPropertiesInNode(node: ICanvasNode<CanvasNodeData, unknown>, filter?: (propertyValue: string) => boolean) {
        const nodeDrillDown: string[] = [node.name!];
        const properties = NodeHelpers.getTrimmedNodeProperties(node.data!.nodeProperties as CanvasNodeProperties);
        properties.name = node.data!.nodeProperties.name;
        const definition = Definitions.getNodeDefinition(properties["@type"]);
        return this.recursiveGetPropertiesInNode(properties, definition, nodeDrillDown, filter);
    }

    private recursiveGetPropertiesInNode(
        properties: any,
        definition: any,
        propertyKeyPath: string[],
        filter?: (propertyValue: string) => boolean
    ): Partial<PropertyReferenceForParameter>[] {
        let matchingProperties: Partial<PropertyReferenceForParameter>[] = [];
        for (const propertyKey in properties) {
            const propertyValue = (properties as any)[propertyKey];
            if (propertyValue !== undefined) {
                // the definition for this specific property
                const nestedChildDefinition = definition.properties[propertyKey];

                if (nestedChildDefinition.type === "object") {
                    // if this level has a discriminator, we need to fetch it's definition since it might vary
                    // otherwise, we know there is only one possible child definition so just fetch that
                    const propertyType = propertyValue["@type"] ?? Definitions.getNameFromParsedRef(nestedChildDefinition.parsedRef);
                    const childDefinition = Definitions.getNodeDefinition(propertyType);

                    propertyKeyPath.push(propertyKey);
                    const newItem = this.recursiveGetPropertiesInNode(propertyValue, childDefinition, propertyKeyPath, filter);
                    matchingProperties = matchingProperties.concat(newItem);
                    propertyKeyPath.pop();
                } else if (nestedChildDefinition.type === "string" && propertyValue) {
                    // if there is no filter specified or the filter matched the property value, add this property to return
                    if (!filter || filter(propertyValue)) {
                        const localizationKey = this.recursiveGetDefinitionFromProperty(definition.properties, propertyKey);
                        matchingProperties.push({
                            pathOfPropertyKeys: [...propertyKeyPath, propertyKey],
                            propertyDefinition: nestedChildDefinition,
                            localizationKey,
                            propertyValue
                        });
                    }
                }
            }
        }
        return matchingProperties;
    }

    private recursiveGetDefinitionFromProperty(definition: any, propertyKey: string) {
        let localizationKey = "";
        for (const def in definition) {
            const property = definition[def];
            if (property !== undefined) {
                if (property?.properties != undefined) {
                    localizationKey = this.recursiveGetDefinitionFromProperty(property.properties, propertyKey);
                } else {
                    if (def === propertyKey) {
                        localizationKey = definition[def].localizationKey;
                        break;
                    }
                }
            }
        }
        return localizationKey;
    }

    public deleteParamsFromGraph(parameter: any) {
        const parameterName = "${" + parameter.name + "}";
        const graphNodes = this.graphStructureStore.nodes;
        for (const node of graphNodes) {
            this.recursiveDeleteParamsFromGraph(node, parameterName);
        }
    }

    private recursiveDeleteParamsFromGraph(nestedNode: any, parameterName: string) {
        const propertyKeys = Object.keys(nestedNode);
        for (let i = 0; i < propertyKeys.length; i++) {
            const propertyValue = nestedNode[propertyKeys[i]];
            if (propertyValue !== undefined) {
                if (typeof propertyValue != "string") {
                    if (propertyValue) {
                        this.recursiveDeleteParamsFromGraph(propertyValue, parameterName);
                    }
                } else {
                    if (propertyValue != null && propertyValue.indexOf(parameterName) !== -1) {
                        nestedNode[propertyKeys[i]] = "";
                    }
                }
            }
        }
    }

    public editParamsFromGraph(oldParameterName: string, newParameterName: string) {
        const oldName = "${" + oldParameterName + "}";
        const newName = "${" + newParameterName + "}";

        const graphNodes = this.graphStructureStore.nodes;
        for (const node of graphNodes) {
            this.recursiveEditParamsFromGraph(node, oldName, newName);
        }
    }

    private recursiveEditParamsFromGraph(nestedNode: any, oldParameterName: string, newParameterName: string) {
        const propertyKeys = Object.keys(nestedNode);
        for (let i = 0; i < propertyKeys.length; i++) {
            const propertyValue = nestedNode[propertyKeys[i]];
            if (propertyValue !== undefined) {
                if (typeof propertyValue != "string") {
                    this.recursiveEditParamsFromGraph(propertyValue, oldParameterName, newParameterName);
                } else {
                    if (propertyValue != null && propertyValue.indexOf(oldParameterName) !== -1) {
                        nestedNode[propertyKeys[i]] = propertyValue.replace(oldParameterName, newParameterName);
                    }
                }
            }
        }
    }

    // helper to loop through all inputs for all nodes
    private forEachNodeInput(callback: (node: CanvasNodeProperties, input: MediaGraphNodeInput) => void) {
        if (this.graphInformation && this.graphInformation.properties) {
            for (const nodeType of GraphData.nodeTypeList) {
                const nodesForType = (this.graphInformation.properties as Record<string, CanvasNodeProperties[]>)[SharedNodeHelpers.getNodeTypeKey(nodeType)];
                if (!nodesForType) {
                    // no nodes for this type
                    continue;
                }

                for (const node of nodesForType) {
                    if (node.inputs) {
                        for (const input of node.inputs) {
                            callback(node, input);
                        }
                    }
                }
            }
        }
    }
}
