import * as React from "react";
import { Field, Input, makeStyles } from "@fluentui/react-components";
import { PatientDetails } from "../state/useLetterState";
import OtherField from "./OtherField";

const useStyles = makeStyles({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
});

export interface PatientFieldsProps {
  patient: PatientDetails;
  onChange: (patch: Partial<PatientDetails>) => void;
  otherValue: string;
  onOtherChange: (value: string) => void;
}

const PatientFields: React.FC<PatientFieldsProps> = (props) => {
  const styles = useStyles();

  return (
    <div className={styles.stack}>
      <Field label="Patient name">
        <Input
          value={props.patient.patientName}
          onChange={(_event, data) => props.onChange({ patientName: data.value })}
          placeholder="Full name"
        />
      </Field>
      <Field label="Date of birth">
        <Input
          type="date"
          value={props.patient.dateOfBirth}
          onChange={(_event, data) => props.onChange({ dateOfBirth: data.value })}
        />
      </Field>
      <Field label="Patient / reference number">
        <Input
          value={props.patient.patientId}
          onChange={(_event, data) => props.onChange({ patientId: data.value })}
          placeholder="Hospital or NHS number"
        />
      </Field>
      <Field label="Date of letter">
        <Input
          type="date"
          value={props.patient.letterDate}
          onChange={(_event, data) => props.onChange({ letterDate: data.value })}
        />
      </Field>
      <Field label="Clinician name">
        <Input
          value={props.patient.clinicianName}
          onChange={(_event, data) => props.onChange({ clinicianName: data.value })}
        />
      </Field>
      <Field label="Clinician role">
        <Input
          value={props.patient.clinicianRole}
          onChange={(_event, data) => props.onChange({ clinicianRole: data.value })}
          placeholder="e.g. Consultant Physician"
        />
      </Field>
      <OtherField
        value={props.otherValue}
        onChange={props.onOtherChange}
        placeholder="Other patient details for this letter"
      />
    </div>
  );
};

export default PatientFields;
