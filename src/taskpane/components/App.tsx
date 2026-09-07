/* global window */

import * as React from "react";
import { useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Tab,
  TabList,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Catalog } from "../../types/catalog";
import { WorkspaceSection } from "../../types/workspace";
import { useLetterState } from "../../state/useLetterState";
import { useWorkspace } from "../../state/useWorkspace";
import { getSuggestedStandardText, joinSelectedNames, joinWithOther } from "../../utils/catalog";
import { buildPlaceholderValues } from "../../word/placeholders";
import { buildLetterTemplateHtml } from "../../word/letterTemplate";
import {
  detectPlaceholders,
  insertAtCursor,
  insertHtmlIntoBody,
  isDocumentBodyEmpty,
  isWordHost,
  populateLetter,
  PlaceholderDetection,
  WordIntegrationError,
} from "../../word/documentService";
import PatientFields from "../../components/PatientFields";
import CatalogSection from "../../components/CatalogSection";
import TextSection from "../../components/TextSection";
import StandardTextPanel from "../../components/StandardTextPanel";
import PreviewPanel from "../../components/PreviewPanel";
import PlaceholderStatus from "../../components/PlaceholderStatus";
import CustomisePanel from "../../components/CustomisePanel";

interface AppProps {
  title: string;
}

interface Notice {
  intent: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  },
  header: {
    flexShrink: 0,
    padding: "12px 12px 8px 12px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    marginBottom: "8px",
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "8px 12px 16px 12px",
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flexShrink: 0,
    padding: "10px 12px 12px 12px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  footerRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  disclaimer: {
    color: tokens.colorNeutralForeground3,
  },
  notice: {
    marginBottom: "8px",
    whiteSpace: "normal",
  },
  hostBanner: {
    margin: "8px 12px 0 12px",
  },
  token: {
    color: tokens.colorNeutralForeground3,
    marginBottom: "8px",
  },
});

function mergedStandardText(sections: WorkspaceSection[]): Catalog {
  return {
    categories: sections
      .filter((section) => section.kind === "standardText")
      .flatMap((section) => section.catalog.categories),
  };
}

