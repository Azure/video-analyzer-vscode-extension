import * as React from "react";
import { ICanvasNode } from "@vienna/react-dag-editor";
import Definitions from "../../definitions";
import PropertyEditor from "./PropertyEditor/PropertyEditor";
import Localizer from "../../localization";

interface INodePanelInnerProps {
  node: ICanvasNode;
}

export const NodePanelInner: React.FunctionComponent<INodePanelInnerProps> = (
  props
) => {
  const { data = {} } = props.node;

  const nodeProperties = data.nodeProperties as any;
  const definition = Definitions.getNodeDefinition(nodeProperties);

  return (
    <>
      <h2>{props.node.name}</h2>
      {definition.description && <p>{Localizer.l(definition.description)}</p>}
      <PropertyEditor nodeProperties={nodeProperties} />
    </>
  );
};
