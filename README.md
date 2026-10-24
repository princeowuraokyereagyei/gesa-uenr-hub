# GESA-UENR Academic Resource Hub

A free static website (HTML, CSS, vanilla JS). No server, no paid service, no domain to buy. All content lives in JSON files.

## 1. Put it online (GitHub Pages)
1. Create a free account at github.com, click **New repository**, name it `gesa-uenr-hub`, set it to **Public**.
2. Click **uploading an existing file**, drag in everything from this folder (keep the folders), then **Commit changes**.
3. Go to **Settings > Pages**. Under **Branch** choose `main` and `/ (root)`, then **Save**.
4. After 1 to 2 minutes your site is at `https://<your-username>.github.io/gesa-uenr-hub/`. Share that link.

## 2. Folder layout
- `data/programmes.json` the 2 schools and 8 programmes
- `data/courses/<programme>.json` courses per level and semester (Petroleum Level 100 Sem 1 is filled in)
- `data/resources.json` every slide, book, past question and tutorial
- `data/links.json`, `books.json`, `forms.json`, `cv.json`, `site.json` the other pages
- `materials/<programme>/<level>/<semester>/<COURSE>/<category>/` your PDF and PPT files
- `admin.html` the Admin Helper

## 3. Add a material
1. Open `admin.html` on your live site (or locally). Fill in the form.
2. It shows a **file path**. In GitHub open that folder (use **Add file > Create new file**, type the path to create folders, or **Upload files**) and upload your file with the exact name shown.
3. Copy the **JSON** it generates, open `data/resources.json`, click the pencil icon, paste it inside `"items": [ ]` (put a comma between entries), then **Commit changes**.
4. Wait a minute and refresh the site.

**Large files (over 100 MB, GitHub's limit):** upload to Google Drive, share as "Anyone with the link", paste the link into the `External link` field. Leave the file path empty.

**File naming:** `COURSECODE_Category_Lecturer_Year.ext`, for example `MATH109_Slides_DrAsante_2026.pdf`, `MATH109_PastQuestion_2025.pdf`. No spaces.

## 4. Add courses
Open `data/courses/<programme>.json` and add `{ "code": "MATH 109", "name": "Engineering Mathematics I", "credits": 3 }` inside the right `level-X` > `sem-X` list. Empty lists show "Materials coming soon".

## 5. Update or delete
- **Change** details: edit the entry in `resources.json` (pencil icon, commit).
- **Delete**: remove its entry from `resources.json` and delete the file in `materials/` (open the file, click the bin icon, commit).

## 6. Forms, links, books, CV templates
Edit `forms.json`, `links.json`, `books.json`. For CV templates, upload the DOCX/PDF to `materials/templates/` and put its path in the `url` of `cv.json`.

## 7. Security, honestly
`admin.html` is only a helper that writes text for you. It does not log anyone in and protects nothing. **Real access control is GitHub**: only people you add under Settings > Collaborators can change the site. Give access to committee members only.

## 8. Other notes
- Dark/light mode and last-visited page are remembered in the browser. There is no tracking and no analytics.
- Installable as an app (PWA) and works offline for pages already visited.
- Decap CMS was left out on purpose: it needs an extra login server to work reliably on GitHub Pages.
- Not included yet: QR codes for forms, template thumbnails. Share form links directly or generate QR codes with any free QR tool.
