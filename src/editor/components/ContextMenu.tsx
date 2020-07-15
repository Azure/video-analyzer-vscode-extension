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
import { localize } from "../../localization";

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
          {localize("Copy")}
        </div>
        <div onClick={onDeleteClick} role="button">
          {localize("Delete")}
        </div>
      </NodeMenu>
      <EdgeMenu>
        <div onClick={onDeleteClick} role="button">
          {localize("Delete")}
        </div>
      </EdgeMenu>
      <MultiMenu>
        <div onClick={onCopyClick} role="button">
          {localize("Copy selected")}
        </div>
        <div onClick={onDeleteClick} role="button">
          {localize("Delete selected")}
        </div>
      </MultiMenu>
      <CanvasMenu>
        <div onClick={onPasteClick} role="button">
          {localize("Paste")}
        </div>
      </CanvasMenu>
    </$ContextMenu>
  );
};
