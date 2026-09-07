import * as React from "react";
import { Button, Field, Textarea, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  actions: {
    display: "flex",
    marginTop: "8px",
  },
});

export interface TextSectionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  insertLabel: string;
  onInsert: () => void;
}

const TextSection: React.FC<TextSectionProps> = (props) => {
  const styles = useStyles();

  return (
    <div>
      <Field label={props.label}>
        <Textarea
          value={props.value}
          onChange={(_event, data) => props.onChange(data.value)}
          placeholder={props.placeholder}
          resize="vertical"
          rows={4}
        />
      </Field>
      <div className={styles.actions}>
        <Button appearance="primary" size="small" onClick={props.onInsert} disabled={!props.value.trim()}>
          {props.insertLabel}
        </Button>
      </div>
    </div>
  );
};

export default TextSection;
