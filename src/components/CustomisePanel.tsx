/* global window, File, HTMLInputElement */

import * as React from "react";
import { useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Dropdown,
  Field,
  Input,
  Option,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Workspace, WorkspaceSection, SectionKind } from "../types/workspace";
import { createId, emptyCatalog, toPlaceholder } from "../utils/ids";
import CatalogEditor from "./CatalogEditor";

const useStyles = makeStyles({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "flex-end",
  },
  grow: {
    flexGrow: 1,
    minWidth: "120px",
  },
  sectionCard: {
    padding: "8px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  headerRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
  },
  token: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
});

const KIND_LABELS: Record<SectionKind, string> = {
  catalog: "List (multi-select)",
  text: "Free text",
  standardText: "Reusable paragraphs",
  patient: "Patient details",
};

export interface CustomisePanelProps {
  workspace: Workspace;
  onChange: (workspace: Workspace) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<string | null>;
  onResetDefaults: () => void;
  onInsertPlaceholder: (placeholder: string) => void;
}

const CustomisePanel: React.FC<CustomisePanelProps> = (props) => {
  const styles = useStyles();
  const fileInput = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<Exclude<SectionKind, "patient">>("catalog");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const hasPatient = props.workspace.sections.some((section) => section.kind === "patient");

  const updateSections = (sections: WorkspaceSection[]) => {
    props.onChange({ ...props.workspace, sections });
  };

  const addSection = () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    const section: WorkspaceSection = {
      id: createId("section"),
      name,
      kind: newKind,
      placeholder: newKind === "standardText" ? "" : toPlaceholder(name),
      enabled: true,
      catalog: emptyCatalog(),
    };
    updateSections([...props.workspace.sections, section]);
    setNewName("");
    setEditingId(section.id);
  };

  const updateSection = (sectionId: string, patch: Partial<WorkspaceSection>) => {
    updateSections(
      props.workspace.sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section
      )
    );
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const next = [...props.workspace.sections];
    const target = index + direction;
    if (target < 0 || target >= next.length) {
      return;
    }
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    updateSections(next);
  };

  const deleteSection = (section: WorkspaceSection) => {
    if (!window.confirm(`Delete the "${section.name}" section from this add-in?`)) {
      return;
    }
    updateSections(props.workspace.sections.filter((entry) => entry.id !== section.id));
    if (editingId === section.id) {
      setEditingId(null);
    }
  };

  const onPickFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    const error = await props.onImport(file);
    setImportError(error);
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  return (
    <div className={styles.stack}>
      <Text size={200} className={styles.hint}>
        Lists and reusable paragraphs stay on this computer. Export a file to share your library with
        colleagues. Nothing is sent to a server.
      </Text>

      <div className={styles.row}>
        <Button appearance="secondary" size="small" onClick={props.onExport}>
          Export library
        </Button>
        <Button appearance="secondary" size="small" onClick={() => fileInput.current?.click()}>
          Import library
        </Button>
        <Button
          appearance="subtle"
          size="small"
          onClick={() => {
            if (window.confirm("Replace your library with the demonstration lists?")) {
              props.onResetDefaults();
              setEditingId(null);
            }
          }}
        >
          Restore demo lists
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          hidden
          onChange={(event) => onPickFile(event.target.files?.[0])}
        />
      </div>
      {importError ? (
        <Text size={200} className={styles.hint}>
          {importError}
        </Text>
      ) : null}

      <div className={styles.row}>
        <Field className={styles.grow} label="New section">
          <Input
            value={newName}
            onChange={(_event, data) => setNewName(data.value)}
            placeholder="e.g. Referrals"
          />
        </Field>
        <Field label="Type">
          <Dropdown
            value={KIND_LABELS[newKind]}
            selectedOptions={[newKind]}
            onOptionSelect={(_event, data) => {
              if (data.optionValue === "catalog" || data.optionValue === "text" || data.optionValue === "standardText") {
                setNewKind(data.optionValue);
              }
            }}
          >
            <Option value="catalog">{KIND_LABELS.catalog}</Option>
            <Option value="text">{KIND_LABELS.text}</Option>
            <Option value="standardText">{KIND_LABELS.standardText}</Option>
          </Dropdown>
        </Field>
        <Button appearance="primary" size="small" onClick={addSection}>
          Add section
        </Button>
      </div>
      {!hasPatient ? (
        <Button
          appearance="subtle"
          size="small"
          onClick={() =>
            updateSections([
              {
                id: createId("patient"),
                name: "Patient",
                kind: "patient",
                placeholder: "{{PATIENT_NAME}}",
                enabled: true,
                catalog: emptyCatalog(),
              },
              ...props.workspace.sections,
            ])
          }
        >
          Add patient details section
        </Button>
      ) : null}

      {props.workspace.sections.map((section, index) => {
        const editing = editingId === section.id;
        return (
          <div key={section.id} className={styles.sectionCard}>
            <div className={styles.headerRow}>
              <div>
                <Text weight="semibold">{section.name}</Text>
                <Text className={styles.token} block>
                  {section.kind === "patient"
                    ? "{{PATIENT_NAME}} {{DOB}} {{PATIENT_ID}} {{LETTER_DATE}} {{CLINICIAN_NAME}} {{CLINICIAN_ROLE}}"
                    : section.placeholder || "Insert-only (no placeholder)"}
                </Text>
                <Text size={200} className={styles.hint}>
                  {KIND_LABELS[section.kind]}
                </Text>
              </div>
              <div className={styles.actions}>
                <Checkbox
                  checked={section.enabled}
                  label="Show"
                  onChange={(_event, data) => updateSection(section.id, { enabled: Boolean(data.checked) })}
                />
                <Button appearance="subtle" size="small" onClick={() => moveSection(index, -1)} disabled={index === 0}>
                  Up
                </Button>
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === props.workspace.sections.length - 1}
                >
                  Down
                </Button>
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={() => setEditingId(editing ? null : section.id)}
                >
                  {editing ? "Done" : "Edit"}
                </Button>
                <Button appearance="subtle" size="small" onClick={() => deleteSection(section)}>
                  Delete
                </Button>
              </div>
            </div>

            {section.placeholder ? (
              <Button
                appearance="outline"
                size="small"
                onClick={() => props.onInsertPlaceholder(section.placeholder)}
              >
                Insert placeholder into document
              </Button>
            ) : null}

            {editing ? (
              <div className={styles.stack}>
                {section.kind !== "patient" ? (
                  <>
                    <Field label="Section name">
                      <Input
                        value={section.name}
                        onChange={(_event, data) => updateSection(section.id, { name: data.value })}
                      />
                    </Field>
                    {section.kind !== "standardText" ? (
                      <Field label="Word placeholder">
                        <Input
                          value={section.placeholder}
                          onChange={(_event, data) => updateSection(section.id, { placeholder: data.value })}
                          placeholder="{{MY_FIELD}}"
                        />
                      </Field>
                    ) : null}
                  </>
                ) : (
                  <Text size={200}>
                    Patient fields are fixed. Put these tokens in the Word template: PATIENT_NAME, DOB,
                    PATIENT_ID, LETTER_DATE, CLINICIAN_NAME, CLINICIAN_ROLE.
                  </Text>
                )}
                {section.kind === "catalog" || section.kind === "standardText" ? (
                  <CatalogEditor
                    catalog={section.catalog}
                    itemMode={section.kind === "standardText" ? "text" : "simple"}
                    onChange={(catalog) => updateSection(section.id, { catalog })}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default CustomisePanel;
