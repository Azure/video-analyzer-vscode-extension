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
          {Localizer.l("copy")}
        </div>
        <div onClick={onDeleteClick} role="button">
          {Localizer.l("delete")}
        </div>
      </NodeMenu>
      <EdgeMenu>
        <div onClick={onDeleteClick} role="button">
          {Localizer.l("delete")}
        </div>
      </EdgeMenu>
      <MultiMenu>
        <div onClick={onCopyClick} role="button">
          {Localizer.l("copySelected")}
        </div>
        <div onClick={onDeleteClick} role="button">
          {Localizer.l("deleteSelected")}
        </div>
      </MultiMenu>
      <CanvasMenu>
        <div onClick={onPasteClick} role="button">
          {Localizer.l("paste")}
        </div>
      </CanvasMenu>
    </$ContextMenu>
  );
};
