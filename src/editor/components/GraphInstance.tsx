import { Stack, TextField } from "office-ui-fabric-react";
import * as React from "react";
import {
  CanvasMouseMode,
  ICanvasData,
  ICanvasNode,
  isSupported,
  IZoomPanSettings,
  ReactDagEditor,
  RegisterNode,
  RegisterPort,
  withDefaultPortsPosition,
} from "@vienna/react-dag-editor";
import { graphTheme as theme } from "../editorTheme";
import { ContextMenu } from "./ContextMenu";
import { GraphPanel } from "./GraphPanel";
import { InnerGraph } from "./InnerGraph";
import { NodeBase } from "./NodeBase";
import { modulePort } from "./Port";
import Localizer from "../../localization/Localizer";
import Graph from "../../graph/Graph";
import { Toolbar } from "./Toolbar";

interface IGraphInstanceProps {
  graph: Graph;
  zoomPanSettings: IZoomPanSettings;
  vsCodeSetState: (state: any) => void;
}

export const GraphInstance: React.FunctionComponent<IGraphInstanceProps> = (
  props
) => {
  const graph = props.graph;
  const [data, setData] = React.useState<ICanvasData>(graph.getICanvasData());
  const [zoomPanSettings, setZoomPanSettings] = React.useState<
    IZoomPanSettings
  >(props.zoomPanSettings);
  const [graphInstanceName, setGraphInstanceName] = React.useState<string>(
    graph.getName()
  );
  const [graphDescription, setGraphDescription] = React.useState<string>(
    graph.getDescription() || ""
  );

  // save state in VS Code when data or zoomPanSettings change
  React.useEffect(() => {
    props.vsCodeSetState({
      graphData: { ...data, meta: graph.getTopology() },
      zoomPanSettings,
    });
  }, [data, zoomPanSettings]);

  if (!isSupported()) {
    return <h1>{Localizer.l("browserNotSupported")}</h1>;
  }

  const exportGraph = () => {
    graph.setName(graphInstanceName);
    graph.setDescription(graphDescription);
    graph.setGraphDataFromICanvasData(data);
    const topology = graph.getTopology();
    console.log(topology);
  };

  const onNameChange = (event: React.FormEvent, newValue?: string) => {
    if (newValue) {
      setGraphInstanceName(newValue);
    }
  };

  const onDescriptionChange = (event: React.FormEvent, newValue?: string) => {
    if (typeof newValue !== "undefined") {
      setGraphDescription(newValue);
    }
  };

  const panelStyles = {
    root: {
      boxSizing: "border-box" as const,
      padding: 10,
      overflowY: "auto" as const,
      willChange: "transform",
      height: "100vh",
      width: 300,
      background: "var(--vscode-editorWidget-background)",
      borderRight: "1px solid var(--vscode-editorWidget-border)",
    },
  };

  return (
    <ReactDagEditor theme={theme}>
      <RegisterNode
        name="module"
        config={withDefaultPortsPosition(new NodeBase())}
      />
      <RegisterPort name="modulePort" config={modulePort} />
      <Stack horizontal>
        <Stack.Item styles={panelStyles}>
          <TextField
            label={Localizer.l("sidebarGraphInstanceNameLabel")}
            required
            defaultValue={graphInstanceName}
            placeholder={Localizer.l("sidebarGraphInstanceNamePlaceholder")}
            onChange={onNameChange}
          />
          <TextField
            label={Localizer.l("sidebarGraphDescriptionLabel")}
            defaultValue={graphDescription}
            placeholder={Localizer.l("sidebarGraphDescriptionPlaceholder")}
            onChange={onDescriptionChange}
          />
          <GraphPanel data={graph.getTopology()} exportGraph={exportGraph} />
        </Stack.Item>
        <Stack.Item grow>
          <Toolbar
            name={graphInstanceName}
            exportGraph={exportGraph}
            closeEditor={() => {
              alert("TODO: Close editor");
            }}
          />
          <Stack.Item grow>
            <InnerGraph
              data={data}
              setData={setData}
              zoomPanSettings={zoomPanSettings}
              setZoomPanSettings={setZoomPanSettings}
              canvasMouseMode={CanvasMouseMode.pan}
              readOnly
            />
          </Stack.Item>
        </Stack.Item>
      </Stack>
      <ContextMenu />
    </ReactDagEditor>
  );
};
