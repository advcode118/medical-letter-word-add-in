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
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import diagnoses from "../../data/diagnoses.json";
import medications from "../../data/medications.json";
import investigations from "../../data/investigations.json";
import treatments from "../../data/treatments.json";
import standardText from "../../data/standardText.json";
import { Catalog } from "../../types/catalog";
import { useLetterState } from "../../state/useLetterState";
import { joinSelectedNames, getSuggestedStandardText } from "../../utils/catalog";
import { buildPlaceholderValues } from "../../word/placeholders";
import {
  detectPlaceholders,
  insertAtCursor,
  insertAssessment,
  insertDiagnosis,
  insertFollowUp,
  insertInvestigation,
  insertMedication,
  insertPlan,
  insertTreatment,
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

const diagnosisCatalog = diagnoses as Catalog;
const medicationCatalog = medications as Catalog;
const investigationCatalog = investigations as Catalog;
const treatmentCatalog = treatments as Catalog;
const standardTextCatalog = standardText as Catalog;

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
});

const App: React.FC<AppProps> = (props: AppProps) => {
  const styles = useStyles();
  const { state, setState, clearSelections, resetForm } = useLetterState();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [detections, setDetections] = useState<PlaceholderDetection[] | null>(null);
  const wordHost = isWordHost();

  const patchState = (patch: Partial<typeof state>) => {
    setState((current) => ({ ...current, ...patch }));
  };

  const showError = (error: unknown, fallback: string) => {
    const message =
      error instanceof WordIntegrationError
        ? error.message
        : fallback;
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

  const suggestedText = getSuggestedStandardText(state.diagnoses, diagnosisCatalog, standardTextCatalog);
  const placeholderValues = buildPlaceholderValues(state);

  const onPopulate = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const found = await detectPlaceholders(placeholderValues.map((item) => item.token));
      setDetections(found);

      const result = await populateLetter(
        placeholderValues.map((item) => ({ token: item.token, value: item.value }))
      );

      const missingCount = result.missing.length;
      const replacedCount = result.replaced.reduce((sum, item) => sum + item.count, 0);
      const emptyCount = result.skippedEmpty.length;

      if (replacedCount === 0 && missingCount === found.length) {
        setNotice({
          intent: "warning",
          title: "No placeholders replaced",
          message: "None of the expected placeholders were found in this document.",
        });
      } else {
        setNotice({
          intent: missingCount > 0 || emptyCount > 0 ? "warning" : "success",
          title: "Letter populated",
          message: `Replaced ${replacedCount} placeholder${replacedCount === 1 ? "" : "s"}. ${
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

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text weight="semibold" size={400} as="h1">
          {props.title}
        </Text>
        <Text className={styles.subtitle} size={200} block>
          Fill the letter in Word from this task pane
        </Text>
      </header>

      {!wordHost ? (
        <div className={styles.hostBanner}>
          <MessageBar intent="info">
            <MessageBarBody>
              <MessageBarTitle>Open in Microsoft Word</MessageBarTitle>
              Insert and populate actions need the live Word document. You can still review the form here.
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

        <Accordion multiple collapsible defaultOpenItems={["patient", "diagnosis", "preview"]}>
          <AccordionItem value="patient">
            <AccordionHeader>Patient</AccordionHeader>
            <AccordionPanel>
              <PatientFields state={state} onChange={patchState} />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="diagnosis">
            <AccordionHeader>Diagnosis</AccordionHeader>
            <AccordionPanel>
              <CatalogSection
                data={diagnosisCatalog}
                selected={state.diagnoses}
                onChange={(diagnoses) => patchState({ diagnoses })}
                searchPlaceholder="Search diagnoses..."
                insertLabel="Insert diagnosis"
                ariaLabel="Diagnosis selector"
                insertDisabled={state.diagnoses.length === 0 || busy}
                onInsert={() =>
                  runWordAction(
                    () => insertDiagnosis(joinSelectedNames(state.diagnoses)),
                    "Inserted the selected diagnoses at the cursor."
                  )
                }
              />
              <StandardTextPanel
                suggested={suggestedText}
                onInsert={(text) =>
                  runWordAction(() => insertAtCursor(text), "Inserted standard text at the cursor.")
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="medication">
            <AccordionHeader>Medication</AccordionHeader>
            <AccordionPanel>
              <CatalogSection
                data={medicationCatalog}
                selected={state.medications}
                onChange={(medications) => patchState({ medications })}
                searchPlaceholder="Search medications..."
                insertLabel="Insert medication"
                ariaLabel="Medication selector"
                insertDisabled={state.medications.length === 0 || busy}
                onInsert={() =>
                  runWordAction(
                    () => insertMedication(joinSelectedNames(state.medications)),
                    "Inserted the selected medications at the cursor."
                  )
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="investigation">
            <AccordionHeader>Investigation</AccordionHeader>
            <AccordionPanel>
              <CatalogSection
                data={investigationCatalog}
                selected={state.investigations}
                onChange={(investigations) => patchState({ investigations })}
                searchPlaceholder="Search investigations..."
                insertLabel="Insert investigation"
                ariaLabel="Investigation selector"
                insertDisabled={state.investigations.length === 0 || busy}
                onInsert={() =>
                  runWordAction(
                    () => insertInvestigation(joinSelectedNames(state.investigations)),
                    "Inserted the selected investigations at the cursor."
                  )
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="treatment">
            <AccordionHeader>Treatment</AccordionHeader>
            <AccordionPanel>
              <CatalogSection
                data={treatmentCatalog}
                selected={state.treatments}
                onChange={(treatments) => patchState({ treatments })}
                searchPlaceholder="Search treatments..."
                insertLabel="Insert treatment"
                ariaLabel="Treatment selector"
                insertDisabled={state.treatments.length === 0 || busy}
                onInsert={() =>
                  runWordAction(
                    () => insertTreatment(joinSelectedNames(state.treatments)),
                    "Inserted the selected treatments at the cursor."
                  )
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="assessment">
            <AccordionHeader>Assessment</AccordionHeader>
            <AccordionPanel>
              <TextSection
                label="Assessment"
                value={state.assessment}
                onChange={(assessment) => patchState({ assessment })}
                placeholder="Clinical assessment"
                insertLabel="Insert assessment"
                onInsert={() =>
                  runWordAction(() => insertAssessment(state.assessment), "Inserted the assessment at the cursor.")
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="plan">
            <AccordionHeader>Plan</AccordionHeader>
            <AccordionPanel>
              <TextSection
                label="Plan"
                value={state.plan}
                onChange={(plan) => patchState({ plan })}
                placeholder="Management plan"
                insertLabel="Insert plan"
                onInsert={() => runWordAction(() => insertPlan(state.plan), "Inserted the plan at the cursor.")}
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="follow-up">
            <AccordionHeader>Follow-up</AccordionHeader>
            <AccordionPanel>
              <TextSection
                label="Follow-up"
                value={state.followUp}
                onChange={(followUp) => patchState({ followUp })}
                placeholder="e.g. 4 weeks"
                insertLabel="Insert follow-up"
                onInsert={() =>
                  runWordAction(() => insertFollowUp(state.followUp), "Inserted the follow-up at the cursor.")
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="standard-text">
            <AccordionHeader>Standard Text</AccordionHeader>
            <AccordionPanel>
              <StandardTextPanel
                catalog={standardTextCatalog}
                onInsert={(text) =>
                  runWordAction(() => insertAtCursor(text), "Inserted standard text at the cursor.")
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="preview">
            <AccordionHeader>Preview</AccordionHeader>
            <AccordionPanel>
              <PreviewPanel state={state} />
              <PlaceholderStatus detections={detections} />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerRow}>
          <Button appearance="primary" onClick={onPopulate} disabled={busy}>
            Populate Letter
          </Button>
          <Button appearance="secondary" onClick={clearSelections} disabled={busy}>
            Clear selections
          </Button>
          <Button appearance="subtle" onClick={resetForm} disabled={busy}>
            Reset form
          </Button>
        </div>
        <Text className={styles.disclaimer} size={100}>
          Demonstration terminology only. This is a document tool, not a diagnostic system, and the lists are
          not clinically comprehensive.
        </Text>
      </footer>
    </div>
  );
};

export default App;
