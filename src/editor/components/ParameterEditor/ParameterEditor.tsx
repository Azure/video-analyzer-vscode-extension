import * as React from "react";
import { useId } from "@uifabric/react-hooks";
import {
  IconButton,
  getTheme,
  mergeStyleSets,
  FontWeights,
  Modal,
  Pivot,
  PivotItem,
  Stack,
  DefaultButton,
  PrimaryButton,
} from "office-ui-fabric-react";
import Localizer from "../../../localization/Localizer";
import { ParameterEditorSimple } from "./ParameterEditorSimple";
import { ParameterEditorAdvanced } from "./ParameterEditorAdvanced";
import { MediaGraphParameterDeclaration } from "../../../lva-sdk/lvaSDKtypes";
import { ParameterizeValueCallback } from "../../../types/graphTypes";
import { createParameter } from "./createParameter";

interface IParameterEditorProps {
  onSelectValue: ParameterizeValueCallback;
  parameters: MediaGraphParameterDeclaration[];
  isShown: boolean;
  hideModal: () => void;
  propertyName: string;
}

export const ParameterEditor: React.FunctionComponent<IParameterEditorProps> = (
  props
) => {
  const { onSelectValue, parameters, isShown, hideModal, propertyName } = props;
  const [selectedValue, setSelectedValue] = React.useState<string>("");
  const [
    parameterCreationConfiguration,
    setParameterCreationConfiguration,
  ] = React.useState<MediaGraphParameterDeclaration | undefined>();

  const theme = getTheme();

  const contentStyles = mergeStyleSets({
    container: {
      display: "flex",
      flexFlow: "column nowrap",
      alignItems: "stretch",
      width: 600, // TODO: Is this too wide?
    },
    header: [
      theme.fonts.xLargePlus,
      {
        flex: "1 1 auto",
        color: theme.palette.neutralPrimary,
        display: "flex",
        alignItems: "center",
        fontWeight: FontWeights.semibold,
        padding: "12px 12px 14px 24px",
      },
    ],
    body: {
      flex: "4 4 auto",
      padding: "0 24px 24px 24px",
      overflowY: "hidden",
    },
  });

  const titleId = useId("title");

  const onClickUse = () => {
    if (parameterCreationConfiguration) {
      createParameter(parameterCreationConfiguration, parameters);
      onSelectValue(`$\{${parameterCreationConfiguration.name}}`);
    } else if (selectedValue) {
      onSelectValue(selectedValue);
    }
    hideModal();
  };

  const resetSelectedValue = () => {
    setSelectedValue("");
    setParameterCreationConfiguration(undefined);
  };

  return (
    <Modal
      titleAriaId={titleId}
      isOpen={isShown}
      onDismiss={hideModal}
      isBlocking={false}
      containerClassName={contentStyles.container}
    >
      <Stack
        horizontal
        horizontalAlign="space-between"
        className={contentStyles.header}
      >
        <span id={titleId}>Define value for {propertyName}</span>
        <IconButton
          iconProps={{ iconName: "Cancel" }}
          ariaLabel="Close popup modal"
          onClick={hideModal}
        />
      </Stack>
      <div className={contentStyles.body}>
        Create or select a parameter to insert into your value format.
        <Pivot
          aria-label="Basic Pivot Example"
          // defaultSelectedIndex={1}
          styles={{
            root: {
              marginTop: 10,
            },
            itemContainer: {
              paddingTop: 10,
            },
          }}
          onLinkClick={resetSelectedValue}
        >
          <PivotItem headerText="Basic">
            <ParameterEditorSimple
              parameters={parameters}
              setSelectedValue={setSelectedValue}
              setParameterCreationConfiguration={
                setParameterCreationConfiguration
              }
            />
          </PivotItem>
          <PivotItem headerText="Advanced">
            <ParameterEditorAdvanced
              parameters={parameters}
              setSelectedValue={setSelectedValue}
            />
          </PivotItem>
        </Pivot>
        <Stack
          horizontal
          horizontalAlign="end"
          tokens={{ childrenGap: "s1" }}
          styles={{ root: { marginTop: 20 } }}
        >
          <PrimaryButton
            text={Localizer.l("saveButtonText")}
            onClick={onClickUse}
          />
          <DefaultButton
            text={Localizer.l("cancelButtonText")}
            onClick={hideModal}
          />
        </Stack>
      </div>
    </Modal>
  );
};
