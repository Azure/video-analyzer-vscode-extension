import * as React from "react";
import { Stack, IconButton } from "office-ui-fabric-react";
import { useBoolean } from "@uifabric/react-hooks";
import { IPanelConfig, IPropsAPI } from "@vienna/react-dag-editor";
import Localizer from "../../localization/Localizer";
import Definitions from "../../definitions/Definitions";
import { PropertyEditor } from "./PropertyEditor/PropertyEditor";
import { MediaGraphParameterDeclaration } from "../../lva-sdk/lvaSDKtypes";
import { ParameterEditor } from "./ParameterEditor/ParameterEditor";
import { ParameterizeValueCallback } from "../../types/graphTypes";

export class NodePropertiesPanel implements IPanelConfig {
  private readonly _propsAPI: IPropsAPI;
  private parameters: MediaGraphParameterDeclaration[];

  constructor(
    propsAPI: IPropsAPI,
    parameters: MediaGraphParameterDeclaration[]
  ) {
    this._propsAPI = propsAPI;
    this.parameters = parameters;
  }

  public render(data: any): React.ReactNode {
    const [
      isParameterModalOpen,
      { setTrue: showModal, setFalse: hideModal },
    ] = useBoolean(false);
    const [
      parameterizationConfiguration,
      setParameterizationConfiguration,
    ] = React.useState<{
      name: string;
      callback: ParameterizeValueCallback;
      prevValue?: string;
    }>();

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

    const requestParameterization = (
      propertyName: string,
      callback: ParameterizeValueCallback,
      prevValue?: string
    ) => {
      setParameterizationConfiguration({
        name: propertyName,
        callback: callback,
        prevValue,
      });
      showModal();
    };
    const setNewParameterizedValue = (newValue: string) => {
      if (newValue && parameterizationConfiguration?.callback) {
        parameterizationConfiguration?.callback(newValue);
      }
    };

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
        {definition.description && <p>{Localizer.l(definition.description)}</p>}
        <PropertyEditor
          nodeProperties={nodeProperties}
          requestParameterization={requestParameterization}
        />
        <ParameterEditor
          onSelectValue={setNewParameterizedValue}
          parameters={this.parameters}
          isShown={isParameterModalOpen}
          hideModal={hideModal}
          propertyName={parameterizationConfiguration?.name || ""}
          prevValue={parameterizationConfiguration?.prevValue || ""}
        />
      </div>
    );
  }

  private readonly _dismissPanel = () => {
    this._propsAPI.dismissSidePanel();
    this._propsAPI.selectNodeById([]);
  };
}
