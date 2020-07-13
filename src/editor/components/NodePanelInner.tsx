import * as React from "react";
import { ICanvasNode } from "@vienna/react-dag-editor";
import { getNodeDefinition, localize } from "../../definitions";
import PropertyEditor from "./PropertyEditor/PropertyEditor";

interface INodePanelInnerProps {
  node: ICanvasNode;
}

export const NodePanelInner: React.FunctionComponent<INodePanelInnerProps> = (
  props
) => {
  const { data = {} } = props.node;

  const nodeProperties = data.nodeProperties as any;
  const definition = getNodeDefinition(nodeProperties);

  return (
    <>
      <h2>{props.node.name}</h2>
      {definition.description && <p>{localize(definition.description)}</p>}
      <PropertyEditor nodeProperties={nodeProperties} />
    </>
  );
};