const App: React.FC<AppProps> = (props: AppProps) => {
  const styles = useStyles();
  const { workspace, setWorkspace, resetDefaults, exportLibrary, importLibrary } = useWorkspace();
  const { state, patchPatient, setCatalogSelection, setTextValue, setOtherValue, clearSelections, resetForm } =
    useLetterState();
  const [mode, setMode] = useState<"letter" | "customise">("letter");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [detections, setDetections] = useState<PlaceholderDetection[] | null>(null);
  const wordHost = isWordHost();

  const showError = (error: unknown, fallback: string) => {
    const message = error instanceof WordIntegrationError ? error.message : fallback;
    setNotice({ intent: "error", title: "Word document", message });
  };

  const runWordAction = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      setNotice({ intent: "success", title: "Document updated", message: success });
    } catch (error) {
      showError(error, "Could not update the Word document. Check that a document is open.");
    } finally {
      setBusy(false);
    }
  };

  const standardTextCatalog = mergedStandardText(workspace.sections);
  const diagnosisSection = workspace.sections.find((section) => section.id === "diagnosis");
  const suggestedText = diagnosisSection
    ? getSuggestedStandardText(
        state.catalogSelections[diagnosisSection.id] ?? [],
        diagnosisSection.catalog,
        standardTextCatalog
      )
    : [];
  const placeholderValues = buildPlaceholderValues(workspace, state);
  const visibleSections = workspace.sections.filter((section) => section.enabled);

  const onPopulate = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const tokens = placeholderValues.map((item) => item.token);
      let found = await detectPlaceholders(tokens);
      let insertedTemplate = false;

      if (!found.some((item) => item.found)) {
        const empty = await isDocumentBodyEmpty();
        if (!empty) {
          setDetections(found);
          setNotice({
            intent: "warning",
            title: "No placeholders replaced",
            message:
              "None of the expected placeholders were found. Use a blank document, or click Insert template first.",
          });
          return;
        }
        await insertHtmlIntoBody(buildLetterTemplateHtml(workspace), "Replace");
        insertedTemplate = true;
        found = await detectPlaceholders(tokens);
      }

      setDetections(found);

      const result = await populateLetter(
        placeholderValues.map((item) => ({ token: item.token, value: item.value }))
      );

      const missingCount = result.missing.length;
      const replacedCount = result.replaced.reduce((sum, item) => sum + item.count, 0);
      const emptyCount = result.skippedEmpty.length;

      if (replacedCount === 0 && missingCount === found.length && !insertedTemplate) {
        setNotice({
          intent: "warning",
          title: "No placeholders replaced",
          message: "None of the expected placeholders were found in this document.",
        });
      } else {
        setNotice({
          intent: missingCount > 0 || emptyCount > 0 ? "warning" : "success",
            title: insertedTemplate ? "Letter inserted and populated" : "Letter populated",
            message: `${
              insertedTemplate ? "Inserted your letter template. " : ""
            }Replaced ${replacedCount} placeholder${replacedCount === 1 ? "" : "s"}. ${
            missingCount > 0 ? `${missingCount} not found. ` : ""
          }${emptyCount > 0 ? `${emptyCount} left unchanged because they had no value.` : ""}`.trim(),
        });
      }
    } catch (error) {
      showError(error, "Could not populate the letter. Open a Word document that contains placeholders.");
    } finally {
      setBusy(false);
    }
  };

  const onInsertTemplate = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const empty = await isDocumentBodyEmpty();
      if (!empty) {
        const confirmed = window.confirm(
          "This document already has content. Insert your letter template at the end?"
        );
        if (!confirmed) {
          return;
        }
      }

      await insertHtmlIntoBody(buildLetterTemplateHtml(workspace), empty ? "Replace" : "End");
      const found = await detectPlaceholders(placeholderValues.map((item) => item.token));
      setDetections(found);
      setNotice({
        intent: "success",
        title: "Document updated",
        message: empty
          ? "Inserted your letter template."
          : "Inserted your letter template at the end of the document.",
      });
    } catch (error) {
      showError(error, "Could not insert the letter template. Check that a document is open.");
    } finally {
      setBusy(false);
    }
  };

  const renderSection = (section: WorkspaceSection) => {
    if (section.kind === "patient") {
      return (
        <PatientFields
          patient={state.patient}
          onChange={patchPatient}
          otherValue={state.otherValues[section.id] ?? ""}
          onOtherChange={(value) => setOtherValue(section.id, value)}
        />
      );
    }
    if (section.kind === "catalog") {
      const selected = state.catalogSelections[section.id] ?? [];
      const other = state.otherValues[section.id] ?? "";
      const catalogText = joinSelectedNames(selected, other);
      return (
        <>
          {section.placeholder ? (
            <Text className={styles.token} size={100} block>
              Placeholder {section.placeholder}
            </Text>
          ) : null}
          <CatalogSection
            data={section.catalog}
            selected={selected}
            onChange={(items) => setCatalogSelection(section.id, items)}
            searchPlaceholder={`Search ${section.name.toLowerCase()}...`}
            insertLabel={`Insert ${section.name.toLowerCase()}`}
            ariaLabel={`${section.name} selector`}
            otherValue={other}
            onOtherChange={(value) => setOtherValue(section.id, value)}
            insertDisabled={!catalogText || busy}
            onInsert={() =>
              runWordAction(
                () => insertAtCursor(catalogText),
                `Inserted ${section.name.toLowerCase()} at the cursor.`
              )
            }
          />
          {section.id === "diagnosis" ? (
            <StandardTextPanel
              suggested={suggestedText}
              onInsert={(text) =>
                runWordAction(() => insertAtCursor(text), "Inserted standard text at the cursor.")
              }
            />
          ) : null}
        </>
      );
    }
    if (section.kind === "standardText") {
      return (
        <StandardTextPanel
          catalog={section.catalog}
          otherValue={state.otherValues[section.id] ?? ""}
          onOtherChange={(value) => setOtherValue(section.id, value)}
          onInsert={(text) =>
            runWordAction(() => insertAtCursor(text), "Inserted standard text at the cursor.")
          }
        />
      );
    }
    const value = state.textValues[section.id] ?? "";
    const other = state.otherValues[section.id] ?? "";
    const combinedText = joinWithOther([value], other, "\n\n");
    return (
      <>
        {section.placeholder ? (
          <Text className={styles.token} size={100} block>
            Placeholder {section.placeholder}
          </Text>
        ) : null}
        <TextSection
          label={section.name}
          value={value}
          onChange={(next) => setTextValue(section.id, next)}
          placeholder={section.name}
          insertLabel={`Insert ${section.name.toLowerCase()}`}
          otherValue={other}
          onOtherChange={(next) => setOtherValue(section.id, next)}
          insertDisabled={!combinedText || busy}
          onInsert={() =>
            runWordAction(
              () => insertAtCursor(combinedText),
              `Inserted ${section.name.toLowerCase()} at the cursor.`
            )
          }
        />
      </>
    );
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text weight="semibold" size={400} as="h1">
          {props.title}
        </Text>
        <Text className={styles.subtitle} size={200} block>
          Fill a blank document with your letter template, or complete placeholders in an existing document.
        </Text>
        <TabList
          selectedValue={mode}
          onTabSelect={(_event, data) => setMode(data.value as "letter" | "customise")}
        >
          <Tab value="letter">Letter</Tab>
          <Tab value="customise">Customise</Tab>
        </TabList>
      </header>

      {!wordHost ? (
        <div className={styles.hostBanner}>
          <MessageBar intent="info">
            <MessageBarBody>
              <MessageBarTitle>Open in Microsoft Word</MessageBarTitle>
              Insert and populate actions need the live Word document. You can still review and edit lists here.
            </MessageBarBody>
          </MessageBar>
        </div>
      ) : null}

      <div className={styles.scroll}>
        {notice ? (
          <div className={styles.notice}>
            <MessageBar intent={notice.intent}>
              <MessageBarBody>
                <MessageBarTitle>{notice.title}</MessageBarTitle>
                {notice.message}
              </MessageBarBody>
            </MessageBar>
          </div>
        ) : null}

        {mode === "customise" ? (
          <CustomisePanel
            workspace={workspace}
            onChange={setWorkspace}
            onExport={exportLibrary}
            onImport={importLibrary}
            onResetDefaults={resetDefaults}
            onInsertPlaceholder={(placeholder) =>
              runWordAction(
                () => insertAtCursor(placeholder),
                `Inserted ${placeholder} at the cursor so you can build a Word template.`
              )
            }
          />
        ) : (
          <Accordion
            multiple
            collapsible
            defaultOpenItems={visibleSections.slice(0, 2).map((section) => section.id).concat(["preview"])}
          >
            {visibleSections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionHeader>{section.name}</AccordionHeader>
                <AccordionPanel>{renderSection(section)}</AccordionPanel>
              </AccordionItem>
            ))}
            <AccordionItem value="preview">
              <AccordionHeader>Preview</AccordionHeader>
              <AccordionPanel>
                <PreviewPanel workspace={workspace} state={state} />
                <PlaceholderStatus detections={detections} />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </div>

      <footer className={styles.footer}>
        {mode === "letter" ? (
          <div className={styles.footerRow}>
            <Button appearance="primary" onClick={onPopulate} disabled={busy}>
              Populate Letter
            </Button>
            <Button appearance="secondary" onClick={onInsertTemplate} disabled={busy}>
              Insert template
            </Button>
            <Button appearance="secondary" onClick={clearSelections} disabled={busy}>
              Clear selections
            </Button>
            <Button appearance="subtle" onClick={resetForm} disabled={busy}>
              Reset form
            </Button>
          </div>
        ) : null}
        <Text className={styles.disclaimer} size={100}>
          Demonstration terminology only. This is a document tool, not a diagnostic system. Each person can
          replace the lists with their own.
        </Text>
      </footer>
    </div>
  );
};

export default App;
