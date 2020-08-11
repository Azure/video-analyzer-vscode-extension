import * as React from "react";
import {
    getCurvePathD,
    GraphEdgeState,
    hasState,
    ICanvasEdge,
    IEdgeConfig,
    IEdgeDrawArgs,
    IPropsAPI,
    ITheme
} from "@vienna/react-dag-editor";

export class CustomEdgeConfig implements IEdgeConfig {
    private readonly propsAPI: IPropsAPI;

    constructor(propsAPI: IPropsAPI) {
        this.propsAPI = propsAPI;
    }

    private isSelected(edge: ICanvasEdge) {
        return hasState(GraphEdgeState.selected | GraphEdgeState.activated | GraphEdgeState.connectedToSelected)(edge.state);
    }

    private getColor(edge: ICanvasEdge, theme: ITheme) {
        return this.isSelected(edge) ? theme.edgeColorSelected : theme.edgeColor;
    }

    public getStyle(edge: ICanvasEdge, theme: ITheme): React.CSSProperties {
        return {
            cursor: "pointer",
            stroke: this.getColor(edge, theme),
            strokeWidth: this.isSelected(edge) ? 3 : 2
        };
    }

    public render(args: IEdgeDrawArgs): React.ReactNode {
        const { theme, model: edge, x1, x2, y1, y2 } = args;
        const style = this.getStyle ? this.getStyle(edge, args.theme) : {};

        const fixedY2 = y2 - 12;
        const triangleHeadPoints = `${x2 - 3} ${fixedY2}, ${x2 + 3} ${fixedY2}, ${x2} ${fixedY2 + 6}`;
        const color = this.getColor(edge, theme);

        return (
            <>
                <path key={edge.id} d={getCurvePathD(x2, x1, fixedY2, y1)} fill="none" style={style} id={`edge${edge.id}`} />
                <polygon
                    points={triangleHeadPoints}
                    style={{
                        stroke: color,
                        fill: color,
                        strokeWidth: this.isSelected(edge) ? 3 : 2
                    }}
                />
            </>
        );
    }
}
