import { Icon } from "office-ui-fabric-react";
import * as React from "react";
import { IPanelConfig, IPropsAPI } from "@vienna/react-dag-editor";
import { NodePanelInner } from "./NodePanelInner";

export class NodePanel implements IPanelConfig {
  private readonly _propsAPI: IPropsAPI;

  constructor(propsAPI: IPropsAPI) {
    this._propsAPI = propsAPI;
  }

  public render(data: any): React.ReactNode {
    const panelStyle: React.CSSProperties = {
      position: "absolute",
      right: 0,
      top: 0,
      background: "var(--vscode-editorWidget-background)",
      height: "100%",
      borderLeft: "1px solid var(--vscode-editorWidget-border)",
      width: 460,
      zIndex: 1000,
      padding: 10,
      overflowY: "auto",
    };

    return (
      <div style={panelStyle}>
        <div style={{ textAlign: "right" }} onClick={this._dismissPanel}>
          <Icon iconName="Clear" onClick={this._dismissPanel} />
        </div>
        <NodePanelInner node={data} />
      </div>
    );
  }

  private readonly _dismissPanel = () => {
    this._propsAPI.dismissSidePanel();
  };
}
