import * as React from "react";
import { useBoolean } from "@uifabric/react-hooks";
import {
  getTheme,
  SearchBox,
  Stack,
  DefaultButton,
  Link,
} from "office-ui-fabric-react";
import {
  MediaGraphParameterDeclaration,
  MediaGraphParameterType,
} from "../../../lva-sdk/lvaSDKtypes";
import { ParameterEditorCreateForm } from "./ParameterEditorCreateForm";
import { createParameter } from "./createParameter";

interface IParameterEditorParameterListProps {
  parameters: MediaGraphParameterDeclaration[];
  onAddNew?: (newValue: string) => void;
  renderItemList: (
    items: MediaGraphParameterDeclaration[],
    entryContainerStyles: React.CSSProperties,
    entryDetailsStyles: React.CSSProperties
  ) => JSX.Element; // TODO: fix
}

export const ParameterEditorParameterList: React.FunctionComponent<IParameterEditorParameterListProps> = (
  props
) => {
  const { parameters, onAddNew, renderItemList } = props;
  const [shownFilteredItems, setShownFilteredItems] = React.useState<
    MediaGraphParameterDeclaration[]
  >([]);
  const [isCreateFormShown, { toggle: toggleCreateForm }] = useBoolean(false);
  const [
    parameterCreationConfiguration,
    setParameterCreationConfiguration,
  ] = React.useState<MediaGraphParameterDeclaration | undefined>();

  const items: MediaGraphParameterDeclaration[] = [
    ...parameters,
    {
      name: "System.DateTime",
      type: "String" as MediaGraphParameterType,
    },
    {
      name: "System.PreciseDateTime",
      type: "String" as MediaGraphParameterType,
    },
    {
      name: "System.GraphTopologyName",
      type: "String" as MediaGraphParameterType,
    },
    {
      name: "System.GraphInstanceName",
      type: "String" as MediaGraphParameterType,
    },
  ];

  const onSearchChange = (event?: React.ChangeEvent, newValue?: string) => {
    if (newValue) {
      const lowerCaseQuery = newValue.toLocaleLowerCase();
      setShownFilteredItems(
        items.filter((item) =>
          item.name.toLocaleLowerCase().includes(lowerCaseQuery)
        )
      );
    } else {
      setShownFilteredItems([]);
    }
  };

  const onCreateFormAddClick = () => {
    if (parameterCreationConfiguration && onAddNew) {
      createParameter(parameterCreationConfiguration, parameters);
      onAddNew(`$\{${parameterCreationConfiguration.name}}`);
    }
  };

  const theme = getTheme();
  const parameterListStyles = {
    marginTop: 20,
  };
  const parameterListItemContainerStyles = {
    width: "100%",
  };
  const parameterListEntryStyles = {
    border: "1px solid",
    borderColor: theme.palette.neutralTertiary,
    borderRadius: 2,
    padding: 10,
  };
  const parameterListEntryDetailsStyles = {
    paddingLeft: 26,
    color: theme.palette.neutralSecondary,
  };

  return (
    <Stack tokens={{ childrenGap: "s1" }} style={parameterListStyles}>
      {isCreateFormShown && (
        <div
          style={{
            // minWidth: 260,
            // marginTop: -5,
            marginBottom: 10,
          }}
        >
          <ParameterEditorCreateForm
            setParameterCreationConfiguration={
              setParameterCreationConfiguration
            }
          />
          <Stack
            horizontal
            horizontalAlign="end"
            tokens={{ childrenGap: "s1" }}
            styles={{ root: { marginTop: 10 } }}
          >
            <Link onClick={toggleCreateForm}>Hide form</Link>
            <DefaultButton text="Add" onClick={onCreateFormAddClick} />
          </Stack>
        </div>
      )}
      <Stack
        tokens={{ childrenGap: "s1" }}
        style={parameterListItemContainerStyles}
      >
        <Stack horizontal tokens={{ childrenGap: "s1" }}>
          <SearchBox
            placeholder="Search"
            onChange={onSearchChange}
            styles={{ root: { flexGrow: 1 } }}
          />
          {onAddNew && !isCreateFormShown && (
            <DefaultButton
              text="Add new"
              iconProps={{ iconName: "Add" }}
              onClick={toggleCreateForm}
            />
          )}
        </Stack>
        {renderItemList(
          shownFilteredItems.length > 0 ? shownFilteredItems : items,
          parameterListEntryStyles,
          parameterListEntryDetailsStyles
        )}
      </Stack>
    </Stack>
  );
};
