import * as React from "react";
import { Button, Field, Textarea, makeStyles } from "@fluentui/react-components";
import OtherField from "./OtherField";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  actions: {
    display: "flex",
  },
});

export interface TextSectionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  insertLabel: string;
  onInsert: () => void;
  insertDisabled?: boolean;
  otherValue: string;
  onOtherChange: (value: string) => void;
}

const TextSection: React.FC<TextSectionProps> = (props) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Field label={props.label}>
        <Textarea
          value={props.value}
          onChange={(_event, data) => props.onChange(data.value)}
          placeholder={props.placeholder}
          resize="vertical"
          rows={4}
        />
      </Field>
      <OtherField
        value={props.otherValue}
        onChange={props.onOtherChange}
        placeholder={`Other ${props.label.toLowerCase()}`}
      />
      <div className={styles.actions}>
        <Button
          appearance="primary"
          size="small"
          onClick={props.onInsert}
          disabled={props.insertDisabled ?? !props.value.trim()}
        >
          {props.insertLabel}
        </Button>
      </div>
    </div>
  );
};

export default TextSection;
