import * as React from "react";
import {
  IAccessibleTreeStyles,
  ITreeNode,
  ReactAccessibleTree,
} from "react-accessible-tree";
import { v4 as uuid } from "uuid";
import { ICanvasNode, Item, usePropsAPI } from "@vienna/react-dag-editor";
import Definitions from "../../definitions";
import Localizer from "../../localization";

interface IProps {
  hasNodeWithName: (name: string) => boolean;
}

export const ItemPanel: React.FunctionComponent<IProps> = (props) => {
  const [treeData, setTreeData] = React.useState<ITreeNode[]>([]);
  const propsAPI = usePropsAPI();

  const nodeWillAdd = (node: ICanvasNode): ICanvasNode => {
    // make sure this name hasn't already been used, append number if it has
    let nodeName = node.name || "";
    let duplicateCounter = 1;
    while (props.hasNodeWithName(nodeName)) {
      nodeName = (node.name || "node") + duplicateCounter;
      duplicateCounter++;
    }
    if (node.data) {
      node.data.nodeProperties.name = nodeName;
    }
    return {
      ...node,
      id: uuid(),
      name: nodeName,
    };
  };

  const nodeDidAdd = (node: ICanvasNode) => {
    // show the side panel when adding a new node
    propsAPI.selectNodeById(node.id);
  };

  if (treeData.length === 0) {
    const treeNodes: ITreeNode[] = Definitions.getItemPanelNodes().map(
      (category) => {
        const children = category.children.map((node) => {
          const internalNode = node.extra as ICanvasNode;
          return {
            title: (
              <Item
                key={node.title as string}
                model={internalNode}
                nodeWillAdd={nodeWillAdd}
                nodeDidAdd={nodeDidAdd}
              >
                <div
                  title={
                    internalNode.data &&
                    Localizer.l(internalNode.data.nodeProperties.name)
                  }
                >
                  {node.title}
                </div>
              </Item>
            ),
            id: uuid(),
            searchKeys: [node.title as string],
            children: [],
          };
        });
        category.title = Localizer.l(category.searchKeys[0] as string);
        return {
          ...category,
          children,
        };
      }
    );
    setTreeData(treeNodes);
  }

  const onChange = (nextData: ITreeNode[]) => {
    setTreeData(nextData);
  };

  const treeViewStyles: IAccessibleTreeStyles = {
    root: {
      padding: 0,
      margin: 0,
    },
    group: {
      paddingTop: 5,
      paddingLeft: 10,
    },
    item: {
      listStyle: "none",
      padding: 5,
    },
  };

  return (
    <ReactAccessibleTree
      treeData={treeData}
      onChange={onChange}
      styles={treeViewStyles}
    />
  );
};
