import { Stack } from "office-ui-fabric-react";
import * as React from "react";
import { useBoolean } from "@uifabric/react-hooks";
import { IPanelConfig, IPropsAPI, usePropsAPI } from "@vienna/react-dag-editor";
import { MediaGraphParameterDeclaration } from "../../Common/Types/LVASDKTypes";
import Definitions from "../Definitions/Definitions";
import Localizer from "../Localization/Localizer";
import { ParameterizeValueCallback } from "../Types/GraphTypes";
import { ParameterEditor } from "./ParameterEditor/ParameterEditor";
import { PropertyEditor } from "./PropertyEditor/PropertyEditor";
import { AdjustedIconButton } from "./ThemeAdjustedComponents/AdjustedIconButton";

export class NodePropertiesPanel implements IPanelConfig {
    private readonly propsAPI: IPropsAPI;
    private readonly readOnly: boolean;
    private parameters: MediaGraphParameterDeclaration[];

    constructor(readOnly: boolean, parameters: MediaGraphParameterDeclaration[]) {
        this.propsAPI = usePropsAPI();
        this.readOnly = readOnly;
        this.parameters = parameters;
    }

    public render(data: any): React.ReactNode {
        const [isParameterModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
        const [parameterizationConfiguration, setParameterizationConfiguration] = React.useState<{
            name: string;
            callback: ParameterizeValueCallback;
            prevValue?: string;
        }>();

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

        const nodeProperties = data.data.nodeProperties as any;
        const definition = Definitions.getNodeDefinition(nodeProperties);

        const requestParameterization = (propertyName: string, callback: ParameterizeValueCallback, prevValue?: string) => {
            setParameterizationConfiguration({
                name: propertyName,
                callback: callback,
                prevValue
            });
            showModal();
        };
        const setNewParameterizedValue = (newValue: string) => {
            if (newValue && parameterizationConfiguration?.callback) {
                parameterizationConfiguration?.callback(newValue);
            }
        };

        return (
            <div style={panelStyle}>
                <Stack horizontal horizontalAlign="space-between" tokens={{ childrenGap: "s1" }}>
                    <h2 style={{ margin: 0 }}>{data.name}</h2>
                    <AdjustedIconButton
                        iconProps={{
                            iconName: "Clear"
                        }}
                        title={Localizer.l("closeButtonText")}
                        ariaLabel={Localizer.l("propertyEditorCloseButtonAriaLabel")}
                        onClick={this._dismissPanel}
                    />
                </Stack>
                {definition.localizationKey && <p>{Localizer.getLocalizedStrings(definition.localizationKey).description}</p>}
                <PropertyEditor nodeProperties={nodeProperties} readOnly={this.readOnly} requestParameterization={requestParameterization} />
                <ParameterEditor
                    onSelectValue={setNewParameterizedValue}
                    parameters={this.parameters}
                    isShown={isParameterModalOpen}
                    hideModal={hideModal}
                    propertyName={parameterizationConfiguration?.name || ""}
                    prevValue={parameterizationConfiguration?.prevValue || ""}
                />
            </div>
        );
    }

    private readonly _dismissPanel = () => {
        this.propsAPI.dismissSidePanel();
        this.propsAPI.selectNodeById([]);
    };
}
