import {
    DefaultButton,
    IButtonStyles
} from "office-ui-fabric-react/lib/Button";
import {
    DetailsList,
    DetailsListLayoutMode,
    SelectionMode
} from "office-ui-fabric-react/lib/DetailsList";
import { Link } from "office-ui-fabric-react/lib/Link";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { IStyle } from "office-ui-fabric-react/lib/Styling";
import { Text } from "office-ui-fabric-react/lib/Text";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import * as React from "react";
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
            <DetailsList
                items={items}
                columns={[
                    { key: "name", name: "name", fieldName: "name", minWidth: 10 },
                    { key: "type", name: "type", fieldName: "type", minWidth: 10 },
                    { key: "default", name: "default", fieldName: "default", minWidth: 10 }
                ]}
                selectionMode={SelectionMode.single}
            />
            // <Stack tokens={{ childrenGap: "s1" }}>
            //     {items.map((item) => {
            //         const appendVariable = () => {
            //             appendText(`$\{${item.name}}`);
            //         };

            //         return (
            //             <DefaultButton
            //                 text={item.name}
            //                 styles={buttonStyles}
            //                 onClick={appendVariable}
            //                 onRenderText={(props) => (
            //                     <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: "s1" }}>
            //                         <strong>{props!.text}</strong>
            //                         <Link>{Localizer.l("parameterEditorAdvancedEditorInsertLinkText")}</Link>
            //                     </Stack>
            //                 )}
            //                 onRenderChildren={() => <Text variant={"medium"}>{item.type}</Text>}
            //             />
            //         );
            //     })}
            // </Stack>
        );
    };

    const onChangeValue = (event: React.FormEvent, newValue?: string) => {
        if (newValue !== undefined) {
            setValue(newValue);
            setSelectedValue(newValue);
        }
    };

    const appendText = (text: string) => {
        setValue(value + text);
        setSelectedValue(value + text);
    };

    return (
        <>
            <TextField
                label="Value format"
                // eslint-disable-next-line no-template-curly-in-string
                placeholder="Enter value format (ex: ${parameterName}-${System.DateTime})"
                value={value}
                onChange={onChangeValue}
            />
            <ParameterEditorParameterList onAddNew={appendText} renderItemList={renderItemList} parameters={parameters} />
        </>
    );
};
