import * as React from "react";
import {
  getCurvePathD,
  GraphEdgeState,
  hasState,
  ICanvasEdge,
  IEdgeConfig,
  IEdgeDrawArgs,
  IPropsAPI,
  ITheme,
} from "@vienna/react-dag-editor";

export class CustomEdgeConfig implements IEdgeConfig {
  private readonly propsAPI: IPropsAPI;

  constructor(propsAPI: IPropsAPI) {
    this.propsAPI = propsAPI;
  }

  public getStyle(edge: ICanvasEdge, theme: ITheme): React.CSSProperties {
    return {
      cursor: "pointer",
      stroke: hasState(
        GraphEdgeState.selected |
          GraphEdgeState.activated |
          GraphEdgeState.connectedToSelected
      )(edge.state)
        ? theme.edgeColorSelected
        : theme.edgeColor,
      strokeWidth: "5",
    };
  }

  public render(args: IEdgeDrawArgs): React.ReactNode {
    const edge = args.model;
    const style = this.getStyle ? this.getStyle(edge, args.theme) : {};

    return (
      <>
        <path
          key={edge.id}
          d={getCurvePathD(args.x2, args.x1, args.y2, args.y1)}
          fill="none"
          style={style}
          id={`edge${edge.id}`}
        />
      </>
    );
  }
}
