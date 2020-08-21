import * as React from "react";
import { useId } from "@uifabric/react-hooks";
import Localizer from "../../../Localization/Localizer";
import { PropertyDescription } from "./PropertyDescription";
import { PropertyNestedObject } from "./PropertyNestedObject";

interface IPropertyReadOnlyEditFieldProps {
    name: string;
    property: any;
    nodeProperties: any;
}

export const PropertyReadOnlyEditField: React.FunctionComponent<IPropertyReadOnlyEditFieldProps> = (props) => {
    const { name, property, nodeProperties } = props;
    const labelId: string = useId("label");

    if (property.type === "object") {
        return <PropertyNestedObject name={name} property={property} nodeProperties={nodeProperties[name]} required={false} readOnly />;
    }

    const value = nodeProperties[name];
    const needsToBeStringified = property.type !== "boolean" && property.type !== "string";
    const selectedValue = needsToBeStringified ? JSON.stringify(value) : value;

    return (
        <>
            <PropertyDescription name={name} required={false} property={property} labelId={labelId} />
            <div aria-labelledby={labelId}>{value ? selectedValue : <i>{Localizer.l("propertyEditorNoneValueLabel")}</i>}</div>
        </>
    );
};
