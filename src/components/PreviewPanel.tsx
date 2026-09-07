import * as React from "react";
import { makeStyles, Text, tokens } from "@fluentui/react-components";
import { LetterState } from "../state/useLetterState";
import { formatDateDisplay } from "../utils/dates";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  block: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  label: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
  },
  empty: {
    color: tokens.colorNeutralForeground3,
  },
});

export interface PreviewPanelProps {
  state: LetterState;
}

const PreviewLine: React.FC<{ label: string; value: string }> = (props) => {
  const styles = useStyles();
  return (
    <div className={styles.block}>
      <Text className={styles.label} size={200}>
        {props.label}
      </Text>
      {props.value ? (
        <Text size={200}>{props.value}</Text>
      ) : (
        <Text className={styles.empty} size={200}>
          Not set
        </Text>
      )}
    </div>
  );
};

const PreviewPanel: React.FC<PreviewPanelProps> = (props) => {
  const styles = useStyles();
  const { state } = props;

  return (
    <div className={styles.root}>
      <PreviewLine label="Patient" value={state.patientName} />
      <PreviewLine label="Date of birth" value={formatDateDisplay(state.dateOfBirth)} />
      <PreviewLine label="Reference" value={state.patientId} />
      <PreviewLine label="Diagnosis" value={state.diagnoses.map((item) => item.name).join("\n")} />
      <PreviewLine label="Medication" value={state.medications.map((item) => item.name).join("\n")} />
      <PreviewLine label="Investigation" value={state.investigations.map((item) => item.name).join("\n")} />
      <PreviewLine label="Treatment" value={state.treatments.map((item) => item.name).join("\n")} />
      <PreviewLine label="Assessment" value={state.assessment} />
      <PreviewLine label="Plan" value={state.plan} />
      <PreviewLine label="Follow-up" value={state.followUp} />
    </div>
  );
};

export default PreviewPanel;
