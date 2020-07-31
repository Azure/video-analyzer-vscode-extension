import * as React from "react";
import { TextField } from "office-ui-fabric-react";
import Localizer from "../../localization/Localizer";

interface IGraphMetaEditorProps {
  name: string;
  description?: string;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
}

export const GraphMetaEditor: React.FunctionComponent<IGraphMetaEditorProps> = (
  props
) => {
  const { name, description, setName, setDescription } = props;

  const onNameChange = (event: React.FormEvent, newValue?: string) => {
    if (newValue) {
      setName(newValue);
    }
  };

  const onDescriptionChange = (event: React.FormEvent, newValue?: string) => {
    if (typeof newValue !== "undefined") {
      setDescription(newValue);
    }
  };

  return (
    <>
      <TextField
        label={Localizer.l("sidebarGraphNameLabel")}
        required
        defaultValue={name}
        placeholder={Localizer.l("sidebarGraphNamePlaceholder")}
        onChange={onNameChange}
      />
      <TextField
        label={Localizer.l("sidebarGraphDescriptionLabel")}
        defaultValue={description}
        placeholder={Localizer.l("sidebarGraphDescriptionPlaceholder")}
        onChange={onDescriptionChange}
      />
    </>
  );
};
