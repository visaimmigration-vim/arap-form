/**
 * ARAP Previous Application Information Collection System
 * Google Apps Script Backend (Phase 1)
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet in Google Drive.
 * 2. Open Extensions → Apps Script.
 * 3. Delete any default code and paste this entire file.
 * 4. Click Run → select "setup" function.
 * 5. Authorize the script when prompted.
 * 6. Deploy → New deployment → Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone with the link
 * 7. Copy the /exec URL and paste it into the frontend script.js API_URL variable.
 */

// ============================================================
// CONFIGURATION
// ============================================================

var APP_NAME = "ARAP Previous Application Information Collection System";
var APP_VERSION = "1.0.0";
var DRIVE_FOLDER_NAME = "ARAP Applicant Documents";

var REQUIRED_FIELDS = [
  "fullName",
  "fathersName",
  "dateOfBirth",
  "currentCountry",
  "currentCity",
  "phoneWhatsapp",
  "email"
];

var APPLICATION_HEADERS = [
  "Submission ID",
  "Submission Date",
  "Full Name",
  "Father's Name",
  "Date of Birth",
  "Current Country",
  "Current City",
  "Phone / WhatsApp",
  "Email",
  "ARAP Previously Applied",
  "ARAP Application Date",
  "Application Reference Number",
  "UAN",
  "Previous Application Email",
  "Previous Application Phone",
  "Current Case Status",
  "Current Case Explanation",
  "Previous Refusal",
  "Refusal Date",
  "Refusal Reason",
  "Review Submitted",
  "Review Date",
  "Review Result",
  "Employment Organization",
  "Job Title",
  "Unit / Department",
  "Employment Location",
  "Employment Start Date",
  "Employment End Date",
  "Employee ID",
  "Project / Program",
  "Employment Description",
  "Threatened",
  "Threat Description",
  "Threat Date",
  "Family Members Included",
  "Current Visa / Residence Type",
  "Residence Expiry Date",
  "Previous UK Travel",
  "Previous UK Visa",
  "Other UK Immigration Application",
  "Other Country Immigration Case",
  "Additional Information",
  "Confirmation",
  "User IP / Technical Identifier",
  "User Agent"
];

var DOCUMENTS_HEADERS = [
  "Submission ID",
  "Upload Date",
  "Applicant Name",
  "Document Type",
  "File Name",
  "File URL",
  "File ID"
];

var FAMILY_MEMBERS_HEADERS = [
  "Submission ID",
  "Applicant Name",
  "Family Member Full Name",
  "Relationship",
  "Date of Birth",
  "Passport Number",
  "Notes"
];

var SETTINGS_HEADERS = [
  "Setting",
  "Value"
];

// ============================================================
// SETUP FUNCTION — Run this once to initialize everything
// ============================================================

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create or fetch all sheets
  var applicationsSheet = getOrCreateSheet(ss, "Applications");
  var documentsSheet = getOrCreateSheet(ss, "Documents");
  var familyMembersSheet = getOrCreateSheet(ss, "Family Members");
  var settingsSheet = getOrCreateSheet(ss, "Settings");

  // Set headers
  setHeaders(applicationsSheet, APPLICATION_HEADERS);
  setHeaders(documentsSheet, DOCUMENTS_HEADERS);
  setHeaders(familyMembersSheet, FAMILY_MEMBERS_HEADERS);
  setHeaders(settingsSheet, SETTINGS_HEADERS);

  // Populate Settings
  populateSettings(settingsSheet, ss);

  // Create or fetch the Drive folder
  var folder = getOrCreateDriveFolder();

  // Store folder ID in settings
  updateSetting(settingsSheet, "Google Drive Folder ID", folder.getId());
  updateSetting(settingsSheet, "Spreadsheet ID", ss.getId());

  // Format header rows
  formatHeaderRow(applicationsSheet);
  formatHeaderRow(documentsSheet);
  formatHeaderRow(familyMembersSheet);
  formatHeaderRow(settingsSheet);

  // Freeze header rows
  applicationsSheet.setFrozenRows(1);
  documentsSheet.setFrozenRows(1);
  familyMembersSheet.setFrozenRows(1);
  settingsSheet.setFrozenRows(1);

  Logger.log("Setup complete!");
  Logger.log("Spreadsheet ID: " + ss.getId());
  Logger.log("Drive Folder ID: " + folder.getId());
  Logger.log("Folder URL: " + folder.getUrl());
}

// ============================================================
// SHEET HELPERS
// ============================================================

function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function setHeaders(sheet, headers) {
  var existingData = sheet.getDataRange().getValues();
  if (existingData.length > 0) {
    // Clear only the header row to preserve data
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function formatHeaderRow(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) return;
  var range = sheet.getRange(1, 1, 1, lastColumn);
  range.setBackground("#1a365d");
  range.setFontColor("#ffffff");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  range.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 30);
}

