import dagre from "dagre";
import {
    applyDefaultPortsPosition,
    applyHorizontalGraphPortsPosition,
    ICanvasData,
    ICanvasNode,
    ICanvasPort
} from "@vienna/react-dag-editor";
import Definitions from "../Definitions/Definitions";
import {
    CanvasNodeData,
    CanvasNodeProperties,
    MediaGraphNodeType,
    NodeDefinition
} from "../Types/GraphTypes";
import Helpers from "./Helpers";
import SharedNodeHelpers from "./SharedNodeHelpers";

export default class NodeHelpers {
    // maps a string representation of a node's type to a MediaGraphNodeType
    static getNodeTypeFromString(type: string): MediaGraphNodeType {
        switch (type) {
            case "sources":
                return MediaGraphNodeType.Source;
            case "processors":
                return MediaGraphNodeType.Processor;
            case "sinks":
                return MediaGraphNodeType.Sink;
            default:
                return MediaGraphNodeType.Other;
        }
    }

    // returns the appropriate ports for a node (proper input and input according to type)
    static getPorts(node: NodeDefinition, isHorizontal: boolean, type?: MediaGraphNodeType): ICanvasPort[] {
        return isHorizontal
            ? applyHorizontalGraphPortsPosition(SharedNodeHelpers.getPortsWithOutLayout(node, type))
            : applyDefaultPortsPosition(SharedNodeHelpers.getPortsWithOutLayout(node, type));
    }

    public static autoLayout = (data: ICanvasData<any, unknown, any>, isHorizontal: boolean): ICanvasData<any, unknown, any> => {
        // tslint:disable-next-line: no-inferred-empty-object-type
        const graph = new dagre.graphlib.Graph()
            .setGraph({
                marginx: 30,
                marginy: 30
            })
            .setDefaultEdgeLabel(() => {
                return {};
            });

        if (!data.nodes || !data.edges) {
            return data;
        }

        const width = 350;
        const height = 70;

        data.nodes.forEach((node) => {
            graph.setNode(node.id, {
                width: node.width || width,
                height: node.height || height
            });
        });

        data.edges.forEach((edge) => {
            graph.setEdge(edge.source.toString(), edge.target.toString());
        });

        graph.graph().rankdir = isHorizontal ? "LR" : "TB";

        dagre.layout(graph);

        const nextNodes = data.nodes.map((node) => {
            const graphNode = graph.node(node.id);
            return { ...node, x: graphNode.x - (node.width || width) / 2, y: graphNode.y + -(node.height || height) / 2 };
        });

        return { nodes: nextNodes, edges: data.edges };
    };

    // determines appearance properties for a node
    static getNodeAppearance(node: CanvasNodeData) {
        const icons = {
            "#Microsoft.Media.MediaGraphRtspSource": "SecurityCamera",
            "#Microsoft.VideoAnalyzer.RtspSource": "SecurityCamera",
            "#Microsoft.Media.MediaGraphIoTHubMessageSource": "IOT",
            "#Microsoft.VideoAnalyzer.IoTHubMessageSource": "IOT",
            "#Microsoft.Media.MediaGraphMotionDetectionProcessor": "RedEye",
            "#Microsoft.VideoAnalyzer.MotionDetectionProcessor": "RedEye",
            "#Microsoft.Media.MediaGraphFrameRateFilterProcessor": "PlaybackRate1x",
            "#Microsoft.VideoAnalyzer.FrameRateFilterProcessor": "PlaybackRate1x",
            "#Microsoft.Media.MediaGraphHttpExtension": "PhotoVideoMedia",
            "#Microsoft.VideoAnalyzer.HttpExtension": "PhotoVideoMedia",
            "#Microsoft.Media.MediaGraphSignalGateProcessor": "Ringer",
            "#Microsoft.VideoAnalyzer.SignalGateProcessor": "Ringer",
            "#Microsoft.Media.MediaGraphAssetSink": "FabricAssetLibrary",
            "#Microsoft.VideoAnalyzer.AssetSink": "FabricAssetLibrary",
            "#Microsoft.Media.MediaGraphFileSink": "PageData",
            "#Microsoft.VideoAnalyzer.FileSink": "PageData",
            "#Microsoft.Media.MediaGraphIoTHubMessageSink": "IOT",
            "#Microsoft.VideoAnalyzer.IoTHubMessageSink": "IOT",
            "#Microsoft.Media.MediaGraphGrpcExtension": "Switch",
            "#Microsoft.VideoAnalyzer.GrpcExtension": "Switch",
            "#Microsoft.Media.MediaGraphCognitiveServicesVisionExtension": "CognitiveServices",
            "#Microsoft.VideoAnalyzer.CognitiveServicesVisionExtension": "CognitiveServices"
        } as Record<string, string>;

        const icon = icons[node.nodeProperties["@type"]];

        switch (node.nodeType) {
            case MediaGraphNodeType.Source:
                return {
                    iconName: icon,
                    color: "var(--node-source-accent-color)"
                };
            case MediaGraphNodeType.Processor:
                return {
                    iconName: icon,
                    color: "var(--node-processor-accent-color)"
                };
            case MediaGraphNodeType.Sink:
                return {
                    iconName: icon,
                    color: "var(--node-sink-accent-color)"
                };
            default:
                return {};
        }
    }

    // evaluates if a node can be connected to another node (has to be downstream)
    static nodeCanConnectToNode(source: ICanvasNode<any>, target: ICanvasNode<any>) {
        if (source.data && target.data) {
            const sourceNodeType = source.data.nodeType;
            const targetNodeType = target.data.nodeType;

            switch (sourceNodeType) {
                case MediaGraphNodeType.Source:
                case MediaGraphNodeType.Processor:
                    return MediaGraphNodeType.Processor === targetNodeType || MediaGraphNodeType.Sink === targetNodeType;
                case MediaGraphNodeType.Sink:
                    return false;
                default:
                    break;
            }
        }
        return true;
    }

    /* To be able to switch between multiple different types of properties without
    loosing the values or properties not needed for the selected type, properties
    that might not be needed are retained. We can remove these when exporting. */
    static getTrimmedNodeProperties(nodeProperties: CanvasNodeProperties): CanvasNodeProperties {
        const definition = Definitions.getNodeDefinition(nodeProperties["@type"]);
        const neededProperties: any = {};

        if (!definition) {
            return nodeProperties;
        }

        // copy over only properties as needed (determined by definition)
        for (const name in definition.properties) {
            const property = definition.properties[name];
            const nestedProperties = (nodeProperties as any)[name];

            // some properties can be false and we want to include that value
            if (nestedProperties !== undefined) {
                if (property && property.type === "object") {
                    if (!Helpers.isEmptyObject(nestedProperties)) {
                        neededProperties[name] = this.getTrimmedNodeProperties(nestedProperties);
                    }
                } else {
                    neededProperties[name] = nestedProperties;
                }
            }
        }

        return {
            "@type": nodeProperties["@type"],
            ...neededProperties
        };
    }

    // checks if an array contains a node with the given type
    static nodeArrayContainsNodeOfType(nodes: ICanvasNode<any>[], nodeType: string) {
        for (const node of nodes) {
            if (node.data && node.data.nodeProperties["@type"] === nodeType) {
                return true;
            }
        }
        return false;
    }

    // checks if an array contains a node with the given ID
    static nodeArrayContainsNodeId(nodes: ICanvasNode[], nodeId: string): boolean {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return true;
            }
        }
        return false;
    }
}
