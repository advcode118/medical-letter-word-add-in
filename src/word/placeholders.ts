import { formatDateDisplay } from "../utils/dates";
import { joinSelectedNames, joinWithOther } from "../utils/catalog";
import { LetterState, PatientDetails } from "../state/useLetterState";
import { Workspace } from "../types/workspace";

export interface PlaceholderValues {
  token: string;
  label: string;
  value: string;
}

export const PATIENT_PLACEHOLDERS = [
  "{{PATIENT_NAME}}",
  "{{DOB}}",
  "{{PATIENT_ID}}",
  "{{LETTER_DATE}}",
  "{{CLINICIAN_NAME}}",
  "{{CLINICIAN_ROLE}}",
  "{{PATIENT_OTHER}}",
] as const;

function patientPlaceholderValues(patient: PatientDetails): PlaceholderValues[] {
  return [
    { token: "{{PATIENT_NAME}}", label: "Patient name", value: patient.patientName.trim() },
    { token: "{{DOB}}", label: "Date of birth", value: formatDateDisplay(patient.dateOfBirth) },
    {
      token: "{{PATIENT_ID}}",
      label: "Patient / reference number",
      value: patient.patientId.trim(),
    },
    {
      token: "{{LETTER_DATE}}",
      label: "Date of letter",
      value: formatDateDisplay(patient.letterDate),
    },
    { token: "{{CLINICIAN_NAME}}", label: "Clinician name", value: patient.clinicianName.trim() },
    { token: "{{CLINICIAN_ROLE}}", label: "Clinician role", value: patient.clinicianRole.trim() },
  ];
}

export function buildPlaceholderValues(
  workspace: Workspace,
  state: LetterState
): PlaceholderValues[] {
  const values: PlaceholderValues[] = [];

  for (const section of workspace.sections) {
    if (!section.enabled) {
      continue;
    }
    if (section.kind === "patient") {
      const other = (state.otherValues[section.id] ?? "").trim();
      values.push(...patientPlaceholderValues(state.patient));
      values.push({
        token: "{{PATIENT_OTHER}}",
        label: "Other patient details",
        value: other ? `; ${other}` : "",
      });
      continue;
    }
    if (section.kind === "standardText" || !section.placeholder) {
      continue;
    }
    const other = state.otherValues[section.id] ?? "";
    if (section.kind === "catalog") {
      values.push({
        token: section.placeholder,
        label: section.name,
        value: joinSelectedNames(state.catalogSelections[section.id] ?? [], other),
      });
      continue;
    }
    values.push({
      token: section.placeholder,
      label: section.name,
      value: joinWithOther([state.textValues[section.id] ?? ""], other, "\n\n"),
    });
  }

  return values;
}
