import * as React from "react";
import { ICanvasNode } from "@vienna/react-dag-editor";
import Definitions from "../../definitions/Definitions";
import Localizer from "../../localization/Localizer";
import { PropertyEditor } from "./PropertyEditor/PropertyEditor";

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
      {definition.description && <p>{Localizer.l(definition.description)}</p>}
      <PropertyEditor nodeProperties={nodeProperties} />
    </>
  );
};
