import { SelectedItem } from "../types/catalog";
import { formatDateDisplay } from "../utils/dates";
import { joinSelectedNames } from "../utils/catalog";
import { LetterState } from "../state/useLetterState";

export const PLACEHOLDERS = [
  "{{PATIENT_NAME}}",
  "{{DOB}}",
  "{{PATIENT_ID}}",
  "{{LETTER_DATE}}",
  "{{CLINICIAN_NAME}}",
  "{{CLINICIAN_ROLE}}",
  "{{DIAGNOSIS}}",
  "{{MEDICATION}}",
  "{{INVESTIGATION}}",
  "{{TREATMENT}}",
  "{{ASSESSMENT}}",
  "{{PLAN}}",
  "{{FOLLOW_UP}}",
] as const;

export type PlaceholderToken = (typeof PLACEHOLDERS)[number];

export interface PlaceholderValues {
  token: PlaceholderToken;
  label: string;
  value: string;
}

export function buildPlaceholderValues(state: LetterState): PlaceholderValues[] {
  return [
    { token: "{{PATIENT_NAME}}", label: "Patient name", value: state.patientName.trim() },
    { token: "{{DOB}}", label: "Date of birth", value: formatDateDisplay(state.dateOfBirth) },
    { token: "{{PATIENT_ID}}", label: "Patient / reference number", value: state.patientId.trim() },
    {
      token: "{{LETTER_DATE}}",
      label: "Date of letter",
      value: formatDateDisplay(state.letterDate),
    },
    { token: "{{CLINICIAN_NAME}}", label: "Clinician name", value: state.clinicianName.trim() },
    { token: "{{CLINICIAN_ROLE}}", label: "Clinician role", value: state.clinicianRole.trim() },
    { token: "{{DIAGNOSIS}}", label: "Diagnosis", value: joinSelectedNames(state.diagnoses) },
    { token: "{{MEDICATION}}", label: "Medication", value: joinSelectedNames(state.medications) },
    {
      token: "{{INVESTIGATION}}",
      label: "Investigation",
      value: joinSelectedNames(state.investigations),
    },
    { token: "{{TREATMENT}}", label: "Treatment", value: joinSelectedNames(state.treatments) },
    { token: "{{ASSESSMENT}}", label: "Assessment", value: state.assessment.trim() },
    { token: "{{PLAN}}", label: "Plan", value: state.plan.trim() },
    { token: "{{FOLLOW_UP}}", label: "Follow-up", value: state.followUp.trim() },
  ];
}

export function namesOf(items: SelectedItem[]): string {
  return joinSelectedNames(items);
}
