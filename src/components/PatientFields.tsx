import * as React from "react";
import { Field, Input, makeStyles } from "@fluentui/react-components";
import { LetterState } from "../state/useLetterState";

const useStyles = makeStyles({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
});

export interface PatientFieldsProps {
  state: LetterState;
  onChange: (patch: Partial<LetterState>) => void;
}

const PatientFields: React.FC<PatientFieldsProps> = (props) => {
  const styles = useStyles();

  return (
    <div className={styles.stack}>
      <Field label="Patient name">
        <Input
          value={props.state.patientName}
          onChange={(_event, data) => props.onChange({ patientName: data.value })}
          placeholder="Full name"
        />
      </Field>
      <Field label="Date of birth">
        <Input
          type="date"
          value={props.state.dateOfBirth}
          onChange={(_event, data) => props.onChange({ dateOfBirth: data.value })}
        />
      </Field>
      <Field label="Patient / reference number">
        <Input
          value={props.state.patientId}
          onChange={(_event, data) => props.onChange({ patientId: data.value })}
          placeholder="Hospital or NHS number"
        />
      </Field>
      <Field label="Date of letter">
        <Input
          type="date"
          value={props.state.letterDate}
          onChange={(_event, data) => props.onChange({ letterDate: data.value })}
        />
      </Field>
      <Field label="Clinician name">
        <Input
          value={props.state.clinicianName}
          onChange={(_event, data) => props.onChange({ clinicianName: data.value })}
        />
      </Field>
      <Field label="Clinician role">
        <Input
          value={props.state.clinicianRole}
          onChange={(_event, data) => props.onChange({ clinicianRole: data.value })}
          placeholder="e.g. Consultant Physician"
        />
      </Field>
    </div>
  );
};

export default PatientFields;
