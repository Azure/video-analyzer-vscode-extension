import { v4 as uuid } from "uuid";
import * as apiDefinition from "./definition.json";
import { MediaGraphNodeType } from "../data/graphTypes";
import {
  getNodeProperties,
  getNodeTypeTitle,
  getPorts,
} from "../data/graphFunctions";
import { nodeTypeList } from "../data/nodes";
import * as fs from "fs";

const definitions = apiDefinition["definitions"] as any;

const localizable: Record<string, string> = {};

// Extract all description fields
for (const nodeName in definitions) {
  const node = definitions[nodeName];
  if (node.description) {
    const key = nodeName;
    localizable[nodeName] = node.description;
    node.description = key;
  }

  for (const propertyName in node.properties) {
    const property = node.properties[propertyName];
    if (property.description) {
      const key = `${nodeName}.${propertyName}`;
      localizable[`${nodeName}.${propertyName}`] = property.description;
      property.description = key;
    }

    if (property["x-ms-enum"]) {
      for (const value of property["x-ms-enum"].values) {
        if (value.description) {
          const key = `${nodeName}.${propertyName}.${value.value}`;
          localizable[key] = value.description;
          value.description = key;
        }
      }
    }
  }
}

const availableNodes: any[] = [];

function getNodeType(definition: any): MediaGraphNodeType {
  if (!definition.allOf) {
    return MediaGraphNodeType.Other;
  }

  switch (definition.allOf[0]["$ref"]) {
    case "#/definitions/MediaGraphSink":
      return MediaGraphNodeType.Sink;
    case "#/definitions/MediaGraphProcessor":
      return MediaGraphNodeType.Processor;
    case "#/definitions/MediaGraphSource":
      return MediaGraphNodeType.Source;
    default:
      return MediaGraphNodeType.Other;
  }
}

// inline all inherited properties
function expand(object: Record<string, any>): any {
  if (typeof object === "object") {
    for (const key in object) {
      // include all attributes of referenced object
      if (key === "allOf") {
        object.parsedAllOf = [];
        for (const reference of object["allOf"]) {
          if (reference["$ref"]) {
            object = {
              ...resolvePathReference(reference["$ref"]),
              ...object,
            };
            object.parsedAllOf.push(reference["$ref"]);
          }
        }
      }
      // add all referenced attributes to current node
      if (key === "$ref") {
        object = {
          parsedRef: object["$ref"],
          ...resolvePathReference(object["$ref"]),
          ...object,
        };
      }
      object[key] = expand(object[key]);
    }
    delete object["$ref"];
    delete object.allOf;
  }
  return object;
}

// find matching entry in definition file
function resolvePathReference(ref: string): any {
  ref = ref.replace("#/definitions/", "");
  let current: Record<string, any> = definitions;
  for (const piece of ref.split("/")) {
    current = current[piece];
  }
  return expand(current);
}

// lowercase first letter
function changeToPresentableName(name: string): string {
  name = name.replace("MediaGraph", "");
  name = name.charAt(0).toLowerCase() + name.slice(1);
  return name;
}

// expand all nodes
for (const name in definitions) {
  const definition = (definitions as Record<string, any>)[name];
  availableNodes.push({
    name,
    nodeType: getNodeType(definition),
    ...expand(definition),
  });
}

// generate nodes shown in the drag-and-droppable item panel on the left
const itemPanelNodes = nodeTypeList.map((nodeType) => ({
  title: getNodeTypeTitle(nodeType),
  id: getNodeTypeTitle(nodeType),
  searchKeys: [getNodeTypeTitle(nodeType)],
  children: availableNodes
    .filter((node) => node.nodeType === nodeType)
    .map((node) => {
      return {
        id: uuid(),
        name: changeToPresentableName(node.name),
        shape: "module",
        ports: getPorts(node),
        data: {
          ...getNodeProperties(node.nodeType),
          nodeProperties: {
            "@type": node["x-ms-discriminator-value"],
            name: node.name,
          },
          nodeType: node.nodeType,
        },
      };
    })
    .map((node) => ({
      title: node.name,
      extra: node,
      id: uuid(),
      searchKeys: [node.name],
      children: [],
    })),
  expanded: true,
}));

// write to file
const base = __dirname + "/../../src/definitions/data";

fs.writeFileSync(
  base + "/nodes.json",
  JSON.stringify(
    {
      availableNodes,
      itemPanelNodes,
    },
    null,
    2
  ),
  "utf8"
);

fs.writeFileSync(
  base + "/i18n.en.json",
  JSON.stringify(localizable, null, 2),
  "utf8"
);
