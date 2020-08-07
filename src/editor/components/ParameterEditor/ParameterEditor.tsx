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
import { SignatureHelpTriggerKind } from "vscode";

interface IParameterEditorProps {
  onSelectValue: ParameterizeValueCallback;
  parameters: MediaGraphParameterDeclaration[];
  isShown: boolean;
  hideModal: () => void;
  propertyName: string;
  prevValue?: string;
}

export const ParameterEditor: React.FunctionComponent<IParameterEditorProps> = (
  props
) => {
  const {
    onSelectValue,
    parameters,
    isShown,
    hideModal,
    propertyName,
    prevValue = "",
  } = props;
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
      width: 600, // TODO: Is this too wide?
    },
    scrollContainer: {
      display: "flex",
      flexDirection: "column",
    },
    header: [
      theme.fonts.xLargePlus,
      {
        color: theme.palette.neutralPrimary,
        display: "flex",
        alignItems: "center",
        fontWeight: FontWeights.semibold,
        padding: "12px 12px 14px 24px",
      },
    ],
    body: {
      flex: 1,
      padding: "0 24px",
      overflowY: "auto",
    },
    footer: {
      padding: 24,
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
      scrollableContentClassName={contentStyles.scrollContainer}
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
              resetSelectedValue={resetSelectedValue}
            />
          </PivotItem>
          <PivotItem headerText="Advanced">
            <ParameterEditorAdvanced
              parameters={parameters}
              setSelectedValue={setSelectedValue}
              prevValue={prevValue}
            />
          </PivotItem>
        </Pivot>
      </div>
      <Stack
        horizontal
        horizontalAlign="end"
        tokens={{ childrenGap: "s1" }}
        className={contentStyles.footer}
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
    </Modal>
  );
};
