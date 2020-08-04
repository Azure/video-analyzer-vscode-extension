import * as React from "react";
import Localizer from "../../localization/Localizer";
import { MediaGraphTopology } from "../../lva-sdk/lvaSDKtypes";
import { PrimaryButton, Stack, DefaultButton } from "office-ui-fabric-react";

export interface IGraphPanelProps {
  name: string;
  closeEditor: () => void;
  exportGraph: () => void;
}

export const Toolbar: React.FunctionComponent<IGraphPanelProps> = (props) => {
  const toolbarStyles = {
    padding: 10,
    background: "var(--vscode-editorWidget-background)",
    borderBottom: "1px solid var(--vscode-editorWidget-border)",
  };

  return (
    <Stack
      horizontal
      horizontalAlign="space-between"
      verticalAlign="center"
      tokens={{ childrenGap: "s1" }}
      style={toolbarStyles}
    >
      <div>{props.name}</div>
      <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: "s1" }}>
        <DefaultButton
          text={Localizer.l("cancelButtonText")}
          onClick={props.closeEditor}
        />
        <PrimaryButton
          text={Localizer.l("saveButtonText")}
          onClick={props.exportGraph}
        />
      </Stack>
    </Stack>
  );
};
