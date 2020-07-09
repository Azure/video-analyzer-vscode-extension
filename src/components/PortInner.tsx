import * as React from "react";
import {
  GraphPortConnectState,
  GraphPortState,
  hasState,
  ICanvasData,
  ICanvasNode,
  IPortConfig,
  useTheme,
} from "@vienna/react-dag-editor";
import { ICanvasPortCustomized } from "./Port";

interface IProps {
  data: ICanvasData;
  port: ICanvasPortCustomized;
  parentNode: ICanvasNode;
  modulePort: IPortConfig;
  x: number;
  y: number;
}

export const PortInner: React.FunctionComponent<IProps> = (props) => {
  const { port, data, modulePort, x, y, parentNode } = props;
  const { theme } = useTheme();

  const style = modulePort.getStyle
    ? modulePort.getStyle(port, parentNode, data, theme)
    : {};

  const isConnectable = modulePort.getIsConnectable(port, parentNode, data);

  const renderCircle = (
    r: number,
    circleStyle: Partial<React.CSSProperties>
  ): React.ReactNode => {
    return <circle r={r} cx={x} cy={y} style={circleStyle} />;
  };

  return (
    <g>
      <circle r="10" fill="transparent" cx={x} cy={y} />

      {isConnectable === undefined ? ( // isConnectable === undefined is when the graph is not in connecting state
        <>
          {hasState(GraphPortState.activated)(port.state)
            ? renderCircle(7, style)
            : renderCircle(5, style)}
        </>
      ) : port.connectState === GraphPortConnectState.connectingAsTarget ? (
        renderCircle(7, style)
      ) : (
        <>
          {isConnectable &&
            renderCircle(18, { fill: theme.primaryColor, opacity: 0.2 })}
          {renderCircle(5, style)}
        </>
      )}
    </g>
  );
};
