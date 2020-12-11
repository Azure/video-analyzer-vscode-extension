import { fill } from "lodash";
import React, { useContext } from "react";
import { render } from "react-dom";
import { ThemeColor } from "vscode";
import {
    getCurvePathD,
    GraphEdgeState,
    hasState,
    ICanvasEdge,
    IEdgeConfig,
    IEdgeDrawArgs,
    IPropsAPI,
    ITheme,
    useGraphData
} from "@vienna/react-dag-editor";
import Localizer from "../Localization/Localizer";
import { OutputSelectorValueType } from "../Types/GraphTypes";
import { graphTheme } from "../Utils/Constants";
import AppContext from "./AppContext";

export interface IEdgeData {
    source: string;
    target: string;
    types: string[];
}

export class CustomEdgeConfig implements IEdgeConfig {
    private readonly propsAPI: IPropsAPI;

    constructor(propsAPI: IPropsAPI) {
        this.propsAPI = propsAPI;
    }

    public render(args: IEdgeDrawArgs): React.ReactNode {
        return <EdgeComponent args={args}></EdgeComponent>;
    }
}

const EdgeComponent: React.FunctionComponent<{ args: IEdgeDrawArgs }> = (props) => {
    const { theme, model: edge, x1, x2, y1, y2 } = props.args;
    const appContext = useContext(AppContext);
    //const data = useGraphData();

    // if (!edge.data) {
    //     edge.update((currentEdge) => {
    //         return {
    //             ...currentEdge,
    //             data: {
    //                 source: data.nodes.find((node) => node.id === currentEdge.source)?.name,
    //                 target: data.nodes.find((node) => node.id === currentEdge.target)?.name,
    //                 types: [OutputSelectorValueType.Video]
    //             }
    //         };
    //     });
    // }

    const isSelected = (edge: ICanvasEdge) => {
        return hasState(GraphEdgeState.selected | GraphEdgeState.activated | GraphEdgeState.connectedToSelected)(edge.state);
    };

    const getColor = (edge: ICanvasEdge, theme: ITheme) => {
        return isSelected(edge) ? theme.edgeColorSelected : theme.edgeColor;
    };

    const getStyle = (edge: ICanvasEdge, theme: ITheme): React.CSSProperties => {
        return {
            cursor: "pointer",
            stroke: getColor(edge, theme),
            strokeWidth: isSelected(edge) ? 3 : 2
        };
    };

    const getCurvePathDHorizontal = (x1: number, x2: number, y1: number, y2: number) => {
        // The ports are even width in px. and paths are 2 px. wide. We therefore subtract 1 from the HalfWidth to have them appear centered -- center of the path lines up with center of the port.
        return `M${x1},${y1}C${x1 + getControlPointDistance(x1, x2)},${y1},${x2 - 5 - getControlPointDistance(x1, x2)},${y2},${x2 - 5},${y2}`;
    };

    const getControlPointDistance = (y1: number, y2: number) => {
        return Math.min(
            5 * 15, // 5 is port height
            Math.max(5 * 3, Math.abs((y1 - (y2 + 5)) / 2))
        );
    };

    const getEdgeStringArray = (edge: ICanvasEdge<any>): string[] => {
        return !edge.data || !edge.data.types || edge.data.types.length === 3 || edge.data.types.length === 0
            ? [Localizer.l("OutputSelectorsAllSelected")]
            : edge.data.types;
    };

    const color = getColor(edge, theme);
    const style = getStyle ? getStyle(edge, props.args.theme) : {};
    const edgeString = getEdgeStringArray(edge).map((edgeString: string) => {
        return <div>{edgeString}</div>;
    });

    const verticalFixedY2 = y2 - 12;
    const verticalTriangleHeadPoints = `${x2 - 3} ${verticalFixedY2}, ${x2 + 3} ${verticalFixedY2}, ${x2} ${verticalFixedY2 + 6}`;
    const horizontalPathD = getCurvePathDHorizontal(x1, x2, y1, y2);
    const verticalPathD = getCurvePathD(x2, x1, verticalFixedY2, y1);
    const transparentPathStyle: React.CSSProperties = {
        stroke: "#fff",
        fill: "none",
        cursor: "pointer",
        strokeWidth: "20",
        visibility: "hidden"
    };

    const textWidth = 60;
    const textX = (x1 + x2 - textWidth) / 2;
    const textY = (y1 + y2) / 2;
    return appContext.isHorizontal ? (
        <>
            <path key={`${edge.id}-hidden`} d={horizontalPathD} pointerEvents="stroke" style={transparentPathStyle} />
            <path key={edge.id} d={horizontalPathD} fill="none" style={style} id={`edge${edge.id}`} />
            <foreignObject width={textWidth} x={textX} y={textY} style={{ overflow: "visible" }}>
                <div style={{ color: graphTheme.primaryColor, borderRadius: 6, transform: "translateY(-50%)", textAlign: "center", paddingBottom: 3 }}>{edgeString}</div>
            </foreignObject>
            <polygon
                points={`${x2 - 16} ${y2 - 3}, ${x2 - 16} ${y2 + 3}, ${x2 - 6} ${y2}`}
                style={{
                    stroke: color,
                    fill: color,
                    strokeWidth: isSelected(edge) ? 3 : 2
                }}
            />
        </>
    ) : (
        //);
        <>
            <path key={`${edge.id}-hidden`} d={verticalPathD} pointerEvents="stroke" style={transparentPathStyle} />
            <path key={edge.id} d={verticalPathD} fill="none" style={style} id={`edge${edge.id}`} />
            <foreignObject width={textWidth} x={textX} y={textY} style={{ overflow: "visible" }}>
                <div style={{ borderRadius: 6, transform: "translateY(-50%)", textAlign: "center", paddingBottom: 3 }}>{edgeString}</div>
            </foreignObject>
            <polygon
                points={verticalTriangleHeadPoints}
                style={{
                    stroke: color,
                    fill: color,
                    strokeWidth: isSelected(edge) ? 3 : 2
                }}
            />
        </>
    );
};
