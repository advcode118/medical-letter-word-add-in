/* global Office, Word */

export class WordIntegrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WordIntegrationError";
  }
}

export interface PlaceholderDetection {
  token: string;
  found: boolean;
  count: number;
}

export interface PopulateResult {
  replaced: Array<{ token: string; count: number }>;
  missing: string[];
  skippedEmpty: string[];
}

const SEARCH_OPTIONS = {
  matchCase: true,
  matchWildcards: false,
  matchWholeWord: false,
};

function ensureWord(): void {
  if (typeof Word === "undefined" || !isWordHost()) {
    throw new WordIntegrationError(
      "Microsoft Word is required. Open this add-in from the Home tab in Word."
    );
  }
}

export function isWordHost(): boolean {
  try {
    return typeof Office !== "undefined" && Office.context?.host === Office.HostType.Word;
  } catch {
    return false;
  }
}

async function replaceFirstMatch(
  context: Word.RequestContext,
  root: Word.Body | Word.Range,
  placeholder: string,
  value: string
): Promise<boolean> {
  const results = root.search(placeholder, SEARCH_OPTIONS);
  results.load("items");
  await context.sync();

  if (results.items.length === 0) {
    return false;
  }

  const range = results.items[0];
  range.font.load(["name", "size", "bold", "italic", "underline", "color"]);
  await context.sync();

  const font = {
    name: range.font.name,
    size: range.font.size,
    bold: range.font.bold,
    italic: range.font.italic,
    underline: range.font.underline,
    color: range.font.color,
  };

  range.insertText(value, Word.InsertLocation.replace);
  range.font.set(font);
  await context.sync();
  return true;
}

async function replaceAllInRoot(
  context: Word.RequestContext,
  root: Word.Body | Word.Range,
  placeholder: string,
  value: string
): Promise<number> {
  try {
    let count = 0;
    const maxReplacements = 100;

    while (count < maxReplacements) {
      const replaced = await replaceFirstMatch(context, root, placeholder, value);
      if (!replaced) {
        break;
      }
      count += 1;
    }

    return count;
  } catch {
    return 0;
  }
}

async function getHeaderFooterBodies(context: Word.RequestContext): Promise<Word.Body[]> {
  const sections = context.document.sections;
  sections.load("items");
  await context.sync();

  const bodies: Word.Body[] = [];
  const types: Word.HeaderFooterType[] = [
    Word.HeaderFooterType.primary,
    Word.HeaderFooterType.firstPage,
    Word.HeaderFooterType.evenPages,
  ];

  for (const section of sections.items) {
    for (const type of types) {
      bodies.push(section.getHeader(type));
      bodies.push(section.getFooter(type));
    }
  }

  return bodies;
}

async function countInRoot(
  context: Word.RequestContext,
  root: Word.Body | Word.Range,
  placeholder: string
): Promise<number> {
  try {
    const results = root.search(placeholder, SEARCH_OPTIONS);
    results.load("items");
    await context.sync();
    return results.items.length;
  } catch {
    return 0;
  }
}

export function isBodyEmptyText(text: string): boolean {
  return text.replace(/[\u0007\r\n\s]/g, "").length === 0;
}

export async function isDocumentBodyEmpty(): Promise<boolean> {
  ensureWord();
  let empty = true;

  await Word.run(async (context) => {
    const body = context.document.body;
    body.load("text");
    await context.sync();
    empty = isBodyEmptyText(body.text ?? "");
  });

  return empty;
}

export async function insertHtmlIntoBody(
  html: string,
  location: "Replace" | "End" = "Replace"
): Promise<void> {
  ensureWord();

  await Word.run(async (context) => {
    const insertLocation =
      location === "End" ? Word.InsertLocation.end : Word.InsertLocation.replace;
    context.document.body.insertHtml(html, insertLocation);
    await context.sync();
  });
}

export async function insertAtCursor(text: string): Promise<void> {
  ensureWord();
  const value = text ?? "";

  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.insertText(value, Word.InsertLocation.replace);
    await context.sync();
  });
}

export async function insertPatientName(name: string): Promise<void> {
  await insertAtCursor(name);
}

export async function insertDiagnosis(diagnosisText: string): Promise<void> {
  await insertAtCursor(diagnosisText);
}

export async function insertMedication(medicationText: string): Promise<void> {
  await insertAtCursor(medicationText);
}

export async function insertInvestigation(investigationText: string): Promise<void> {
  await insertAtCursor(investigationText);
}

export async function insertTreatment(treatmentText: string): Promise<void> {
  await insertAtCursor(treatmentText);
}

export async function insertAssessment(assessmentText: string): Promise<void> {
  await insertAtCursor(assessmentText);
}

export async function insertPlan(planText: string): Promise<void> {
  await insertAtCursor(planText);
}

export async function insertFollowUp(followUpText: string): Promise<void> {
  await insertAtCursor(followUpText);
}

export async function replacePlaceholder(placeholder: string, value: string): Promise<number> {
  ensureWord();
  let total = 0;

  await Word.run(async (context) => {
    total += await replaceAllInRoot(context, context.document.body, placeholder, value);
    const headerFooterBodies = await getHeaderFooterBodies(context);
    for (const body of headerFooterBodies) {
      total += await replaceAllInRoot(context, body, placeholder, value);
    }
  });

  return total;
}

export async function detectPlaceholders(tokens: string[]): Promise<PlaceholderDetection[]> {
  ensureWord();
  const detections: PlaceholderDetection[] = [];

  await Word.run(async (context) => {
    const headerFooterBodies = await getHeaderFooterBodies(context);

    for (const token of tokens) {
      let count = await countInRoot(context, context.document.body, token);
      for (const body of headerFooterBodies) {
        count += await countInRoot(context, body, token);
      }
      detections.push({ token, found: count > 0, count });
    }
  });

  return detections;
}

export async function populateLetter(
  entries: Array<{ token: string; value: string }>
): Promise<PopulateResult> {
  ensureWord();

  const detections = await detectPlaceholders(entries.map((entry) => entry.token));
  const foundTokens = new Set(detections.filter((item) => item.found).map((item) => item.token));

  const result: PopulateResult = {
    replaced: [],
    missing: detections.filter((item) => !item.found).map((item) => item.token),
    skippedEmpty: [],
  };

  for (const entry of entries) {
    if (!entry.value) {
      if (entry.token === "{{PATIENT_OTHER}}" && foundTokens.has(entry.token)) {
        const count = await replacePlaceholder(entry.token, "");
        result.replaced.push({ token: entry.token, count });
        continue;
      }
      result.skippedEmpty.push(entry.token);
      continue;
    }
    if (!foundTokens.has(entry.token)) {
      continue;
    }
    const count = await replacePlaceholder(entry.token, entry.value);
    result.replaced.push({ token: entry.token, count });
  }

  return result;
}
