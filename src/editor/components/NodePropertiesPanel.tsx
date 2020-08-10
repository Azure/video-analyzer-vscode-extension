import { Stack, IconButton } from "office-ui-fabric-react";
import * as React from "react";
import { IPanelConfig, IPropsAPI } from "@vienna/react-dag-editor";
import Localizer from "../../localization/Localizer";
import Definitions from "../../definitions/Definitions";
import { PropertyEditor } from "./PropertyEditor/PropertyEditor";

export class NodePropertiesPanel implements IPanelConfig {
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

    const nodeProperties = data.data.nodeProperties as any;
    const definition = Definitions.getNodeDefinition(nodeProperties);

    return (
      <div style={panelStyle}>
        <Stack
          horizontal
          horizontalAlign="space-between"
          tokens={{ childrenGap: "s1" }}
        >
          <h2 style={{ margin: 0 }}>{data.name}</h2>
          <IconButton
            iconProps={{
              iconName: "Clear",
            }}
            title={Localizer.l("closeButtonText")}
            ariaLabel={Localizer.l("propertyEditorCloseButtonAriaLabel")}
            onClick={this._dismissPanel}
          />
        </Stack>
        {definition.localizationKey && (
          <p>
            {
              Localizer.getLocalizedStrings(definition.localizationKey)
                .description
            }
          </p>
        )}
        <PropertyEditor nodeProperties={nodeProperties} />
      </div>
    );
  }

  private readonly _dismissPanel = () => {
    this._propsAPI.dismissSidePanel();
    this._propsAPI.selectNodeById([]);
  };
}
