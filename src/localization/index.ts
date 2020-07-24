import {
  ICanvasData,
  ICanvasNode,
  ICanvasPort,
} from "@vienna/react-dag-editor";

export default class Localizer {
  private static localized: Record<string, string> = {};

  static async getLanguage(language: string) {
    const interfaceLocStrings = await import(
      /* webpackMode: "lazy" */ `./${language}.json`
    );
    const swaggerLocStrings = await import(
      /* webpackMode: "lazy" */ `../definitions/v1.0/i18n.${language}.json`
    );

    return {
      ...interfaceLocStrings,
      ...swaggerLocStrings,
    };
  }

  static async loadUserLanguage(forceLang?: string) {
    let language = forceLang || navigator.language || navigator.languages[0];
    language = language.toLowerCase().split("-")[0]; // en-US -> en

    try {
      this.localized = await this.getLanguage(language);
    } catch (error) {
      language = "en";
      this.localized = await this.getLanguage(language);
    }
  }

  static l(key: string) {
    return this.localized[key];
  }

  static getPortName(node: ICanvasNode, port: ICanvasPort) {
    const isOutputPort = port.isInputDisabled;
    const typeAsString = isOutputPort ? "output" : "input";
    return `${Localizer.l(typeAsString + "PortDescription").format(node.name)}`;
  }

  static getPortAriaLabel(
    data: ICanvasData,
    node: ICanvasNode,
    port: ICanvasPort
  ): string {
    const connectedNodeNames: string[] = [];
    const isOutputPort = port.isInputDisabled;
    if (isOutputPort) {
      // for output ports we need to find all edges starting here and
      // then get all nodes that are pointed to by the edge
      data.edges
        .filter((edge) => node.id === edge.source)
        .map((edge) =>
          data.nodes.filter((otherNode) => otherNode.id === edge.target)
        )
        .forEach((connectedNodes) => {
          // we now have a list of nodes connected to this port, add their names
          connectedNodeNames.push(
            ...connectedNodes.map((node) => node.name || "")
          );
        });
    } else {
      // for input ports use the same approach, but vice versa
      data.edges
        .filter((edge) => node.id === edge.target)
        .map((edge) =>
          data.nodes.filter((otherNode) => otherNode.id === edge.source)
        )
        .forEach((connectedNodes) => {
          connectedNodeNames.push(
            ...connectedNodes.map((node) => node.name || "")
          );
        });
    }
    const typeAsString = isOutputPort ? "output" : "input";
    return `${Localizer.getPortName(node, port)}. ${
      connectedNodeNames &&
      Localizer.l("connectedToNodes").format(connectedNodeNames.join(", "))
    }`;
  }

  static getNodeAriaLabel(node: ICanvasNode): string {
    const portNames = node.ports?.length
      ? node.ports.map((it) => it.name).join(", ")
      : "";
    return Localizer.l("nodeNameWithPorts").format(node.name, portNames);
  }
}
