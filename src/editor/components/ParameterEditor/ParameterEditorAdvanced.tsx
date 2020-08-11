import * as React from "react";
import {
  TextField,
  Text,
  Stack,
  Link,
  DefaultButton,
  IStyle,
  IButtonStyles,
} from "office-ui-fabric-react";
import { ParameterEditorParameterList } from "./ParameterEditorParameterList";
import { MediaGraphParameterDeclaration } from "../../../lva-sdk/lvaSDKtypes";
import Localizer from "../../../localization/Localizer";

interface IParameterEditorAdvancedProps {
  parameters: MediaGraphParameterDeclaration[];
  setSelectedValue: (newValue: string) => void;
  prevValue: string;
}

export const ParameterEditorAdvanced: React.FunctionComponent<IParameterEditorAdvancedProps> = (
  props
) => {
  const { parameters, setSelectedValue, prevValue } = props;
  const [value, setValue] = React.useState(prevValue);

  const renderItemList = (
    items: MediaGraphParameterDeclaration[],
    entryContainerStyles: React.CSSProperties
  ) => {
    const buttonStyles: IButtonStyles = {
      root: {
        height: "auto",
        ...entryContainerStyles,
      } as IStyle,
      flexContainer: {
        flexDirection: "column",
        alignItems: "start" as any,
      },
      textContainer: {
        width: "100%",
      },
    };

    return (
      <Stack tokens={{ childrenGap: "s1" }}>
        {items.map((item) => {
          const appendVariable = () => {
            appendText(`$\{${item.name}}`);
          };

          return (
            <DefaultButton
              text={item.name}
              styles={buttonStyles}
              onClick={appendVariable}
              onRenderText={(props) => (
                <Stack
                  horizontal
                  horizontalAlign="space-between"
                  verticalAlign="center"
                  tokens={{ childrenGap: "s1" }}
                >
                  <strong>{props!.text}</strong>
                  <Link>
                    {Localizer.l("parameterEditorAdvancedEditorInsertLinkText")}
                  </Link>
                </Stack>
              )}
              onRenderChildren={() => (
                <Text variant={"medium"}>{item.type}</Text>
              )}
            />
          );
        })}
      </Stack>
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
        placeholder="Enter value format (ex: ${parameterName}-${System.DateTime})"
        value={value}
        onChange={onChangeValue}
      />
      <ParameterEditorParameterList
        onAddNew={appendText}
        renderItemList={renderItemList}
        parameters={parameters}
      />
    </>
  );
};
