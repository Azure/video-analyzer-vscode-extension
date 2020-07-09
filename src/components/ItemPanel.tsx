import * as React from "react";
import {
  IAccessibleTreeStyles,
  ITreeNode,
  ReactAccessibleTree,
} from "react-accessible-tree";
import { v4 as uuid } from "uuid";
import { ICanvasNode, Item, usePropsAPI } from "@vienna/react-dag-editor";
import { itemPanelNodes } from "../definitions";

interface IProps {
  hasNodeWithName: (name: string) => boolean;
}

export const ItemPanel: React.FunctionComponent<IProps> = (props) => {
  const [treeData, setTreeData] = React.useState<ITreeNode[]>([]);
  const propsAPI = usePropsAPI();

  const nodeWillAdd = (node: ICanvasNode): ICanvasNode => {
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
    propsAPI.selectNodeById(node.id);
  };

  if (treeData.length === 0) {
    const treeNodes: ITreeNode[] = itemPanelNodes.map((category) => {
      const children = category.children.map((node) => {
        node.extra = node.extra as ICanvasNode;
        return {
          title: (
            <Item
              key={node.title as string}
              model={node.extra}
              nodeWillAdd={nodeWillAdd}
              nodeDidAdd={nodeDidAdd}
            >
              {node.title}
            </Item>
          ),
          id: uuid(),
          searchKeys: [node.title as string],
          children: [],
        };
      });
      return {
        ...category,
        children,
      };
    });
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