function populateSettings(sheet, ss) {
  var settings = [
    ["Application Name", APP_NAME],
    ["Version", APP_VERSION],
    ["Created Date", new Date().toISOString()],
    ["Google Drive Folder ID", ""],
    ["Spreadsheet ID", ss.getId()]
  ];
  // Only write if settings area is empty
  var existing = sheet.getDataRange().getValues();
  var hasData = false;
  for (var i = 1; i < existing.length; i++) {
    if (existing[i][0]) { hasData = true; break; }
  }
  if (!hasData) {
    sheet.getRange(2, 1, settings.length, 2).setValues(settings);
  } else {
    // Update known values
    updateSetting(sheet, "Application Name", APP_NAME);
    updateSetting(sheet, "Version", APP_VERSION);
    updateSetting(sheet, "Spreadsheet ID", ss.getId());
  }
}

function updateSetting(sheet, settingName, value) {
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === settingName) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  // Not found, append
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, 2).setValues([[settingName, value]]);
}

function getSetting(sheet, settingName) {
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === settingName) return data[i][1];
  }
  return "";
}

// ============================================================
// DRIVE FOLDER HELPER
// ============================================================

function getOrCreateDriveFolder() {
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function getOrCreateSubmissionFolder(folder, submissionId) {
  var subfolders = folder.getFoldersByName(submissionId);
  if (subfolders.hasNext()) {
    return subfolders.next();
  }
  return folder.createFolder(submissionId);
}

// ============================================================
// SUBMISSION ID GENERATION
// ============================================================

function generateSubmissionId() {
  var year = new Date().getFullYear();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Applications");

  var prefix = "ARAP-" + year + "-";
  var count = 0;

  if (sheet && sheet.getLastRow() > 1) {
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < data.length; i++) {
      var val = data[i][0];
      if (val && String(val).indexOf(prefix) === 0) {
        var numPart = parseInt(String(val).substring(prefix.length), 10);
        if (!isNaN(numPart) && numPart > count) {
          count = numPart;
        }
      }
    }
  }

  count++;
  var padded = String(count);
  while (padded.length < 6) { padded = "0" + padded; }
  return prefix + padded;
}

// ============================================================
// WEB APP ENTRY POINTS
// ============================================================

function doGet(e) {
  return jsonOutput({
    success: true,
    message: "ARAP API is running.",
    version: APP_VERSION
  });
}

function doPost(e) {
  try {
    var payload;
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      return jsonOutput({
        success: false,
        message: "هیچ معلومات دریافت نشد."
      });
    }

    var action = payload.action || "submit";

    if (action === "submit") {
      return handleSubmit(payload);
    } else if (action === "ping") {
      return jsonOutput({ success: true, message: "Pong" });
    } else {
      return jsonOutput({
        success: false,
        message: "درخواست نامعتبر."
      });
    }
  } catch (err) {
    Logger.log("doPost error: " + err);
    return jsonOutput({
      success: false,
      message: "خطای سیستمی رخ داد. لطفاً بعداً دوباره تلاش کنید."
    });
  }
}

// ============================================================
// SUBMISSION HANDLER
// ============================================================

