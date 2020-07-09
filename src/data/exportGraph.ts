import { MediaGraphNodeType, GraphInfo } from "../data/graphTypes";
import { getNodeDefinition } from "../definitions";
import {
  MediaGraphTopology,
  MediaGraphSourceUnion,
  MediaGraphProcessorUnion,
  MediaGraphSinkUnion,
} from "../data/index";

export function convertGraphToTopology(
  data: GraphInfo,
  graphInformation: MediaGraphTopology
) {
  const sources: MediaGraphSourceUnion[] = [];
  const processors: MediaGraphProcessorUnion[] = [];
  const sinks: MediaGraphSinkUnion[] = [];

  function getNodeName(nodeId: string) {
    for (const node of data.nodes) {
      if (node.id === nodeId) {
        return node.name;
      }
    }
    return null;
  }

  function getNodeInputs(nodeId: string) {
    const inboundEdges = data.edges.filter((edge) => edge.target === nodeId);
    return inboundEdges.map((edge) => ({
      nodeName: getNodeName(edge.source),
    }));
  }

  for (const node of data.nodes) {
    const nodeData = node.data;

    if (nodeData) {
      const properties = getTrimmedNodeProperties(nodeData.nodeProperties);
      properties.name = nodeData.nodeProperties.name;

      properties.inputs = getNodeInputs(node.id);
      if (properties.inputs.length === 0) {
        delete properties.inputs;
      }

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

// checks if objects is {}
function isEmptyObject(object: any) {
  return Object.keys(object).length === 0;
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
      console.log("Expected to see property", name);
    }
  }

  return {
    "@type": nodeProperties["@type"],
    ...neededProperties,
  };
}
