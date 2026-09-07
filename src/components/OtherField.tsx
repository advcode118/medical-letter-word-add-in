import * as React from "react";
import { Field, Textarea } from "@fluentui/react-components";

export interface OtherFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const OtherField: React.FC<OtherFieldProps> = (props) => {
  return (
    <Field
      label="Other"
      hint="Used in this letter only. Not added to your saved list."
    >
      <Textarea
        value={props.value}
        onChange={(_event, data) => props.onChange(data.value)}
        placeholder={props.placeholder ?? "Type a value that is not in the list"}
        resize="vertical"
        rows={2}
      />
    </Field>
  );
};

export default OtherField;
