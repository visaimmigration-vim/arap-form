# ARAP Previous Application Information Collection System

A simple, professional web application for collecting information from Afghan applicants who have previously submitted an application to the UK Afghan Relocations and Assistance Policy (ARAP).

The system uses **Google Sheets** and **Google Apps Script** as the backend — no database, no authentication, no paid services.

---

## Project Structure

```
/
├── index.html      # Frontend form (Persian/Dari, RTL)
├── style.css       # Professional navy/gold design
├── script.js       # Wizard logic, validation, API communication
├── Code.gs         # Google Apps Script backend (Phase 1)
└── README.md       # This file
```

---

## Phase 1: Google Sheet + Apps Script Setup

### Step 1: Create the Google Sheet

1. Go to [Google Drive](https://drive.google.com) and create a new Google Sheet.
2. Open **Extensions → Apps Script**.
3. Delete any default code in the editor.
4. Open the `Code.gs` file from this project.
5. Copy the entire contents and paste it into the Apps Script editor.
6. Click **Run** and select the `setup` function.
7. Authorize the script when Google prompts you (this is required for the script to create sheets and folders).

The `setup` function automatically creates:
- **Applications** sheet (46 columns for all applicant data)
- **Documents** sheet (7 columns for uploaded files)
- **Family Members** sheet (7 columns for family data)
- **Settings** sheet (configuration values)
- A Google Drive folder called **ARAP Applicant Documents**

### Step 2: Deploy as Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon and select **Web app**.
3. Set the following:
   - **Execute as**: Me
   - **Who has access**: Anyone with the link
4. Click **Deploy**.
5. Copy the `/exec` URL (it looks like `https://script.google.com/macros/s/XXXXX/exec`).

---

## Phase 2: Frontend Setup

### Where to Put the Apps Script URL

Open `script.js` and find this line at the top:

```javascript
const API_URL = "PASTE_APPS_SCRIPT_EXEC_URL_HERE";
```

Replace the placeholder with your actual `/exec` URL. The URL is already configured in this build.

> **Important**: The API URL should only be in this one location in `script.js`. Do not duplicate it elsewhere.

### How to Run the Frontend

The frontend is a static website (HTML + CSS + JavaScript). You can run it in several ways:

**Option A: Local development**
```bash
npm install
npm run dev
```
This starts a local dev server (usually at `http://localhost:5173`).

**Option B: Build for production**
```bash
npm run build
```
This creates a `dist/` folder with the compiled files. You can preview it with:
```bash
npm run preview
```

### How to Publish the Frontend

The built files in `dist/` can be hosted on any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder onto [Netlify Drop](https://app.netlify.com/drop)
- **Vercel**: Run `npx vercel --prod` in the project directory
- **GitHub Pages**: Push the `dist/` contents to a GitHub Pages branch
- **Any web server**: Upload the `dist/` files to your hosting provider

The app is fully client-side — no server-side code is needed for the frontend.

---

## How the Google Sheet Receives Submissions

1. The applicant opens the web form in their browser.
2. They fill in the wizard-style form (9 steps, Persian/Dari, RTL).
3. On the final step, they review their information and click **ثبت معلومات**.
4. The frontend sends a POST request to the Apps Script `/exec` URL with all form data as JSON.
5. The Apps Script `doPost` function:
   - Validates the 7 required fields server-side.
   - Generates a unique Submission ID (format: `ARAP-YYYY-000001`).
   - Saves the application data to the **Applications** sheet.
   - Saves family members to the **Family Members** sheet.
   - Saves uploaded documents to Google Drive and records them in the **Documents** sheet.
6. The frontend receives a success response with the Submission ID and displays it to the applicant.

### Required Fields

Only these 7 fields are mandatory:
- Full Name (نام کامل)
- Father's Name (نام پدر)
- Date of Birth (تاریخ تولد)
- Current Country (کشور محل اقامت فعلی)
- Current City (شهر محل اقامت فعلی)
- Phone / WhatsApp (شماره تلفن / واتساپ)
- Email (آدرس ایمیل)

All other fields are optional and will not block submission.

---

## Where Uploaded Documents Are Stored

- Documents are stored in a Google Drive folder called **ARAP Applicant Documents**.
- Each submission gets its own subfolder named after the Submission ID (e.g., `ARAP-2026-000001`).
- The folder is created automatically by the `setup` function.
- If the folder already exists, it is reused (no duplicates).
- Each document's metadata (name, type, URL, file ID) is recorded in the **Documents** sheet.

### Supported File Types
- PDF
- JPG
- JPEG
- PNG
- Maximum file size: 10 MB

---

## Security Notes

- The frontend communicates only with the Apps Script Web App URL — the Google Sheet is never exposed directly to the browser.
- Submission IDs are generated server-side and never trusted from the client.
- All required fields are validated on the server.
- Text input is sanitized to prevent stored XSS.
- No Google account credentials are included in the code.
- No private Drive folder IDs are exposed in the frontend.

---

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **File Storage**: Google Drive
- **Font**: Vazirmatn (Persian/Arabic script support)
- **Build Tool**: Vite

---

## License

This project is free to use for collecting ARAP application information.
