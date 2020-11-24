import * as React from "react";
import { GraphModel, GraphNodeState, GraphPortState, hasState, ICanvasData, ICanvasNode, ICanvasPort, IPortConfig, NodeModel, useTheme } from "@vienna/react-dag-editor";
import { ICanvasPortCustomized } from "./Port";

interface IProps {
    data: GraphModel;
    port: ICanvasPortCustomized;
    parentNode: NodeModel;
    modulePort: IPortConfig;
    x: number;
    y: number;
}

const getPortSttyle = (portOriginal: ICanvasPort): Partial<React.CSSProperties> => {
    const port: ICanvasPortCustomized = portOriginal as ICanvasPortCustomized;

    const strokeWidth = 1;
    const stroke = "var(--vscode-editorWidget-border)";
    let fill = "var(--vscode-editorWidget-background)";

    if (hasState(GraphPortState.activated | GraphPortState.selected | GraphPortState.connecting)(port.state)) {
        fill = "var(--vscode-editor-selectionBackground)";
    }

    return {
        stroke,
        strokeWidth,
        fill
    };
};

export const PortInner: React.FunctionComponent<IProps> = (props) => {
    const { port, data, modulePort, x, y, parentNode } = props;
    const { theme } = useTheme();

    const style = getPortSttyle(port);

    const isConnectable = modulePort.getIsConnectable({ data, parentNode, model: port });

    const renderCircle = (r: number, circleStyle: Partial<React.CSSProperties>): React.ReactNode => {
        return <circle r={r} cx={x} cy={y} style={circleStyle} />;
    };

    const isConnectingAsTarget = hasState(GraphPortState.connectingAsTarget)(port.state);

    return (
        <g>
            <circle r="10" fill="transparent" cx={x} cy={y} />

            {isConnectable === undefined ? ( // isConnectable === undefined is when the graph is not in connecting state
                <>{hasState(GraphPortState.activated)(port.state) ? renderCircle(7, style) : renderCircle(5, style)}</>
            ) : isConnectingAsTarget ? (
                renderCircle(7, style)
            ) : (
                <>
                    {isConnectable && renderCircle(18, { fill: theme.primaryColor, opacity: 0.2 })}
                    {renderCircle(5, style)}
                </>
            )}
        </g>
    );
};
