# Medical Letter for Microsoft Word

A task-pane add-in for structured medical letters. The document stays a normal Word file. The add-in is a sidebar that fills it in.

This is a **document-generation tool**, not a diagnostic system. The bundled clinical terms are **demonstration data only**.

**Live add-in (GitHub Pages):** [https://advcode118.github.io/medical-letter-word-add-in/](https://advcode118.github.io/medical-letter-word-add-in/)

---

## Install in Word (for colleagues)

Skip **Trusted Add-in Catalogs**. That screen only accepts a SharePoint `https://` catalog, not GitHub Pages and not a normal folder.

Use the installer instead. It registers the add-in for your Windows account the same way a developer sideload works.

### Recommended: run the installer

1. Close Word.
2. Download **[Install-MedicalLetter.cmd](https://advcode118.github.io/medical-letter-word-add-in/Install-MedicalLetter.cmd)** and save it somewhere easy, such as Downloads.
3. Double-click it. If Windows asks, choose **More info → Run anyway**.
4. Open Word. On the **Home** tab, choose **Medical Letter**.

If the `.cmd` file is blocked, open **PowerShell** and paste:

```powershell
irm https://advcode118.github.io/medical-letter-word-add-in/Install-MedicalLetter.ps1 | iex
```

Then close Word completely and open it again.

To remove it later, run **[Uninstall-MedicalLetter.ps1](https://advcode118.github.io/medical-letter-word-add-in/Uninstall-MedicalLetter.ps1)** the same way.

You need internet when the sidebar loads (the UI comes from GitHub Pages). Patient details stay in Word on your computer.

### Organisation install

If you have a Microsoft 365 admin, they can upload the production `manifest.xml` under **Integrated apps** so it appears for everyone. That is the only `https://` catalog path that Word’s Trust Center is meant for.

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
