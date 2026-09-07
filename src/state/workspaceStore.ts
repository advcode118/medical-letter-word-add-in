/* global window, document, Blob, URL */

import { Catalog } from "../types/catalog";
import { Workspace, WorkspaceSection, WORKSPACE_STORAGE_KEY } from "../types/workspace";
import { createDefaultWorkspace } from "./defaultWorkspace";

function isCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== "object") {
    return false;
  }
  const catalog = value as Catalog;
  if (!Array.isArray(catalog.categories)) {
    return false;
  }
  return catalog.categories.every(
    (category) =>
      typeof category.id === "string" &&
      typeof category.name === "string" &&
      Array.isArray(category.items) &&
      category.items.every((item) => typeof item.id === "string" && typeof item.name === "string")
  );
}

function isSection(value: unknown): value is WorkspaceSection {
  if (!value || typeof value !== "object") {
    return false;
  }
  const section = value as WorkspaceSection;
  const kinds = ["patient", "catalog", "text", "standardText"];
  return (
    typeof section.id === "string" &&
    typeof section.name === "string" &&
    kinds.includes(section.kind) &&
    typeof section.placeholder === "string" &&
    typeof section.enabled === "boolean" &&
    isCatalog(section.catalog)
  );
}

export function parseWorkspace(value: unknown): Workspace | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = value as Workspace;
  if (candidate.version !== 1 || !Array.isArray(candidate.sections)) {
    return null;
  }
  if (!candidate.sections.every(isSection)) {
    return null;
  }
  return candidate;
}

export function loadWorkspace(): Workspace {
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) {
      return createDefaultWorkspace();
    }
    const parsed = parseWorkspace(JSON.parse(raw));
    return parsed ?? createDefaultWorkspace();
  } catch {
    return createDefaultWorkspace();
  }
}

export function saveWorkspace(workspace: Workspace): void {
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
}

export function downloadWorkspace(workspace: Workspace): void {
  const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "medical-letter-library.json";
  link.click();
  URL.revokeObjectURL(url);
}
