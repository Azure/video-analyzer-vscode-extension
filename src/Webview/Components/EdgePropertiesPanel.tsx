import { sortedUniq, update } from "lodash";
import * as React from "react";
import {
    Checkbox,
    CheckboxVisibility,
    DetailsList,
    Dropdown,
    IColumn,
    IDropdownOption,
    Label,
    List,
    MessageBar,
    MessageBarType,
    Selection,
    SelectionMode,
    Stack,
    StackItem,
    TextField
} from "@fluentui/react";
import {
    EdgeModel,
    IPanelConfig,
    useGraphData,
    usePropsAPI
} from "@vienna/react-dag-editor";
import Localizer from "../Localization/Localizer";
import { OutputSelectorValueType } from "../Types/GraphTypes";
import { IEdgeData } from "./CustomEdgeConfig";
import { AdjustedIconButton } from "./ThemeAdjustedComponents/AdjustedIconButton";

const ParameterEditor = React.lazy(() => import("./ParameterEditor/ParameterEditor"));

interface IEdgePropertiesPanelCoreProps {
    readOnly: boolean;
    edge?: EdgeModel<IEdgeData>;
    updateEdgeData?: (edeId: string, newTypes: string[]) => void;
}

const EdgePropertiesPanelCore: React.FunctionComponent<IEdgePropertiesPanelCoreProps> = (props) => {
    const { readOnly, edge } = props;
    const propsAPI = usePropsAPI();
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
    const data = useGraphData();

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

    const types = edge?.data?.types;
    if (types && (selectedKeys !== types ?? [])) {
        setSelectedKeys(types ?? []);
    }

    let sourceName = edge?.data?.source;
    if (!sourceName) {
        sourceName = data.nodes.find((node) => node.id === edge?.source)?.name;
    }
    let targetName = edge?.data?.target;
    if (!targetName) {
        targetName = data.nodes.find((node) => node.id === edge?.target)?.name;
    }

    const panelStyle: React.CSSProperties = {
        position: "absolute",
        right: 0,
        top: 10,
        background: "var(--vscode-editor-background)",
        border: "1px solid var(--vscode-editorWidget-border)",
        borderRight: 0,
        width: 340,
        zIndex: 1000,
        padding: "0 10px 10px 10px",
        overflowY: "auto"
    };

    const dismissPanel = () => {
        propsAPI.dismissSidePanel();
        propsAPI.selectNodeById([]);
    };

    const dropdownOptions = Object.keys(OutputSelectorValueType).map((key) => {
        return {
            text: key,
            key: (OutputSelectorValueType as any)[key]
        } as IDropdownOption;
    });

    const onDropdownChange = (e: React.FormEvent, item?: IDropdownOption) => {
        if (item) {
            const keys = item.selected ? [...selectedKeys, item.key as string] : selectedKeys.filter((key) => key !== item.key);
            setSelectedKeys(keys);
            if (props?.updateEdgeData && edge?.id) props.updateEdgeData(edge.id, keys);
        }
    };

    return (
        <div style={panelStyle}>
            <Stack>
                <Stack horizontal horizontalAlign="space-between" tokens={{ childrenGap: "s1" }}>
                    <h2>Output Data</h2>
                    <AdjustedIconButton
                        iconProps={{
                            iconName: "Clear"
                        }}
                        title={Localizer.l("closeButtonText")}
                        ariaLabel={Localizer.l("propertyEditorCloseButtonAriaLabel")}
                        onClick={dismissPanel}
                    />
                </Stack>
                <Stack.Item>
                    From {sourceName} To {targetName}
                </Stack.Item>
                <Stack.Item>
                    <Dropdown options={dropdownOptions} multiSelect={true} label={"Output data"} selectedKeys={selectedKeys} onChange={onDropdownChange}></Dropdown>
                </Stack.Item>
                <Stack.Item>
                    {selectedKeys.length == 0 && <MessageBar messageBarType={MessageBarType.info}>{Localizer.l("OutputSelectorsNoneSelectedMessage")}</MessageBar>}
                </Stack.Item>
            </Stack>
        </div>
    );
};

export class EdgePropertiesPanel implements IPanelConfig {
    constructor(private readOnly: boolean, private updateEdgeData?: (edeId: string, newTypes: string[]) => void) {}
    public render(data: any): React.ReactElement {
        return <EdgePropertiesPanelCore readOnly={this.readOnly} edge={data} updateEdgeData={this.updateEdgeData} />;
    }

    public panelDidOpen(): void {
        //
    }

    public panelDidDismiss(): void {
        //
    }
}
