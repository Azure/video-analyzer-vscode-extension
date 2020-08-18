import * as fs from "fs";
import * as path from "path";
import { v4 as uuid } from "uuid";
import Helpers from "../../helpers/Helpers";
import NodeHelpers from "../../helpers/NodeHelpers";
import {
    CanvasNodeData,
    MediaGraphNodeType,
    NestedLocalizedStrings,
    NodeDefinition
} from "../../types/graphTypes";

export default class DefinitionGenerator {
    private apiDefinition: any;
    private outputFolder: string;
    private version: string;
    private definitions: any;

    private localizable: Record<string, NestedLocalizedStrings> = {};
    private availableNodes: NodeDefinition[] = [];
    private itemPanelNodes: any[] = [];
    private usableNodes: Record<string, string[]> = {};

    private static readonly nodeTypeList = [MediaGraphNodeType.Source, MediaGraphNodeType.Processor, MediaGraphNodeType.Sink];

    private static resolveFile(filePath: string) {
        return path.join(__dirname, "/../../../src", filePath);
    }

    public constructor(version: string, outputFolder: string) {
        this.apiDefinition = JSON.parse(fs.readFileSync(DefinitionGenerator.resolveFile(`tools/definition-generator/v${version}/LiveVideoAnalytics.json`), "utf8"));
        this.usableNodes = JSON.parse(fs.readFileSync(DefinitionGenerator.resolveFile(`tools/definition-generator/v${version}/usableNodes.json`), "utf8"));

        this.outputFolder = outputFolder;
        this.definitions = this.apiDefinition["definitions"] as any;
        this.version = version;

        const detectedVersion = this.apiDefinition["info"]["version"] as string;

        if (detectedVersion !== version) {
            console.warn(`Warning: file version ${detectedVersion} does not match expected version ${version}. Will continue to generate as ${version}.`);
        }

        this.extractLocalizable();
        this.recursivelyExpandAllNodes();
        this.generateItemPanelNodeList();

        this.writeFiles();
    }

    private extractLocalizable() {
        // Extract all description fields
        for (const nodeName in this.definitions) {
            const node = this.definitions[nodeName];
            if (node.description) {
                const key = nodeName;
                this.localizable[nodeName] = {
                    title: nodeName,
                    description: node.description
                } as NestedLocalizedStrings;
                node.localizationKey = key;
                delete node.description;
            }

            for (const propertyName in node.properties) {
                const property = node.properties[propertyName];
                if (property.description) {
                    const key = `${nodeName}.${propertyName}`;
                    this.localizable[`${nodeName}.${propertyName}`] = {
                        title: propertyName,
                        description: property.description,
                        placeholder: property.example || ""
                    } as NestedLocalizedStrings;
                    property.localizationKey = key;
                    delete property.description;
                    delete property.example;
                }

                if (property["x-ms-enum"]) {
                    for (const value of property["x-ms-enum"].values) {
                        if (value.description) {
                            const key = `${nodeName}.${propertyName}.${value.value}`;
                            this.localizable[key] = {
                                title: value.value,
                                description: value.description
                            } as NestedLocalizedStrings;
                            value.localizationKey = key;
                            delete value.value;
                            delete value.description;
                        }
                    }
                }
            }
        }
    }

    private recursivelyExpandAllNodes() {
        // expand all nodes
        for (const name in this.definitions) {
            const definition = (this.definitions as Record<string, any>)[name];
            this.availableNodes.push({
                name,
                nodeType: this.getNodeType(definition),
                ...this.expand(definition)
            });
        }
    }

    private generateItemPanelNodeList() {
        // generate nodes shown in the drag-and-droppable item panel on the left
        this.itemPanelNodes = DefinitionGenerator.nodeTypeList.map((nodeType) => ({
            title: NodeHelpers.getNodeTypeKey(nodeType),
            id: NodeHelpers.getNodeTypeKey(nodeType),
            searchKeys: [NodeHelpers.getNodeTypeKey(nodeType)],
            children: this.availableNodes
                .filter((node) => node.nodeType === nodeType)
                .map((node) => {
                    const newNode = {
                        nodeProperties: {
                            "@type": node["x-ms-discriminator-value"],
                            name: node.name
                        },
                        nodeType: node.nodeType
                    } as CanvasNodeData;
                    return {
                        id: uuid(),
                        name: Helpers.lowercaseFirstCharacter(node.name),
                        shape: "module",
                        ports: NodeHelpers.getPorts(node),
                        data: {
                            ...NodeHelpers.getNodeAppearance(newNode),
                            ...newNode
                        }
                    };
                })
                .map((node) => ({
                    title: node.name,
                    extra: node,
                    id: uuid(),
                    searchKeys: [node.name],
                    children: []
                })),
            expanded: true
        }));
    }

    public writeFiles() {
        // write to files in appropriate versioned folder
        const base = DefinitionGenerator.resolveFile(`${this.outputFolder}/v` + this.version);

        if (!fs.existsSync(base)) {
            fs.mkdirSync(base);
        }

        fs.writeFileSync(
            base + "/nodes.json",
            JSON.stringify(
                {
                    availableNodes: this.availableNodes,
                    itemPanelNodes: this.itemPanelNodes
                },
                null,
                2
            ),
            "utf8"
        );

        fs.writeFileSync(base + "/i18n.en.json", JSON.stringify(this.localizable, null, 4), "utf8");
    }

    // returns the MediaGraphNodeType given a node definition
    private getNodeType(definition: any): MediaGraphNodeType {
        const discriminatorValue = definition["x-ms-discriminator-value"];

        if (discriminatorValue) {
            for (const type of DefinitionGenerator.nodeTypeList) {
                const key = NodeHelpers.getNodeTypeKey(type);
                if (this.usableNodes[key].includes(discriminatorValue)) {
                    return type;
                }
            }
        }

        return MediaGraphNodeType.Other;
    }

    // inline all inherited properties
    private expand(object: Record<string, any>): any {
        if (typeof object === "object") {
            for (const key in object) {
                // include all attributes of referenced object
                if (key === "allOf") {
                    object.parsedAllOf = [];
                    for (const reference of object["allOf"]) {
                        if (reference["$ref"]) {
                            object = {
                                ...this.resolvePathReference(reference["$ref"]),
                                ...object
                            };
                            object.parsedAllOf.push(reference["$ref"]);
                        }
                    }
                }
                // add all referenced attributes to current node
                if (key === "$ref") {
                    object = {
                        parsedRef: object["$ref"],
                        ...this.resolvePathReference(object["$ref"]),
                        ...object
                    };
                }
                object[key] = this.expand(object[key]);
            }
            delete object["$ref"];
            delete object.allOf;
        }
        return object;
    }

    // find matching entry in definition file
    private resolvePathReference(ref: string): any {
        ref = ref.replace("#/definitions/", "");
        let current: Record<string, any> = this.definitions;
        for (const piece of ref.split("/")) {
            current = current[piece];
        }
        return this.expand(current);
    }
}
