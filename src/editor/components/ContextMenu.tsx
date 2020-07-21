import * as React from "react";
import {
  CanvasMenu,
  ContextMenu as $ContextMenu,
  EdgeMenu,
  MultiMenu,
  NodeMenu,
  usePropsAPI,
} from "@vienna/react-dag-editor";
import Localizer from "../../localization";

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
          {Localizer.l("Copy")}
        </div>
        <div onClick={onDeleteClick} role="button">
          {Localizer.l("Delete")}
        </div>
      </NodeMenu>
      <EdgeMenu>
        <div onClick={onDeleteClick} role="button">
          {Localizer.l("Delete")}
        </div>
      </EdgeMenu>
      <MultiMenu>
        <div onClick={onCopyClick} role="button">
          {Localizer.l("Copy selected")}
        </div>
        <div onClick={onDeleteClick} role="button">
          {Localizer.l("Delete selected")}
        </div>
      </MultiMenu>
      <CanvasMenu>
        <div onClick={onPasteClick} role="button">
          {Localizer.l("Paste")}
        </div>
      </CanvasMenu>
    </$ContextMenu>
  );
};
