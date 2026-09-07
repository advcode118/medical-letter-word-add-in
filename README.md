# Medical Letter for Microsoft Word

A task-pane add-in for structured medical letters. The document stays a normal Word file. The add-in is a sidebar that fills it in.

This is a **document-generation tool**, not a diagnostic system. The bundled clinical terms are **demonstration data only**.

**Live add-in (GitHub Pages):** [https://advcode118.github.io/medical-letter-word-add-in/](https://advcode118.github.io/medical-letter-word-add-in/)

---

## Install in Word (for colleagues)

You do not need Node.js. You only need Word on Windows and the install file below.

1. Download **[manifest.xml](https://advcode118.github.io/medical-letter-word-add-in/manifest.xml)** (right-click → Save link as).
2. Open Microsoft Word.
3. Choose **Insert → Add-ins → My Add-ins**.
4. Open **Upload My Add-in** (it may be under the **…** menu) and select the `manifest.xml` you downloaded.
5. On the **Home** tab, choose **Medical Letter**.

Word loads the sidebar from GitHub Pages. After that, use the add-in like any other Home-tab button.

If the button is missing: **File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs**, or upload the manifest again as above.

You need internet when the sidebar first loads. Patient details and the letter itself stay in Word on your computer. They are not uploaded to GitHub.

### What to send a colleague

Send them this page, or only the production manifest:

`https://advcode118.github.io/medical-letter-word-add-in/manifest.xml`

Do **not** send the `manifest.xml` from the source folder of this repo. That copy points at `localhost` and only works on a developer machine.

---

## How to use it

### Write a letter

1. Open a **blank** Word document, or letterhead with an empty body.
2. Fill **Patient** details.
3. Tick items in Diagnosis, Medication, and the other lists. Type in **Other** for a one-off value that is not in the list (this letter only; it is not saved to your lists).
4. Click **Populate Letter**. On a blank document this inserts the letter layout and replaces placeholders such as `{{DIAGNOSIS}}` with your values.
5. **Insert template** puts the layout in without filling values, so you can complete the form and populate afterwards.

Empty fields are left as placeholders until you fill them and populate again. Edit the Word document as usual after that.

### Customise (lists and layout)

Open the **Customise** tab.

- **Letter template** — the text inserted into a blank document. Use `**bold**` for headings. Click a `{{PLACEHOLDER}}` button to insert it at the cursor.
- Each section (Diagnosis, and so on) can be expanded to edit lists, rename the section, or hide it from the Letter tab.
- **Export library** / **Import library** shares lists and the letter template as a JSON file. Patient data is not included.
- **Restore demo lists** puts the demonstration terminology back. **Restore default template** rebuilds the sample letter layout from your current sections.

Custom lists stay on that computer until you export them.

---

## Privacy

- Patient details stay in the Word session / task-pane memory.
- The add-in UI (HTML and JavaScript) is downloaded from GitHub Pages. Letter content is not sent there.
- Nothing is posted to external APIs. There is no analytics.
- Demo JSON contains no real patient data.

---

## Develop locally

Requirements: Windows, Microsoft Word (Microsoft 365 / Office 2016 or later with WebView2), Node.js 20 or later.

```powershell
npm install
npm start
```

The first run may ask you to trust a development HTTPS certificate. The source `manifest.xml` uses `https://localhost:3010`.

| Script | Purpose |
| --- | --- |
| `npm start` | Sideload into Word and run the dev server |
| `npm run dev-server` | HTTPS server only |
| `npm run build` | Production files in `dist/` (URLs rewritten for GitHub Pages) |
| `npm stop` | Stop debugging |

Production URL used by the webpack build:

`https://advcode118.github.io/medical-letter-word-add-in/`

Pushing to `main` builds `dist` and publishes it to GitHub Pages via `.github/workflows/deploy-pages.yml`.

---

## Project layout

| Path | Role |
| --- | --- |
| `manifest.xml` | Development manifest (`localhost`) |
| `public/index.html` | Install page published to GitHub Pages |
| `src/taskpane/` | Task pane entry and app shell |
| `src/word/` | Office.js insert / replace / letter template |
| `src/state/` | In-memory letter form and per-user library |
| `src/data/` | Demonstration JSON catalogs |
| `templates/` | Sample placeholders |

## Office.js notes

- A placeholder split across two fonts or a line break may not match.
- Surrounding letterhead, headers, logos, and tables are not rewritten.
- Insert and populate only work inside Word, not in a standalone browser tab.
