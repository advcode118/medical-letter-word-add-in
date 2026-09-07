import diagnoses from "../data/diagnoses.json";
import medications from "../data/medications.json";
import investigations from "../data/investigations.json";
import treatments from "../data/treatments.json";
import standardText from "../data/standardText.json";
import { Catalog } from "../types/catalog";
import { Workspace, WorkspaceSection } from "../types/workspace";

function catalogSection(
  id: string,
  name: string,
  placeholder: string,
  catalog: Catalog
): WorkspaceSection {
  return {
    id,
    name,
    kind: "catalog",
    placeholder,
    enabled: true,
    catalog,
  };
}

function textSection(id: string, name: string, placeholder: string): WorkspaceSection {
  return {
    id,
    name,
    kind: "text",
    placeholder,
    enabled: true,
    catalog: { categories: [] },
  };
}

export function createDefaultWorkspace(): Workspace {
  return {
    version: 1,
    sections: [
      {
        id: "patient",
        name: "Patient",
        kind: "patient",
        placeholder: "{{PATIENT_NAME}}",
        enabled: true,
        catalog: { categories: [] },
      },
      catalogSection("diagnosis", "Diagnosis", "{{DIAGNOSIS}}", diagnoses as Catalog),
      catalogSection("medication", "Medication", "{{MEDICATION}}", medications as Catalog),
      catalogSection(
        "investigation",
        "Investigation",
        "{{INVESTIGATION}}",
        investigations as Catalog
      ),
      catalogSection("treatment", "Treatment", "{{TREATMENT}}", treatments as Catalog),
      textSection("assessment", "Assessment", "{{ASSESSMENT}}"),
      textSection("plan", "Plan", "{{PLAN}}"),
      textSection("follow-up", "Follow-up", "{{FOLLOW_UP}}"),
      {
        id: "standard-text",
        name: "Standard Text",
        kind: "standardText",
        placeholder: "",
        enabled: true,
        catalog: standardText as Catalog,
      },
    ],
  };
}
