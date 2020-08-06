import * as React from "react";
import {
  TextField,
  Text,
  FontIcon,
  Stack,
  Link,
  DefaultButton,
  IStyle,
  IButtonStyles,
} from "office-ui-fabric-react";
import { ParameterEditorParameterList } from "./ParameterEditorParameterList";
import { MediaGraphParameterDeclaration } from "../../../lva-sdk/lvaSDKtypes";

interface IParameterEditorAdvancedProps {
  parameters: MediaGraphParameterDeclaration[];
  setSelectedValue: (newValue: string) => void;
}

export const ParameterEditorAdvanced: React.FunctionComponent<IParameterEditorAdvancedProps> = (
  props
) => {
  const { parameters, setSelectedValue } = props;
  const [value, setValue] = React.useState("");

  const iconStyles = {
    padding: 2,
  };

  const renderItemList = (
    items: MediaGraphParameterDeclaration[],
    entryContainerStyles: React.CSSProperties,
    entryDetailsStyles: React.CSSProperties
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
                  <Stack
                    horizontal
                    verticalAlign="center"
                    tokens={{ childrenGap: "s1" }}
                  >
                    <FontIcon iconName={"Variable2"} style={iconStyles} />
                    <strong>{props!.text}</strong>
                  </Stack>
                  <Link>Insert</Link>
                </Stack>
              )}
              onRenderChildren={() => (
                <div style={entryDetailsStyles}>
                  <Text variant={"medium"}>{item.type}</Text>
                </div>
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
        showAddNew
        renderItemList={renderItemList}
        parameters={parameters}
      />
    </>
  );
};
