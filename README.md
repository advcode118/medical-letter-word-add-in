# Medical Letter for Microsoft Word

A task-pane add-in for structured medical letters. The document stays a normal Word file. The add-in is a sidebar that fills it in.

This is a **document-generation tool**, not a diagnostic system. The bundled clinical terms are **demonstration data only**.

**Live add-in (GitHub Pages):** [https://advcode118.github.io/medical-letter-word-add-in/](https://advcode118.github.io/medical-letter-word-add-in/)

---

## Install in Word (for colleagues)

This is a custom Word add-in, not an Office Store app. Word will not install it from the GitHub website. You put the **manifest file** in a **shared folder on your PC**, then tell Word to trust that folder.

Do **not** paste `https://advcode118.github.io/...` into **Catalog Url**. That box wants a Windows folder path such as `\\YOUR-PC\MedicalLetter`.

### 1. Download the install file

Right-click and save:

**[manifest.xml](https://advcode118.github.io/medical-letter-word-add-in/manifest.xml)**

Use this file, not the `manifest.xml` inside the source code folder (that one is only for developers).

### 2. Put it in a shared folder

1. In File Explorer, create a folder such as `C:\MedicalLetter`.
2. Copy `manifest.xml` into that folder (the XML file itself, not a zip, and not a subfolder).
3. Right-click the folder → **Properties** → **Sharing** → **Share**.
4. Share it with yourself (or **Everyone**). Click **Share**, then **Done**.
5. On the **Sharing** tab, copy the network path. It looks like:

   `\\LAPTOP-NAME\MedicalLetter`

   If you only see `C:\MedicalLetter`, you have not shared it yet. Catalog Url must start with `\\`.

### 3. Trust that folder in Word

This is the **Trusted Add-in Catalogs** screen (File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs).

1. In **Catalog Url**, paste the `\\LAPTOP-NAME\MedicalLetter` path.
2. Click **Add catalog**.
3. In the table, tick **Show in Menu** for that row. If you skip this, the add-in never appears.
4. Click **OK** on every dialog.
5. **Quit Word completely** (close all windows) and open it again.

### 4. Insert it from Shared Folder

1. Open a document.
2. **Home → Add-ins → Advanced** (or **Insert → My Add-ins**).
3. Open the **SHARED FOLDER** tab at the top (not STORE, not MY ADD-INS).
4. Select **Medical Letter** → **Add**.
5. Use **Home → Medical Letter** to open the sidebar.

You need internet when the sidebar loads (the UI comes from GitHub Pages). Patient details stay in Word on your computer.

### What to send a colleague

Send them [the install page](https://advcode118.github.io/medical-letter-word-add-in/) and this production manifest:

`https://advcode118.github.io/medical-letter-word-add-in/manifest.xml`

Each person repeats the shared-folder steps on their own PC, unless IT puts the same `manifest.xml` on a shared drive everyone can use (`\\SERVER\Addins`) and they all add that one Catalog Url.

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
