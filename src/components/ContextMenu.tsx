import * as React from "react";
import {
  CanvasMenu,
  ContextMenu as $ContextMenu,
  EdgeMenu,
  MultiMenu,
  NodeMenu,
  PortMenu,
  usePropsAPI,
} from "@vienna/react-dag-editor";

export const ContextMenu: React.FunctionComponent = () => {
  const propsAPI = usePropsAPI();

  const onCopyClick = () => {
    propsAPI.copy();
  };
  const onPasteClick = (evt: React.MouseEvent) => {
    propsAPI.paste(evt.clientX, evt.clientY);
  };
  const onDeleteClick = () => {
    propsAPI.delete();
  };

  return (
    <$ContextMenu className="context-menu">
      <NodeMenu>
        <div onClick={onCopyClick} role="button">
          Copy
        </div>
        <div onClick={onDeleteClick} role="button">
          Delete
        </div>
      </NodeMenu>
      <EdgeMenu>
        <div onClick={onDeleteClick} role="button">
          Delete
        </div>
      </EdgeMenu>
      <PortMenu>
        <div>Visualization</div>
      </PortMenu>
      <MultiMenu>
        <div onClick={onCopyClick} role="button">
          Copy selected
        </div>
        <div onClick={onDeleteClick} role="button">
          Delete selected
        </div>
      </MultiMenu>
      <CanvasMenu>
        <div onClick={onPasteClick} role="button">
          Paste
        </div>
      </CanvasMenu>
    </$ContextMenu>
  );
};
