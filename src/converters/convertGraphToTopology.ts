import { getNodeDefinition } from "../definitions";
import {
  MediaGraphProcessorUnion,
  MediaGraphSinkUnion,
  MediaGraphSourceUnion,
  MediaGraphTopology,
} from "../lva-sdk/lvaSDKtypes";
import { GraphInfo, MediaGraphNodeType } from "../types/graphTypes";
import { isEmptyObject } from "../helpers/helpers";

// converts internal representation to topology that can be sent using a direct method call
export function convertGraphToTopology(
  data: GraphInfo,
  graphInformation: MediaGraphTopology
) {
  // the target format expects dividing up the nodes into these three types
  const sources: MediaGraphSourceUnion[] = [];
  const processors: MediaGraphProcessorUnion[] = [];
  const sinks: MediaGraphSinkUnion[] = [];

  // helper method that converts a node ID -> name
  function getNodeName(nodeId: string) {
    for (const node of data.nodes) {
      if (node.id === nodeId) {
        return node.name;
      }
    }
    return null;
  }

  // converts from edges (u, v) to an array of nodes [u] pointing to v
  function getNodeInputs(nodeId: string) {
    const inboundEdges = data.edges.filter((edge) => edge.target === nodeId);
    return inboundEdges.map((edge) => ({
      nodeName: getNodeName(edge.source),
    }));
  }

  for (const node of data.nodes) {
    const nodeData = node.data;

    if (nodeData) {
      // only save used node properties i.e. those that match the selected types
      const properties = getTrimmedNodeProperties(nodeData.nodeProperties);
      properties.name = nodeData.nodeProperties.name;

      // get nodes pointing to this node
      properties.inputs = getNodeInputs(node.id);
      if (properties.inputs.length === 0) {
        delete properties.inputs;
      }

      // filter into three categories
      switch (nodeData.nodeType) {
        case MediaGraphNodeType.Source:
          sources.push(properties);
          break;
        case MediaGraphNodeType.Processor:
          processors.push(properties);
          break;
        case MediaGraphNodeType.Sink:
          sinks.push(properties);
          break;
      }
    }
  }

  const topology: MediaGraphTopology = {
    name: graphInformation.name,
    properties: {
      ...graphInformation.properties,
      sources,
      processors,
      sinks,
    },
  };
  if (graphInformation.systemData) {
    topology.systemData = graphInformation.systemData;
  }
  if (graphInformation.apiVersion) {
    // AutoRest changes @apiVersion to apiVersion, here it is changed back
    (topology as any)["@apiVersion"] = graphInformation.apiVersion;
  }

  return topology;
}

/* To be able to switch between multiple different types of properties without
loosing the values or properties not needed for the selected type, properties
that might not be needed are retained. We can remove these when exporting. */
function getTrimmedNodeProperties(nodeProperties: any): any {
  const definition = getNodeDefinition(nodeProperties);
  const neededProperties: any = {};

  if (!definition) {
    return {};
  }

  // copy over only properties as needed (determined by definition)
  for (const name in definition.properties) {
    const property = definition.properties[name];
    const nestedProperties = nodeProperties[name];

    if (nestedProperties) {
      if (property.type === "object") {
        if (!isEmptyObject(nestedProperties)) {
          neededProperties[name] = getTrimmedNodeProperties(nestedProperties);
        }
      } else {
        neededProperties[name] = nestedProperties;
      }
    }
  }

  // validate if any required properties are missing
  for (const name in definition.properties) {
    const isRequiredProperty = definition.required?.includes(name);
    const usedProperties = neededProperties[name];
    const propertyIsMissing = !usedProperties || isEmptyObject(usedProperties);

    if (isRequiredProperty && propertyIsMissing) {
      // TODO bubble up and show with validation errors in interface
      console.log("Expected to see property", name);
    }
  }

  return {
    "@type": nodeProperties["@type"],
    ...neededProperties,
  };
}
