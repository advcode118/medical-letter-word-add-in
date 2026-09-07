import * as React from "react";
import { makeStyles, Text, tokens } from "@fluentui/react-components";
import { LetterState } from "../state/useLetterState";
import { Workspace } from "../types/workspace";
import { formatDateDisplay } from "../utils/dates";
import { joinSelectedNames } from "../utils/catalog";

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
  workspace: Workspace;
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
  const { state, workspace } = props;

  return (
    <div className={styles.root}>
      {workspace.sections
        .filter((section) => section.enabled)
        .map((section) => {
          if (section.kind === "patient") {
            return (
              <React.Fragment key={section.id}>
                <PreviewLine label="Patient" value={state.patient.patientName} />
                <PreviewLine label="Date of birth" value={formatDateDisplay(state.patient.dateOfBirth)} />
                <PreviewLine label="Reference" value={state.patient.patientId} />
              </React.Fragment>
            );
          }
          if (section.kind === "standardText") {
            return null;
          }
          if (section.kind === "catalog") {
            return (
              <PreviewLine
                key={section.id}
                label={section.name}
                value={joinSelectedNames(state.catalogSelections[section.id] ?? []).replace(/; /g, "\n")}
              />
            );
          }
          return (
            <PreviewLine key={section.id} label={section.name} value={state.textValues[section.id] ?? ""} />
          );
        })}
    </div>
  );
};

export default PreviewPanel;
