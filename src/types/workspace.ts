export type SectionKind = "patient" | "catalog" | "text" | "standardText";

export interface WorkspaceSection {
  id: string;
  name: string;
  kind: SectionKind;
  placeholder: string;
  enabled: boolean;
  catalog: {
    categories: Array<{
      id: string;
      name: string;
      items: Array<{
        id: string;
        name: string;
        standardText?: string[];
        text?: string;
      }>;
    }>;
  };
}

export interface Workspace {
  version: 1;
  sections: WorkspaceSection[];
  letterTemplate: string;
}

export const WORKSPACE_STORAGE_KEY = "medical-letter-workspace-v1";