function handleSubmit(payload) {
  // Validate required fields
  var missing = [];
  for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
    var field = REQUIRED_FIELDS[i];
    var value = payload[field];
    if (value === undefined || value === null || String(value).trim() === "") {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return jsonOutput({
      success: false,
      message: "اطلاعات ضروری تکمیل نشده است.",
      missingFields: missing
    });
  }

  // Validate email format
  var email = String(payload.email).trim();
  if (!isValidEmail(email)) {
    return jsonOutput({
      success: false,
      message: "آدرس ایمیل معتبر نیست."
    });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var applicationsSheet = ss.getSheetByName("Applications");
  var documentsSheet = ss.getSheetByName("Documents");
  var familyMembersSheet = ss.getSheetByName("Family Members");
  var settingsSheet = ss.getSheetByName("Settings");

  // Generate submission ID server-side
  var submissionId = generateSubmissionId();
  var submissionDate = new Date();

  // Build the row matching APPLICATION_HEADERS order
  var row = [
    submissionId,
    submissionDate,
    sanitize(payload.fullName),
    sanitize(payload.fathersName),
    sanitize(payload.dateOfBirth),
    sanitize(payload.currentCountry),
    sanitize(payload.currentCity),
    sanitize(payload.phoneWhatsapp),
    sanitize(payload.email),
    sanitize(payload.arapPreviouslyApplied),
    sanitize(payload.arapApplicationDate),
    sanitize(payload.applicationReferenceNumber),
    sanitize(payload.uan),
    sanitize(payload.previousApplicationEmail),
    sanitize(payload.previousApplicationPhone),
    sanitize(payload.currentCaseStatus),
    sanitize(payload.currentCaseExplanation),
    sanitize(payload.previousRefusal),
    sanitize(payload.refusalDate),
    sanitize(payload.refusalReason),
    sanitize(payload.reviewSubmitted),
    sanitize(payload.reviewDate),
    sanitize(payload.reviewResult),
    sanitize(payload.employmentOrganization),
    sanitize(payload.jobTitle),
    sanitize(payload.unitDepartment),
    sanitize(payload.employmentLocation),
    sanitize(payload.employmentStartDate),
    sanitize(payload.employmentEndDate),
    sanitize(payload.employeeId),
    sanitize(payload.projectProgram),
    sanitize(payload.employmentDescription),
    sanitize(payload.threatened),
    sanitize(payload.threatDescription),
    sanitize(payload.threatDate),
    sanitize(payload.familyMembersIncluded),
    sanitize(payload.currentVisaResidenceType),
    sanitize(payload.residenceExpiryDate),
    sanitize(payload.previousUKTravel),
    sanitize(payload.previousUKVisa),
    sanitize(payload.otherUKImmigrationApplication),
    sanitize(payload.otherCountryImmigrationCase),
    sanitize(payload.additionalInformation),
    sanitize(payload.confirmation),
    getTechnicalIdentifier(payload),
    getUserAgent(payload)
  ];

  applicationsSheet.appendRow(row);

  // Save family members
  var familyMembers = payload.familyMembers;
  if (familyMembers && Array.isArray(familyMembers) && familyMembers.length > 0) {
    for (var f = 0; f < familyMembers.length; f++) {
      var fm = familyMembers[f];
      var fmRow = [
        submissionId,
        sanitize(payload.fullName),
        sanitize(fm.fullName),
        sanitize(fm.relationship),
        sanitize(fm.dateOfBirth),
        sanitize(fm.passportNumber),
        sanitize(fm.notes)
      ];
      familyMembersSheet.appendRow(fmRow);
    }
  }

  // Save documents
  var documents = payload.documents;
  if (documents && Array.isArray(documents) && documents.length > 0) {
    var folder = getOrCreateDriveFolder();
    var subfolder = getOrCreateSubmissionFolder(folder, submissionId);

    for (var d = 0; d < documents.length; d++) {
      var doc = documents[d];
      try {
        var file = saveFileToDrive(subfolder, doc);
        var docRow = [
          submissionId,
          new Date(),
          sanitize(payload.fullName),
          sanitize(doc.documentType),
          file.getName(),
          file.getUrl(),
          file.getId()
        ];
        documentsSheet.appendRow(docRow);
      } catch (fileErr) {
        Logger.log("File save error: " + fileErr);
        // Still record the metadata even if file save fails
        var docRowErr = [
          submissionId,
          new Date(),
          sanitize(payload.fullName),
          sanitize(doc.documentType),
          sanitize(doc.fileName || "Unknown"),
          "FILE_SAVE_ERROR",
          ""
        ];
        documentsSheet.appendRow(docRowErr);
      }
    }
  }

  return jsonOutput({
    success: true,
    submissionId: submissionId,
    message: "معلومات شما با موفقیت ثبت شد."
  });
}

// ============================================================
// FILE SAVE HELPER
// ============================================================

function saveFileToDrive(folder, doc) {
  // doc.fileName, doc.mimeType, doc.data (base64)
  var fileName = doc.fileName || ("document_" + Date.now());
  var mimeType = doc.mimeType || "application/octet-stream";
  var base64Data = doc.data || "";

  // Remove data URI prefix if present
  var commaIndex = base64Data.indexOf(",");
  if (commaIndex !== -1) {
    base64Data = base64Data.substring(commaIndex + 1);
  }

  var bytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(bytes, mimeType, fileName);
  return folder.createFile(blob);
}

// ============================================================
// VALIDATION & SANITIZATION
// ============================================================

function isValidEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).trim());
}

function sanitize(value) {
  if (value === undefined || value === null) return "";
  var str = String(value);
  // Remove script tags and event handlers to prevent stored XSS
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  str = str.replace(/javascript:/gi, "");
  str = str.replace(/on\w+\s*=/gi, "");
  return str.trim();
}

function getTechnicalIdentifier(payload) {
  return sanitize(payload.userIP || payload.technicalIdentifier || "");
}

function getUserAgent(payload) {
  return sanitize(payload.userAgent || "");
}

// ============================================================
// JSON OUTPUT HELPER
// ============================================================

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
