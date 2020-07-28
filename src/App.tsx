import "./App.css";
import {
  loadTheme,
  DetailsList,
  DetailsListLayoutMode,
  IDetailsFooterProps,
  DetailsRow,
  IDetailsRowBaseProps,
  DetailsRowCheck,
  TextField,
  IconButton,
  IColumn,
} from "office-ui-fabric-react";
import React, { useEffect } from "react";
import { initializeIcons } from "@uifabric/icons";
import { IZoomPanSettings } from "@vienna/react-dag-editor";
import { sampleTopology } from "./dev/sampleTopologies.js";
import { GraphHost } from "./editor/components/GraphHost";
import { GraphInfo } from "./types/graphTypes";
import Graph from "./graph";

initializeIcons();
loadTheme({
  palette: {},
});

interface IProps {
  graphData?: GraphInfo;
  zoomPanSettings?: IZoomPanSettings;
  vsCodeSetState: (state: any) => void;
}

export const App: React.FunctionComponent<IProps> = (props) => {
  const [items, setItems] = React.useState<any>([]);

  useEffect(() => {
    const initItems = [];
    for (let i = 0; i < 3; i++) {
      initItems.push({
        key: i,
        name: "Item " + i,
        value: i,
      });
    }
    setItems(initItems);
  }, []);

  const graph = new Graph();

  if (props.graphData) {
    graph.setGraphData(props.graphData);
  } else {
    graph.setTopology(sampleTopology);
  }

  const columns = [
    {
      key: "name",
      name: "Name",
      fieldName: "name",
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
    {
      key: "column",
      name: "Value",
      fieldName: "value",
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
    {
      key: "buttons",
      name: "Actions",
      fieldName: "actions",
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
  ];

  function addRow() {
    const i = items.length;
    setItems([
      ...items,
      {
        key: i,
        name: "Item " + i,
        value: i,
      },
    ]);
  }

  const _renderDetailsFooterItemColumn: IDetailsRowBaseProps["onRenderItemColumn"] = (
    item,
    index,
    column
  ) => {
    if (column) {
      switch (column.key) {
        case "buttons":
          return (
            <IconButton
              iconProps={{ iconName: "Add" }}
              title="Add row"
              ariaLabel="Add row"
              onClick={addRow}
            />
          );

        default:
          return <TextField placeholder={column.name} />;
      }
    }
    return undefined;
  };

  function onRenderDetailsFooter(detailsFooterProps?: IDetailsFooterProps) {
    if (!detailsFooterProps) {
      return null;
    }
    return (
      <DetailsRow
        {...detailsFooterProps}
        columns={detailsFooterProps.columns}
        item={{}}
        itemIndex={-1}
        groupNestingDepth={detailsFooterProps.groupNestingDepth}
        selection={detailsFooterProps.selection}
        onRenderItemColumn={_renderDetailsFooterItemColumn}
      />
    );
  }

  function renderItemColumn(item?: any, index?: number, column?: IColumn) {
    if (!item || index === undefined || !column) {
      return null;
    }

    const fieldContent = item[column.fieldName as keyof any] as string;

    switch (column.key) {
      case "buttons":
        return (
          <IconButton
            iconProps={{ iconName: "Emoji2" }}
            title="Emoji"
            ariaLabel="Emoji"
          />
        );

      default:
        return fieldContent;
    }
  }

  // if there is no state to recover from (in props.graphData or zoomPanSettings), use default
  // (load sampleTopology) and 1x zoom, no translate (stored in a transformation matrix)
  // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
  return (
    <DetailsList
      items={items}
      columns={columns}
      setKey="set"
      layoutMode={DetailsListLayoutMode.justified}
      selectionPreservedOnEmptyClick={true}
      ariaLabelForSelectionColumn="Toggle selection"
      ariaLabelForSelectAllCheckbox="Toggle selection for all items"
      checkButtonAriaLabel="Row checkbox"
      onRenderItemColumn={renderItemColumn}
      onRenderDetailsFooter={onRenderDetailsFooter}
    />
    // <GraphHost
    //   graph={graph}
    //   zoomPanSettings={
    //     props.zoomPanSettings || { transformMatrix: [1, 0, 0, 1, 0, 0] }
    //   }
    //   vsCodeSetState={props.vsCodeSetState}
    // />
  );
};

export default App;
