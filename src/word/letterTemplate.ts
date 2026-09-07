import { PATIENT_PLACEHOLDERS } from "./placeholders";
import { Workspace, WorkspaceSection } from "../types/workspace";

const BLOCK_TEXT_IDS = new Set(["assessment", "plan"]);

const SAMPLE_LABELS: Record<string, string> = {
  diagnosis: "Diagnoses",
  medication: "Medications",
  investigation: "Investigations",
  treatment: "Treatment",
  assessment: "Assessment",
  plan: "Plan",
  "follow-up": "Follow-up",
};

const PATIENT_TOKEN_LABELS: Record<(typeof PATIENT_PLACEHOLDERS)[number], string> = {
  "{{PATIENT_NAME}}": "Patient name",
  "{{DOB}}": "Date of birth",
  "{{PATIENT_ID}}": "Patient / reference number",
  "{{LETTER_DATE}}": "Date of letter",
  "{{CLINICIAN_NAME}}": "Clinician name",
  "{{CLINICIAN_ROLE}}": "Clinician role",
  "{{PATIENT_OTHER}}": "Other patient details",
};

export interface TemplateToken {
  token: string;
  label: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyBold(escaped: string): string {
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function sectionLabel(section: WorkspaceSection): string {
  return SAMPLE_LABELS[section.id] ?? section.name;
}

function isBlockTextSection(section: WorkspaceSection): boolean {
  return section.kind === "text" && BLOCK_TEXT_IDS.has(section.id);
}

/** Default letter body, matching templates/sample-letter.html, plus extra sections. */
export function createDefaultLetterTemplate(sections: WorkspaceSection[]): string {
  const lines: string[] = ["Dear colleague,", ""];
  const patientEnabled = sections.some((section) => section.enabled && section.kind === "patient");

  if (patientEnabled) {
    lines.push("Re: {{PATIENT_NAME}}, DOB {{DOB}}, {{PATIENT_ID}}{{PATIENT_OTHER}}", "");
    lines.push("Date of letter: {{LETTER_DATE}}", "");
  }

  for (const section of sections) {
    if (!section.enabled || section.kind === "patient" || section.kind === "standardText") {
      continue;
    }
    if (!section.placeholder) {
      continue;
    }

    const label = sectionLabel(section);
    if (isBlockTextSection(section)) {
      lines.push(`**${label}**`, "", section.placeholder, "");
    } else {
      lines.push(`**${label}:** ${section.placeholder}`, "");
    }
  }

  lines.push("Yours sincerely,", "");
  if (patientEnabled) {
    lines.push("{{CLINICIAN_NAME}}", "{{CLINICIAN_ROLE}}");
  }

  return `${lines.join("\n").replace(/\s+$/, "")}\n`;
}

export function listTemplateTokens(workspace: Workspace): TemplateToken[] {
  const tokens: TemplateToken[] = [];
  const seen = new Set<string>();

  const add = (token: string, label: string) => {
    if (!token || seen.has(token)) {
      return;
    }
    seen.add(token);
    tokens.push({ token, label });
  };

  for (const section of workspace.sections) {
    if (section.kind === "patient") {
      for (const token of PATIENT_PLACEHOLDERS) {
        add(token, PATIENT_TOKEN_LABELS[token]);
      }
      continue;
    }
    if (section.placeholder) {
      add(section.placeholder, section.name);
    }
  }

  return tokens;
}

export function templateTextToHtml(template: string): string {
  const normalised = template.replace(/\r\n/g, "\n").replace(/\s+$/, "");
  if (!normalised.trim()) {
    return "<div></div>";
  }

  const blocks = normalised.split(/\n{2,}/);
  const html = blocks
    .map((block) => {
      const lines = block.split("\n").map((line) => applyBold(escapeHtml(line)));
      return `<p>${lines.join("<br />")}</p>`;
    })
    .join("");

  return `<div>${html}</div>`;
}

export function buildLetterTemplateHtml(workspace: Workspace): string {
  const source = workspace.letterTemplate.trim()
    ? workspace.letterTemplate
    : createDefaultLetterTemplate(workspace.sections);
  return templateTextToHtml(source);
}
