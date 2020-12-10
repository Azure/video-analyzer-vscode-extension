import * as React from "react";
import { List, Stack, TextField } from "@fluentui/react";
import { useBoolean } from "@uifabric/react-hooks";
import { IPanelConfig, usePropsAPI } from "@vienna/react-dag-editor";
import { MediaGraphParameterDeclaration } from "../../Common/Types/LVASDKTypes";
import Definitions from "../Definitions/Definitions";
import Localizer from "../Localization/Localizer";
import { ParameterizeValueCallback } from "../Types/GraphTypes";
import { PropertyEditField } from "./PropertyEditor/PropertyEditField";
import { PropertyEditor } from "./PropertyEditor/PropertyEditor";
import { PropertyReadOnlyEditField } from "./PropertyEditor/PropertyReadonlyEditField";
import { AdjustedIconButton } from "./ThemeAdjustedComponents/AdjustedIconButton";

const ParameterEditor = React.lazy(() => import("./ParameterEditor/ParameterEditor"));

interface IEdgePropertiesPanelCoreProps {
    readOnly: boolean;
    data?: any;
}

const EdgePropertiesPanelCore: React.FunctionComponent<IEdgePropertiesPanelCoreProps> = (props) => {
    const { readOnly, data } = props;
    // const propsAPI = usePropsAPI();

    // const [isParameterModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
    // const [nodeName, setNodeName] = React.useState(data.name);
    // const [parameterizationConfiguration, setParameterizationConfiguration] = React.useState<{
    //     name: string;
    //     callback: ParameterizeValueCallback;
    //     prevValue?: string;
    // }>();

    const panelStyle: React.CSSProperties = {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        background: "var(--vscode-editor-background)",
        borderLeft: "1px solid var(--vscode-editorWidget-border)",
        width: 340,
        zIndex: 1000,
        padding: 10,
        overflowY: "auto"
    };

    // const nodeProperties = data.data.nodeProperties as any;

    // const definition = Definitions.getNodeDefinition(nodeProperties);

    // const requestParameterization = (propertyName: string, callback: ParameterizeValueCallback, prevValue?: string) => {
    //     setParameterizationConfiguration({
    //         name: propertyName,
    //         callback: callback,
    //         prevValue
    //     });
    //     showModal();
    // };
    // const setNewParameterizedValue = (newValue: string) => {
    //     if (newValue && parameterizationConfiguration?.callback) {
    //         parameterizationConfiguration?.callback(newValue);
    //     }
    // };

    // const dismissPanel = () => {
    //     propsAPI.dismissSidePanel();
    //     propsAPI.selectNodeById([]);
    // };

    const onRenderCell = (item: any, index: number): JSX.Element => {
        return (
            <div data-is-focusable>
                <div>
                    {index} &nbsp; {item.name}
                </div>
            </div>
        );
    };

    return (
        <div style={panelStyle}>
            {/* <h2>ssdfasdfasdfasdfsdfsdf</h2> */}
            {/* <List items={[{name:"all", id:"1"},{name:"video", id:"2"}{name:"audio", id:"3"},{name:"application", id:"4"}]} onRenderCell={onRenderCell}></List> */}
            {/* <Stack horizontal horizontalAlign="space-between" tokens={{ childrenGap: "s1" }}>
                <h2 style={{ margin: 0 }}>{Localizer.getLocalizedStrings(definition.localizationKey).title}</h2>
                <AdjustedIconButton
                    iconProps={{
                        iconName: "Clear"
                    }}
                    title={Localizer.l("closeButtonText")}
                    ariaLabel={Localizer.l("propertyEditorCloseButtonAriaLabel")}
                    onClick={dismissPanel}
                />
            </Stack>
            {definition.localizationKey && <p>{Localizer.getLocalizedStrings(definition.localizationKey).description}</p>}
            {readOnly ? (
                <PropertyReadOnlyEditField name={definition.name} property={definition.name} nodeProperties={nodeProperties} />
            ) : (
                <PropertyEditField
                    name={"name"}
                    property={{ localizationKey: "MediaGraph.nodeName", type: "string" }}
                    nodeProperties={nodeProperties}
                    required={true}
                    requestParameterization={requestParameterization}
                    updateNodeName={updateNodeName}
                />
            )}
            <PropertyEditor nodeProperties={nodeProperties} readOnly={readOnly} requestParameterization={requestParameterization} />
            <React.Suspense fallback={<></>}>
                <ParameterEditor
                    onSelectValue={setNewParameterizedValue}
                    parameters={parameters}
                    isShown={isParameterModalOpen}
                    hideModal={hideModal}
                    propertyName={parameterizationConfiguration?.name || ""}
                    prevValue={parameterizationConfiguration?.prevValue || ""}
                />
            </React.Suspense> */}
        </div>
    );
};

export class EdgePropertiesPanel implements IPanelConfig {
    private readonly readOnly: boolean;
    constructor(readOnly: boolean) {
        this.readOnly = readOnly;
    }
    public render(data: any): React.ReactElement {
        return <EdgePropertiesPanelCore readOnly={this.readOnly} />;
    }

    public panelDidOpen(): void {
        //
    }

    public panelDidDismiss(): void {
        //
    }
}
