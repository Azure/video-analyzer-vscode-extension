import { relative } from "path";
import * as React from "react";
import {
    CheckboxVisibility,
    DefaultButton,
    DetailsList,
    DetailsListLayoutMode,
    IButtonStyles,
    IStyle,
    Link,
    ScrollablePane,
    SelectionMode,
    Stack,
    Text,
    TextField
} from "@fluentui/react";
import { MediaGraphParameterDeclaration } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { ParameterEditorParameterList } from "./ParameterEditorParameterList";

interface IParameterEditorAdvancedProps {
    parameters: MediaGraphParameterDeclaration[];
    setSelectedValue: (newValue: string) => void;
    prevValue: string;
}

export const ParameterEditorAdvanced: React.FunctionComponent<IParameterEditorAdvancedProps> = (props) => {
    const { parameters, setSelectedValue, prevValue } = props;
    const [value, setValue] = React.useState(prevValue);

    const renderItemList = (items: MediaGraphParameterDeclaration[], entryContainerStyles: React.CSSProperties) => {
        const buttonStyles: IButtonStyles = {
            root: {
                height: "auto",
                ...entryContainerStyles
            } as IStyle,
            flexContainer: {
                flexDirection: "column",
                alignItems: "start" as any
            },
            textContainer: {
                width: "100%"
            }
        };

        return (
            <div style={{ position: "relative", minHeight: 200 }}>
                <ScrollablePane>
                    <DetailsList
                        layoutMode={DetailsListLayoutMode.justified}
                        items={items}
                        columns={[
                            { key: "name", name: "name", fieldName: "name", minWidth: 100, isRowHeader: true },
                            { key: "type", name: "type", fieldName: "type", minWidth: 80 },
                            { key: "default", name: "default", fieldName: "default", minWidth: 80 },
                            {
                                key: "insertAction",
                                name: "",
                                minWidth: 0,
                                maxWidth: 60,
                                onRender: (item) => {
                                    return (
                                        <Link
                                            onClick={() => {
                                                appendVariableText(`$\{${item.name}}`);
                                            }}
                                        >
                                            {Localizer.l("parameterEditorAdvancedEditorInsertLinkText")}
                                        </Link>
                                    );
                                }
                            }
                        ]}
                        selectionMode={SelectionMode.none}
                        compact={true}
                    />
                </ScrollablePane>
            </div>
        );
    };

    const onChangeValue = (event: React.FormEvent, newValue?: string) => {
        if (newValue !== undefined) {
            setValue(newValue);
            setSelectedValue(newValue);
        }
    };

    const appendVariableText = (text: string) => {
        setValue(value + text);
        setSelectedValue(value + text);
    };

    return (
        <>
            <TextField
                label="Value format"
                // eslint-disable-next-line no-template-curly-in-string
                placeholder="Enter value format (ex: ${parameterName}-${System.DateTime})" //TODO. localize
                value={value}
                onChange={onChangeValue}
            />
            <ParameterEditorParameterList onAddNew={appendVariableText} renderItemList={renderItemList} parameters={parameters} />
        </>
    );
};
