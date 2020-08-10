import * as React from "react";
import { useId } from "@uifabric/react-hooks";
import Localizer from "../../../localization/Localizer";
import { PropertyDescription } from "./PropertyDescription";
import { PropertyNestedObject } from "./PropertyNestedObject";

interface IPropertyReadOnlyEditFieldProps {
    name: string;
    property: any;
    nodeProperties: any;
    required: boolean;
}

export const PropertyReadOnlyEditField: React.FunctionComponent<IPropertyReadOnlyEditFieldProps> = (props) => {
    const { name, property, nodeProperties, required } = props;

    const value = nodeProperties[name];

    const labelId: string = useId("label");

    if (property.type === "object") {
        return <PropertyNestedObject name={name} property={property} nodeProperties={nodeProperties[name]} required={required} readOnly />;
    }

    const selectedValue = property.type !== "boolean" && property.type !== "string" ? JSON.stringify(value) : value;

    return (
        <>
            <PropertyDescription name={name} required={required} property={property} labelId={labelId} />
            <div aria-labelledby={labelId}>{value ? selectedValue : <i>{Localizer.l("propertyEditorNoneValueLabel")}</i>}</div>
        </>
    );
};
