import { Stack } from "office-ui-fabric-react";
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
import { ItemPanel } from "./ItemPanel";
import { ErrorPanel } from "./ErrorPanel";
import { NodeBase } from "./NodeBase";
import { modulePort } from "./Port";
import Localizer from "../../localization";
import Graph from "../../graph/graph";
import { ValidationError } from "../../types/graphTypes";

interface IGraphProps {
  graph: Graph;
  zoomPanSettings: IZoomPanSettings;
  vsCodeSetState: (state: any) => void;
}

export const GraphHost: React.FunctionComponent<IGraphProps> = (props) => {
  const graph = props.graph;
  const [data, setData] = React.useState<ICanvasData>(graph.getICanvasData());
  const [zoomPanSettings, setZoomPanSettings] = React.useState<
    IZoomPanSettings
  >(props.zoomPanSettings);
  const [validationErrors, setValidationErrors] = React.useState<
    ValidationError[]
  >([]);

  // save state in VS Code when data or zoomPanSettings change
  React.useEffect(() => {
    props.vsCodeSetState({
      graphData: { ...data, meta: graph.getTopology() },
      zoomPanSettings,
    });
  }, [data, zoomPanSettings]);

  if (!isSupported()) {
    return <h1>{Localizer.l("Browser not supported")}</h1>;
  }

  // nodeNames maps an ID to a name, is updated on node add/remove
  const nodeNames: Record<string, string> = {};
  data.nodes.forEach((node) => {
    nodeNames[node.id] = node.name || "";
  });
  const nodeAdded = (node: ICanvasNode) => {
    nodeNames[node.id] = node.name || "";
  };
  const nodesRemoved = (nodes: Set<string>) => {
    nodes.forEach((nodeId) => delete nodeNames[nodeId]);
  };
  const hasNodeWithName = (name: string) => {
    for (const nodeId in nodeNames) {
      if (nodeNames[nodeId] === name) {
        return true;
      }
    }
    return false;
  };

  const exportGraph = () => {
    graph.setGraphDataFromICanvasData(data);

    const validationErrors = graph.validate();
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
    } else {
      setValidationErrors([]);
      const topology = graph.getTopology();
      console.log(topology);
    }
  };

  const panelStyles = {
    root: {
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
          {validationErrors.length > 0 && (
            <>
              <h2>{Localizer.l("Errors")}</h2>
              <ErrorPanel validationErrors={validationErrors} />
            </>
          )}
          <h2>{Localizer.l("Nodes")}</h2>
          <ItemPanel hasNodeWithName={hasNodeWithName} />
          <GraphPanel data={graph.getTopology()} exportGraph={exportGraph} />
        </Stack.Item>
        <Stack.Item grow>
          <InnerGraph
            data={data}
            setData={setData}
            zoomPanSettings={zoomPanSettings}
            setZoomPanSettings={setZoomPanSettings}
            canvasMouseMode={CanvasMouseMode.pan}
            onNodeAdded={nodeAdded}
            onNodeRemoved={nodesRemoved}
          />
        </Stack.Item>
      </Stack>
      <ContextMenu />
    </ReactDagEditor>
  );
};
