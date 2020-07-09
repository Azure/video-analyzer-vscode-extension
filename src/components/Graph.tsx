import { Stack } from "office-ui-fabric-react";
import * as React from "react";
import {
  isSupported,
  ICanvasData,
  ICanvasNode,
  IZoomPanSettings,
  ReactDagEditor,
  RegisterNode,
  RegisterPort,
  withDefaultPortsPosition,
  CanvasMouseMode,
} from "@vienna/react-dag-editor";
import { GraphPanel } from "./GraphPanel";
import { ContextMenu } from "./ContextMenu";
import { InnerGraph } from "./InnerGraph";
import { ItemPanel } from "./ItemPanel";
import { NodeBase } from "./NodeBase";
import { modulePort } from "./Port";
import { GraphInfo } from "../data/graphTypes";
import { convertGraphToTopology } from "../data/exportGraph";
import { graphTheme as theme } from "../data/graphTheme";

interface IGraphProps {
  initData: GraphInfo;
  initZoomPanSettings: IZoomPanSettings;
  vsCodeSetState: (state: any) => void;
}

export const Graph: React.FunctionComponent<IGraphProps> = (props) => {
  const [data, setData] = React.useState<GraphInfo>(props.initData);
  const [zoomPanSettings, setZoomPanSettings] = React.useState<
    IZoomPanSettings
  >(props.initZoomPanSettings);

  // save state in VS Code when data or zoomPanSettings change
  React.useEffect(() => {
    data.meta = props.initData.meta;
    props.vsCodeSetState({ data, zoomPanSettings });
  }, [data, zoomPanSettings]);

  if (!isSupported()) {
    return <h1>Browser not supported</h1>;
  }

  // nodeNames maps from ID to name, is updated on node add/remove
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
    const topology = convertGraphToTopology(data, props.initData.meta);
    console.log(topology);
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
          <h2>Nodes</h2>
          <ItemPanel hasNodeWithName={hasNodeWithName} />
          <GraphPanel data={data.meta} exportGraph={exportGraph} />
        </Stack.Item>
        <Stack.Item grow>
          <InnerGraph
            data={data}
            setData={
              setData as React.Dispatch<React.SetStateAction<ICanvasData>>
            }
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
