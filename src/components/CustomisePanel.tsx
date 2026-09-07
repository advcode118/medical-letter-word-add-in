/* global window, File, HTMLInputElement */

import * as React from "react";
import { useRef, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
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
import TemplateEditor from "./TemplateEditor";

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
  const [openItems, setOpenItems] = useState<string[]>([]);
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
    let letterTemplate = props.workspace.letterTemplate;
    if (section.placeholder && !letterTemplate.includes(section.placeholder)) {
      letterTemplate = `${letterTemplate.replace(/\s*$/, "")}\n\n**${name}:** ${section.placeholder}\n`;
    }
    props.onChange({
      ...props.workspace,
      sections: [...props.workspace.sections, section],
      letterTemplate,
    });
    setNewName("");
    setOpenItems((current) => (current.includes(section.id) ? current : [...current, section.id]));
  };

  const updateSection = (sectionId: string, patch: Partial<WorkspaceSection>) => {
    const current = props.workspace.sections.find((section) => section.id === sectionId);
    let letterTemplate = props.workspace.letterTemplate;
    if (
      current?.placeholder &&
      patch.placeholder &&
      patch.placeholder !== current.placeholder &&
      letterTemplate.includes(current.placeholder)
    ) {
      letterTemplate = letterTemplate.split(current.placeholder).join(patch.placeholder);
    }
    props.onChange({
      ...props.workspace,
      letterTemplate,
      sections: props.workspace.sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section
      ),
    });
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
    setOpenItems((current) => current.filter((id) => id !== section.id));
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
        Lists, reusable paragraphs, and the letter template stay on this computer. Export a file to share
        your library with colleagues. Nothing is sent to a server.
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
              setOpenItems([]);
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
          onClick={() => {
            const patientId = createId("patient");
            let letterTemplate = props.workspace.letterTemplate;
            if (!letterTemplate.includes("{{PATIENT_NAME}}")) {
              letterTemplate = `Re: {{PATIENT_NAME}}, DOB {{DOB}}, {{PATIENT_ID}}{{PATIENT_OTHER}}\n\nDate of letter: {{LETTER_DATE}}\n\n${letterTemplate}`;
            }
            props.onChange({
              ...props.workspace,
              letterTemplate,
              sections: [
                {
                  id: patientId,
                  name: "Patient",
                  kind: "patient",
                  placeholder: "{{PATIENT_NAME}}",
                  enabled: true,
                  catalog: emptyCatalog(),
                },
                ...props.workspace.sections,
              ],
            });
            setOpenItems((current) => (current.includes(patientId) ? current : [...current, patientId]));
          }}
        >
          Add patient details section
        </Button>
      ) : null}

      <Accordion
        multiple
        collapsible
        openItems={openItems}
        onToggle={(_event, data) => setOpenItems(data.openItems.map((item) => String(item)))}
      >
        <AccordionItem value="letter-template">
          <AccordionHeader>Letter template</AccordionHeader>
          <AccordionPanel>
            <TemplateEditor
              workspace={props.workspace}
              onChange={(letterTemplate) => props.onChange({ ...props.workspace, letterTemplate })}
            />
          </AccordionPanel>
        </AccordionItem>

        {props.workspace.sections.map((section, index) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionHeader>{section.name}</AccordionHeader>
            <AccordionPanel>
              <div className={styles.stack}>
                <Text className={styles.token} block>
                  {section.kind === "patient"
                    ? "{{PATIENT_NAME}} {{DOB}} {{PATIENT_ID}} {{LETTER_DATE}} {{CLINICIAN_NAME}} {{CLINICIAN_ROLE}} {{PATIENT_OTHER}}"
                    : section.placeholder || "Insert-only (no placeholder)"}
                </Text>
                <Text size={200} className={styles.hint}>
                  {KIND_LABELS[section.kind]}
                </Text>
                <div className={styles.headerRow}>
                  <div className={styles.actions}>
                    <Checkbox
                      checked={section.enabled}
                      label="Show"
                      onChange={(_event, data) => updateSection(section.id, { enabled: Boolean(data.checked) })}
                    />
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={() => moveSection(index, -1)}
                      disabled={index === 0}
                    >
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
                    PATIENT_ID, LETTER_DATE, CLINICIAN_NAME, CLINICIAN_ROLE, PATIENT_OTHER.
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
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default CustomisePanel;
