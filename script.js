/* ============================================================
   ARAP Information Collection System — Frontend Logic
   ============================================================ */

// ============================================================
// CONFIGURATION — Paste your Apps Script /exec URL here
// ============================================================
const API_URL = "https://script.google.com/macros/s/AKfycbxecI1nr055fwHr1-HZLe6a-TfQiFyFSQAdloDRg_1tLXAS1kze1vKuXVE3ty1WeO0mzw/exec";

// ============================================================
// STATE
// ============================================================
let currentStep = 1;
const TOTAL_STEPS = 8;
let familyMemberCount = 0;

const REQUIRED_FIELDS = [
  { id: "fullName", label: "نام و نام خانوادگی" },
  { id: "fathersName", label: "نام پدر" },
  { id: "dateOfBirth", label: "تاریخ تولد" },
  { id: "currentCountry", label: "کشور فعلی محل اقامت" },
  { id: "currentCity", label: "شهر فعلی" },
  { id: "phoneWhatsapp", label: "شماره تلفن / WhatsApp" },
  { id: "email", label: "ایمیل" },
];

// ============================================================
// DOM ELEMENTS
// ============================================================
const formCard = document.getElementById("formCard");
const successCard = document.getElementById("successCard");
const progressContainer = document.getElementById("progressContainer");
const progressStep = document.getElementById("progressStep");
const progressBarFill = document.getElementById("progressBarFill");
const progressSteps = document.getElementById("progressSteps");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const errorBanner = document.getElementById("errorBanner");
const errorBannerText = document.getElementById("errorBannerText");
const summaryContent = document.getElementById("summaryContent");
const addFamilyMemberBtn = document.getElementById("addFamilyMemberBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");
const newRequestBtn = document.getElementById("newRequestBtn");

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  buildProgressDots();
  showStep(1);
  prevBtn.addEventListener("click", goToPrevStep);
  nextBtn.addEventListener("click", goToNextStep);
  submitBtn.addEventListener("click", handleSubmit);
  addFamilyMemberBtn.addEventListener("click", addFamilyMember);
  newRequestBtn.addEventListener("click", resetForm);
  setupFileUploads();
});

// ============================================================
// PROGRESS DOTS
// ============================================================
function buildProgressDots() {
  progressSteps.innerHTML = "";
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.createElement("span");
    dot.className = "progress-step-dot";
    dot.textContent = toPersianNum(i);
    dot.dataset.step = i;
    progressSteps.appendChild(dot);
  }
}

function toPersianNum(n) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => persianDigits[d]);
}

function updateProgressDots() {
  document.querySelectorAll(".progress-step-dot").forEach((dot) => {
    const step = parseInt(dot.dataset.step, 10);
    dot.classList.remove("active", "completed");
    if (step < currentStep) {
      dot.classList.add("completed");
    } else if (step === currentStep) {
      dot.classList.add("active");
    }
  });
}

// ============================================================
// STEP NAVIGATION
// ============================================================
function showStep(step) {
  document.querySelectorAll(".form-step").forEach((el) => {
    el.style.display = "none";
  });
  const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  if (stepEl) stepEl.style.display = "block";

  progressStep.textContent = `مرحله ${toPersianNum(step)} از ${toPersianNum(TOTAL_STEPS)}`;
  progressBarFill.style.width = `${(step / TOTAL_STEPS) * 100}%`;
  progressContainer.style.display = "block";
  updateProgressDots();

  prevBtn.style.display = step > 1 ? "flex" : "none";
  nextBtn.style.display = step < TOTAL_STEPS ? "flex" : "none";
  submitBtn.style.display = step === TOTAL_STEPS ? "flex" : "none";

  if (step === TOTAL_STEPS) {
    buildSummary();
  }

  formCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function goToNextStep() {
  if (currentStep === 1) {
    if (!validateStep1()) return;
  }
  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    showStep(currentStep);
  }
}

function goToPrevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

