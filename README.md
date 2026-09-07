# Medical Letter Word Add-in

A Microsoft Word task-pane add-in for creating and completing structured medical letters. The left side of Word remains a normal document. The add-in runs in a sidebar and writes into that document through Office.js.

This is a **document-generation tool**, not a diagnostic system. The included clinical terms are **demonstration data only**. They are not comprehensive, authoritative, or suitable for diagnosis.

## Architecture

```
WORD DOCUMENT
    ↕
OFFICE.JS  (src/word/documentService.ts)
    ↕
TASK PANE  (src/taskpane)
    ↕
LETTER STATE  (in-memory only)     LIBRARY  (localStorage per user)
    ↕                                    ↕
HIERARCHICAL MULTI-SELECT          Customise tab (add / edit / delete)
    ↕
DEFAULT DATA FILES  (src/data/*.json)  — starting lists only
```

- **Manifest:** [`manifest.xml`](manifest.xml) — Word task pane, `ReadWriteDocument`
- **UI:** React + TypeScript + Fluent UI, sized for a narrow Word sidebar
- **Data:** demo JSON catalogs as a starting point; each person can add, edit, and delete sections and reusable text in the **Customise** tab
- **Sharing:** Export / import a `medical-letter-library.json` file. No backend. Custom lists stay on that computer until exported
- **Patient data:** kept in task-pane memory for the Word session only. Reset/clear does not change the document unless you populate or insert again.

### How the add-in talks to Word

1. Office.js loads in the task pane (`office.js`).
2. `Office.onReady` renders the React UI.
3. Insert buttons call `Word.run`, then `document.getSelection().insertText(...)` at the cursor.
4. **Populate Letter** searches the document body, headers, and footers for tokens such as `{{DIAGNOSIS}}` and replaces them with the current form values.
5. Before replacement, font name, size, bold, italic, underline, and colour are read from the placeholder range and written back onto the replacement text so surrounding letter formatting is left alone.

## Requirements

- Windows with Microsoft Word (Microsoft 365 / Office 2016 or later with WebView2)
- Node.js 20 or later
- A trusted localhost HTTPS certificate (`office-addin-dev-certs`)

## Run and sideload into Word

1. In this folder:

   ```powershell
   npm install
   npm start
   ```

2. The first run may ask you to install and trust a development HTTPS certificate. Accept it. Word will not load `https://localhost:3000` until that certificate is trusted.

   If you need to install the certificate separately:

   ```powershell
   npx office-addin-dev-certs install --machine
   ```

3. `npm start` starts the HTTPS webpack server (port in `package.json`, currently 3010), registers [`manifest.xml`](manifest.xml), and launches Word.

4. In Word, open or create a document. On the **Home** tab choose **Medical Letter** to open the task pane.

5. If Word opens but the button is missing:

   - File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs
   - Or use **Insert → Add-ins → My Add-ins → Upload My Add-in** and select `manifest.xml`
   -    Confirm `https://localhost:3000/taskpane.html` loads in a browser (certificate warnings must be resolved)

   If port 3000 is already in use, stop that process or change `config.dev_server_port` in `package.json` **and** every `https://localhost:3000` URL in `manifest.xml`.

6. Stop debugging:

   ```powershell
   npm stop
   ```

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm start` | Sideload into Word desktop and run the dev server |
| `npm run dev-server` | HTTPS server only (no Word launch) |
| `npm run build` | Production webpack build |
| `npm run lint` | ESLint |
| `npm run validate` | Validate the Office manifest |

## Create a Word template

1. Open Word and start from your letterhead (logos, headers, tables, and fonts can stay).
2. Type placeholders as plain text. Do not split a token across two fonts or a line break.

   See [`templates/placeholders.txt`](templates/placeholders.txt).

   Supported tokens:

   `{{PATIENT_NAME}}` `{{DOB}}` `{{PATIENT_ID}}` `{{LETTER_DATE}}` `{{CLINICIAN_NAME}}` `{{CLINICIAN_ROLE}}` `{{DIAGNOSIS}}` `{{MEDICATION}}` `{{INVESTIGATION}}` `{{TREATMENT}}` `{{ASSESSMENT}}` `{{PLAN}}` `{{FOLLOW_UP}}`

3. Optional: open [`templates/sample-letter.html`](templates/sample-letter.html) in Word (**File → Open**) and save as `.docx`.
4. In the add-in, complete the form, review **Preview**, then click **Populate Letter**.
5. Edit the document in Word as usual afterwards.

Empty fields are **not** written into the document. Those placeholders are left in place and reported in the task pane.

## Customise lists for each person

Open the **Customise** tab in the task pane. Each user of the add-in can:

- Add, rename, hide, reorder, or delete sections (lists, free text, or reusable paragraphs)
- Add, edit, or delete groups and items (for example a new diagnosis)
- Add reusable text blocks and insert them at the cursor
- Insert the matching `{{PLACEHOLDER}}` into the Word document while building a template
- **Export library** to a JSON file and give that file to a colleague
- **Import library** to load someone else’s lists
- **Restore demo lists** to go back to the bundled demonstration data

Custom libraries are stored in this computer’s browser/Word storage (`localStorage`). They are not uploaded anywhere. Patient letter details are not included in the export.

## Add a diagnosis (in the add-in)

1. Open **Customise**.
2. Choose **Diagnosis** → **Edit**.
3. Add it under the right group, or add a new group first.

Developers can still seed the default demo lists in [`src/data/diagnoses.json`](src/data/diagnoses.json). Once someone has customised their library, those demo files are only used again after **Restore demo lists**.

## Add a category or reusable paragraph

Use **Customise**: add a group inside a list section, or add a **Reusable paragraphs** section and paste the paragraph text there.

## Privacy

- Patient details stay in the Word session / task-pane memory.
- Nothing is sent to external APIs.
- There is no analytics.
- Demo JSON contains no real patient data.
- Clear selections and Reset form change the task pane only, not the document.

## Office.js limitations

- The add-in cannot read the local filesystem. JSON catalogs are bundled at build time.
- A placeholder split across separate runs (`{{` in one font and `DIAGNOSIS}}` in another) may not match.
- Mixed character formatting *inside* a placeholder token can be flattened. Surrounding paragraphs, tables, headers, logos, and signatures are not rewritten.
- Search is run separately on the body, headers, and footers.
- Office.js needs HTTPS, a trusted dev certificate, and Word with WebView2.
- Insert/populate only work inside Word, not in a standalone browser tab.

## Project layout

| Path | Role |
| --- | --- |
| `manifest.xml` | Word add-in manifest |
| `src/taskpane/` | Task pane entry and App shell |
| `src/components/HierarchicalMultiSelect.tsx` | Reusable category multi-select |
| `src/data/` | Editable JSON catalogs |
| `src/word/documentService.ts` | Office.js insert / replace / detect |
| `src/word/placeholders.ts` | Placeholder tokens and value mapping |
| `src/state/useLetterState.ts` | In-memory letter form state |
| `src/state/useWorkspace.ts` | Per-user library (sections, lists, reusable text) |
| `templates/` | Placeholder list and sample letter |