// ============================================================
// VALIDATION — Step 1 (required fields)
// ============================================================
function validateStep1() {
  let isValid = true;
  let firstErrorId = null;

  REQUIRED_FIELDS.forEach((field) => {
    const el = document.getElementById(field.id);
    const errorEl = document.getElementById(`error-${field.id}`);
    const value = el ? el.value.trim() : "";

    if (!value) {
      isValid = false;
      if (el) el.closest(".field").classList.add("has-error");
      if (errorEl) errorEl.textContent = "این فیلد الزامی است.";
      if (!firstErrorId) firstErrorId = field.id;
    } else {
      if (el) el.closest(".field").classList.remove("has-error");
      if (errorEl) errorEl.textContent = "";
    }
  });

  if (isValid) {
    const emailEl = document.getElementById("email");
    const emailError = document.getElementById("error-email");
    if (emailEl && !isValidEmail(emailEl.value.trim())) {
      isValid = false;
      emailEl.closest(".field").classList.add("has-error");
      if (emailError) emailError.textContent = "آدرس ایمیل معتبر نیست.";
      if (!firstErrorId) firstErrorId = "email";
    }
  }

  if (!isValid && firstErrorId) {
    const el = document.getElementById(firstErrorId);
    if (el) el.focus();
  }

  return isValid;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================
// FAMILY MEMBERS
// ============================================================
function addFamilyMember() {
  familyMemberCount++;
  const container = document.getElementById("familyMembersContainer");
  const card = document.createElement("div");
  card.className = "family-member-card";
  card.dataset.memberIndex = familyMemberCount;
  card.innerHTML = `
    <h4>
      عضو خانواده ${toPersianNum(familyMemberCount)}
      <button type="button" class="btn-remove-member" onclick="removeFamilyMember(this)">حذف</button>
    </h4>
    <div class="field-group">
      <div class="field">
        <label>نام</label>
        <input type="text" data-fm="fullName" placeholder="نام کامل عضو خانواده" />
      </div>
      <div class="field">
        <label>نام پدر</label>
        <input type="text" data-fm="fathersName" placeholder="نام پدر عضو خانواده" />
      </div>
      <div class="field-row">
        <div class="field">
          <label>نسبت</label>
          <input type="text" data-fm="relationship" placeholder="مثال: پسر، همسر" />
        </div>
        <div class="field">
          <label>تاریخ تولد</label>
          <input type="date" data-fm="dateOfBirth" />
        </div>
      </div>
      <div class="field">
        <label>شماره پاسپورت / تذکره</label>
        <input type="text" data-fm="passportNumber" placeholder="شماره پاسپورت یا تذکره" />
      </div>
      <div class="field">
        <label>توضیحات</label>
        <textarea data-fm="notes" rows="2" placeholder="یادداشت اضافی..."></textarea>
      </div>
    </div>
  `;
  container.appendChild(card);
}

function removeFamilyMember(btn) {
  const card = btn.closest(".family-member-card");
  if (card) card.remove();
}

function getFamilyMembersData() {
  const members = [];
  document.querySelectorAll(".family-member-card").forEach((card) => {
    const member = {};
    card.querySelectorAll("[data-fm]").forEach((input) => {
      member[input.dataset.fm] = input.value.trim();
    });
    members.push(member);
  });
  return members;
}

// ============================================================
// FILE UPLOADS
// ============================================================
function setupFileUploads() {
  document.querySelectorAll(".file-input").forEach((input) => {
    input.addEventListener("change", handleFileSelect);
  });

  document.querySelectorAll(".file-upload-area").forEach((area) => {
    area.addEventListener("dragover", (e) => {
      e.preventDefault();
      area.style.borderColor = "var(--royal-500)";
      area.style.background = "var(--royal-100)";
    });
    area.addEventListener("dragleave", (e) => {
      e.preventDefault();
      area.style.borderColor = "";
      area.style.background = "";
    });
    area.addEventListener("drop", (e) => {
      e.preventDefault();
      area.style.borderColor = "";
      area.style.background = "";
      const input = area.querySelector(".file-input");
      if (input && e.dataTransfer.files.length > 0) {
        input.files = e.dataTransfer.files;
        handleFileSelect({ target: input });
      }
    });
  });
}

function handleFileSelect(e) {
  const input = e.target;
  const area = input.closest(".file-upload-area");
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  const validExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
  const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
    showErrorBanner("فرمت فایل مجاز نیست. فقط PDF، JPG، JPEG، PNG.");
    input.value = "";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showErrorBanner("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.");
    input.value = "";
    return;
  }

  area.classList.add("has-file");
  const label = area.querySelector(".file-upload-label");
  label.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="upload-icon">
      <path d="M9 12l2 2 4-4M12 22a10 10 0 100-20 10 10 0 000 20z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="file-name-display">${escapeHtml(file.name)}</span>
  `;
}

function getDocumentsData() {
  const documents = [];
  const promises = [];

  document.querySelectorAll(".file-input").forEach((input) => {
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const docType = input.dataset.docType;
      const promise = fileToBase64(file).then((base64) => {
        documents.push({
          documentType: docType,
          fileName: file.name,
          mimeType: file.type,
          data: base64,
        });
      });
      promises.push(promise);
    }
  });

  return Promise.all(promises).then(() => documents);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
// SUMMARY
// ============================================================
function buildSummary() {
  const sections = [
    {
      title: "اطلاعات شخصی",
      fields: [
        { id: "fullName", label: "نام و نام خانوادگی" },
        { id: "fathersName", label: "نام پدر" },
        { id: "dateOfBirth", label: "تاریخ تولد" },
        { id: "currentCountry", label: "کشور محل اقامت" },
        { id: "currentCity", label: "شهر محل اقامت" },
        { id: "phoneWhatsapp", label: "شماره تلفن / WhatsApp" },
        { id: "email", label: "ایمیل" },
      ],
    },
    {
      title: "معلومات درخواست ARAP",
      fields: [
        { id: "arapPreviouslyApplied", label: "قبلاً درخواست ثبت کرده‌اید؟" },
        { id: "arapApplicationDate", label: "تاریخ درخواست" },
        { id: "applicationReferenceNumber", label: "شماره مرجع" },
        { id: "uan", label: "شماره UAN" },
        { id: "previousApplicationEmail", label: "ایمیل قبلی" },
        { id: "previousApplicationPhone", label: "تلفن قبلی" },
        { id: "currentCaseStatus", label: "وضعیت فعلی پرونده" },
        { id: "currentCaseExplanation", label: "توضیح وضعیت" },
        { id: "previousRefusal", label: "درخواست رد شده؟" },
        { id: "refusalDate", label: "تاریخ رد" },
        { id: "refusalReason", label: "دلیل رد" },
        { id: "reviewSubmitted", label: "بازبینی کرده‌اید؟" },
        { id: "reviewDate", label: "تاریخ بازبینی" },
        { id: "reviewResult", label: "نتیجه بازبینی" },
      ],
    },
    {
      title: "معلومات کاری",
      fields: [
        { id: "employmentOrganization", label: "نام سازمان" },
        { id: "jobTitle", label: "وظیفه / سمت" },
        { id: "unitDepartment", label: "بخش / Unit" },
        { id: "employmentLocation", label: "محل کار" },
        { id: "employmentStartDate", label: "تاریخ شروع" },
        { id: "employmentEndDate", label: "تاریخ پایان" },
        { id: "employeeId", label: "شماره کارمندی" },
        { id: "projectProgram", label: "نام پروژه" },
        { id: "employmentDescription", label: "شرح وظیفه" },
      ],
    },
    {
      title: "اعضای خانواده",
      fields: [{ id: "familyMembersIncluded", label: "اعضای خانواده شامل بودند؟" }],
    },
    {
      title: "تهدید و امنیت",
      fields: [
        { id: "threatened", label: "تهدید شده‌اید؟" },
        { id: "threatDescription", label: "شرح تهدید" },
        { id: "threatDate", label: "تاریخ / محل حادثه" },
        { id: "familyThreatened", label: "خانواده تهدید شده‌اند؟" },
      ],
    },
    {
      title: "معلومات مهاجرت",
      fields: [
        { id: "currentVisaResidenceType", label: "نوع اقامت" },
        { id: "residenceExpiryDate", label: "تاریخ اعتبار اقامت" },
        { id: "previousUKTravel", label: "سفر به بریتانیا" },
        { id: "previousUKVisa", label: "ویزای بریتانیا" },
        { id: "otherUKImmigrationApplication", label: "درخواست مهاجرتی بریتانیا" },
        { id: "otherCountryImmigrationCase", label: "پرونده مهاجرتی سایر کشور" },
        { id: "additionalImmigrationInfo", label: "توضیحات اضافی" },
      ],
    },
    {
      title: "معلومات اضافی",
      fields: [{ id: "additionalInformation", label: "معلومات اضافی" }],
    },
  ];

  let html = "";

  sections.forEach((section) => {
    html += `<div class="summary-section">`;
    html += `<h3>${section.title}</h3>`;
    section.fields.forEach((field) => {
      const el = document.getElementById(field.id);
      const value = el ? el.value.trim() : "";
      const displayValue = value || "—";
      const valueClass = value ? "summary-value" : "summary-value empty";
      html += `<div class="summary-row"><span class="summary-label">${field.label}:</span><span class="${valueClass}">${escapeHtml(displayValue)}</span></div>`;
    });
    html += `</div>`;
  });

  const familyMembers = getFamilyMembersData();
  if (familyMembers.length > 0) {
    html += `<div class="summary-section">`;
    html += `<h3>اعضای خانواده اضافه شده</h3>`;
    familyMembers.forEach((fm, i) => {
      html += `<div class="summary-row"><span class="summary-label">عضو ${toPersianNum(i + 1)}:</span><span class="summary-value">${escapeHtml(fm.fullName || "—")} (${escapeHtml(fm.relationship || "—")})</span></div>`;
    });
    html += `</div>`;
  }

  const uploadedDocs = [];
  document.querySelectorAll(".file-input").forEach((input) => {
    if (input.files && input.files.length > 0) {
      uploadedDocs.push(input.dataset.docType);
    }
  });
  if (uploadedDocs.length > 0) {
    html += `<div class="summary-section">`;
    html += `<h3>مدارک بارگذاری شده</h3>`;
    uploadedDocs.forEach((doc) => {
      html += `<div class="summary-row"><span class="summary-label">سند:</span><span class="summary-value">${escapeHtml(doc)}</span></div>`;
    });
    html += `</div>`;
  }

  summaryContent.innerHTML = html;
}

// ============================================================
// SUBMIT
// ============================================================
async function handleSubmit() {
  const confirmation = document.getElementById("confirmation");
  const confirmationError = document.getElementById("error-confirmation");
  if (!confirmation.checked) {
    if (confirmationError) confirmationError.textContent = "لطفاً تأیید کنید که معلومات صحیح است.";
    showErrorBanner("لطفاً تأیید کنید که معلومات صحیح است.");
    return;
  }
  if (confirmationError) confirmationError.textContent = "";

  if (!validateStep1()) {
    currentStep = 1;
    showStep(1);
    return;
  }

  loadingText.textContent = "در حال ثبت معلومات...";
  loadingOverlay.style.display = "flex";
  submitBtn.disabled = true;
  hideErrorBanner();

  try {
    const formData = collectFormData();
    const documents = await getDocumentsData();
    formData.documents = documents;
    formData.familyMembers = getFamilyMembersData();
    formData.userAgent = navigator.userAgent;

    const response = await sendToApi(formData);

    if (response.success) {
      showSuccess(response.submissionId);
    } else {
      showErrorBanner(response.message || "خطا در ثبت معلومات. لطفاً دوباره تلاش کنید.");
    }
  } catch (error) {
    showErrorBanner("ارتباط با سیستم برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.");
  } finally {
    loadingOverlay.style.display = "none";
    submitBtn.disabled = false;
  }
}

function collectFormData() {
  const fields = [
    "fullName", "fathersName", "dateOfBirth", "currentCountry", "currentCity",
    "phoneWhatsapp", "email", "arapPreviouslyApplied", "arapApplicationDate",
    "applicationReferenceNumber", "uan", "previousApplicationEmail",
    "previousApplicationPhone", "currentCaseStatus", "currentCaseExplanation",
    "previousRefusal", "refusalDate", "refusalReason", "reviewSubmitted",
    "reviewDate", "reviewResult", "employmentOrganization", "jobTitle",
    "unitDepartment", "employmentLocation", "employmentStartDate",
    "employmentEndDate", "employeeId", "projectProgram",
    "employmentDescription", "threatened", "threatDescription", "threatDate",
    "familyMembersIncluded", "currentVisaResidenceType", "residenceExpiryDate",
    "previousUKTravel", "previousUKVisa", "otherUKImmigrationApplication",
    "otherCountryImmigrationCase", "additionalInformation", "confirmation",
  ];

  const data = {};
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      if (el.type === "checkbox") {
        data[id] = el.checked ? "بله" : "";
      } else {
        data[id] = el.value.trim();
      }
    }
  });

  const familyThreatenedEl = document.getElementById("familyThreatened");
  if (familyThreatenedEl) {
    data.familyThreatened = familyThreatenedEl.value.trim();
  }

  return data;
}

// ============================================================
// API CALL
// ============================================================
async function sendToApi(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "submit", ...data }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return await response.json();
}

// ============================================================
// SUCCESS
// ============================================================
function showSuccess(submissionId) {
  formCard.style.display = "none";
  progressContainer.style.display = "none";
  document.getElementById("submissionIdDisplay").textContent = submissionId || "—";
  successCard.style.display = "block";
  successCard.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ============================================================
// RESET FORM
// ============================================================
function resetForm() {
  document.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.type === "checkbox") {
      el.checked = false;
    } else if (el.type !== "file") {
      el.value = "";
    }
  });

  document.querySelectorAll(".file-input").forEach((input) => {
    input.value = "";
    const area = input.closest(".file-upload-area");
    if (area) area.classList.remove("has-file");
    const label = area ? area.querySelector(".file-upload-label") : null;
    if (label) {
      label.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="upload-icon">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4M4 20h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>فایل را انتخاب کنید یا بکشید و رها کنید</span>
      `;
    }
  });

  document.querySelectorAll(".family-member-card").forEach((card) => card.remove());
  document.querySelectorAll(".field.has-error").forEach((f) => f.classList.remove("has-error"));
  document.querySelectorAll(".error-msg").forEach((e) => (e.textContent = ""));

  familyMemberCount = 0;
  currentStep = 1;
  successCard.style.display = "none";
  formCard.style.display = "block";
  hideErrorBanner();
  showStep(1);
}

// ============================================================
// ERROR BANNER
// ============================================================
function showErrorBanner(message) {
  errorBannerText.textContent = message;
  errorBanner.style.display = "flex";
  errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  setTimeout(() => {
    hideErrorBanner();
  }, 6000);
}

function hideErrorBanner() {
  errorBanner.style.display = "none";
}

// ============================================================
// UTILITIES
// ============================================================
function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
