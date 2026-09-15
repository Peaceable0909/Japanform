/**
 * app.js
 * Main controller: builds the progress navigation, moves between steps,
 * binds simple (non-repeatable) fields to formState, renders the review
 * page, and wires the Generate PDF button. Repeatable-section logic lives
 * in education.js / employment.js / references.js / testsActivities.js.
 * PDF layout logic lives in pdfGenerator.js.
 */

const STEPS = [
  { key: "personal", title: "Personal Information" },
  { key: "passport", title: "Passport" },
  { key: "birth", title: "Birth Details" },
  { key: "address", title: "Address and Contact" },
  { key: "emergencyContact", title: "Emergency Contact" },
  { key: "emergencyContactAddress", title: "Emergency Contact Address" },
  { key: "education", title: "Education History" },
  { key: "highSchool", title: "High School Details" },
  { key: "tests", title: "Standardized Tests" },
  { key: "english", title: "English Proficiency" },
  { key: "employment", title: "Employment History" },
  { key: "activities", title: "Activities" },
  { key: "references", title: "Academic References" },
  { key: "statement", title: "Statement of Purpose" },
  { key: "review", title: "Review and Generate PDF" },
];

let currentStepIndex = 0;

const STATIC_BINDINGS = [
  { id: "personGivenName", path: "applicant.givenName" },
  { id: "personFamilyName", path: "applicant.familyName" },
  { id: "personGender", path: "applicant.gender" },
  { id: "personCitizenship", path: "applicant.citizenship" },
  { id: "passportNumber", path: "passport.number" },
  { id: "passportExpiry", path: "passport.expiry" },
  { id: "passportCountry", path: "passport.countryOfIssue" },
  { id: "birthDob", path: "birth.dob" },
  { id: "birthCity", path: "birth.city" },
  { id: "birthCountry", path: "birth.country" },
  { id: "addrStreet", path: "address.street" },
  { id: "addrCity", path: "address.city" },
  { id: "addrProvince", path: "address.province" },
  { id: "addrState", path: "address.state" },
  { id: "addrPostal", path: "address.postalCode" },
  { id: "addrCountry", path: "address.country" },
  { id: "phoneMobile", path: "phone.mobile" },
  { id: "ecFullName", path: "emergencyContact.fullName" },
  { id: "ecEmail", path: "emergencyContact.email" },
  { id: "ecTelephone", path: "emergencyContact.telephone" },
  { id: "ecRelationship", path: "emergencyContact.relationship" },
  { id: "ecaStreet", path: "emergencyContactAddress.street" },
  { id: "ecaCity", path: "emergencyContactAddress.city" },
  { id: "ecaProvince", path: "emergencyContactAddress.province" },
  { id: "ecaPostal", path: "emergencyContactAddress.postalCode" },
  { id: "ecaCountry", path: "emergencyContactAddress.country" },
  { id: "hsName", path: "highSchool.name" },
  { id: "hsCity", path: "highSchool.city" },
  { id: "hsCountry", path: "highSchool.country" },
  { id: "hsFrom", path: "highSchool.attendanceFrom" },
  { id: "hsTo", path: "highSchool.attendanceTo" },
  { id: "hsDiploma", path: "highSchool.diplomaType" },
  { id: "hsDiplomaOther", path: "highSchool.diplomaOther" },
  { id: "engTestName", path: "englishProficiency.testName" },
  { id: "engDate", path: "englishProficiency.date" },
  { id: "engCandidate", path: "englishProficiency.candidateNumber" },
  { id: "engCountry", path: "englishProficiency.country" },
  { id: "engScore", path: "englishProficiency.score" },
];

document.addEventListener("DOMContentLoaded", init);

function init() {
  populateAllCountryLists();
  initStaticBindings();
  initSpecialFields();
  renderEducation();
  renderTests();
  renderEmployment();
  renderActivities();
  renderReferences();
  buildProgressNav();
  wireNavButtons();
  wireAddButtons();
  wireClearForm();
  initStatementStep();
  showStep(0);
}

/* ---------------- Static field bindings ---------------- */

function initStaticBindings() {
  STATIC_BINDINGS.forEach(({ id, path }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const value = getStateValue(path);
    if (value !== undefined && value !== null) el.value = value;
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => setStateValue(path, el.value));
  });
}

function initSpecialFields() {
  // High school diploma "Other" toggle
  const diplomaSelect = document.getElementById("hsDiploma");
  const diplomaOtherWrap = document.getElementById("hsDiplomaOtherWrap");
  function refreshDiplomaOther() {
    const isOther = formState.highSchool.diplomaType === "Other";
    diplomaOtherWrap.style.display = isOther ? "" : "none";
  }
  if (diplomaSelect) {
    diplomaSelect.addEventListener("change", refreshDiplomaOther);
    refreshDiplomaOther();
  }

  // English proficiency: native speaker toggle
  const nativeBox = document.getElementById("engNative");
  const englishFieldsWrap = document.getElementById("englishFieldsWrap");
  function refreshEnglish() {
    const native = formState.englishProficiency.native;
    englishFieldsWrap.style.display = native ? "none" : "";
    if (native) {
      formState.englishProficiency.testName = "Native English speaker";
    }
  }
  if (nativeBox) {
    nativeBox.checked = !!formState.englishProficiency.native;
    nativeBox.addEventListener("change", () => {
      formState.englishProficiency.native = nativeBox.checked;
      saveState();
      refreshEnglish();
    });
    refreshEnglish();
  }

  // Standardized tests: "not taken" toggle
  const noTestBox = document.getElementById("noTestTaken");
  if (noTestBox) noTestBox.addEventListener("change", () => toggleNoTest(noTestBox.checked));

  // Employment: "no experience" toggle
  const noEmpBox = document.getElementById("noEmployment");
  if (noEmpBox) noEmpBox.addEventListener("change", () => toggleNoEmployment(noEmpBox.checked));
}

/* ---------------- Add buttons for repeatable sections ---------------- */

function wireAddButtons() {
  bindClick("addEducationBtn", addEducationRecord);
  bindClick("addTestBtn", addTestRecord);
  bindClick("addEmploymentBtn", addEmploymentRecord);
  bindClick("addActivityBtn", addActivityRecord);
  bindClick("addReferenceBtn", addReferenceRecord);
}

function bindClick(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", handler);
}

/* ---------------- Statement of Purpose step ---------------- */

function initStatementStep() {
  const textarea = document.getElementById("statementText");
  if (!textarea) return;
  textarea.value = formState.statementOfPurpose || "";
  textarea.addEventListener("input", () => {
    let value = textarea.value;
    if (value.length > SOP_MAX_CHARS) {
      value = value.slice(0, SOP_MAX_CHARS);
      textarea.value = value;
    }
    formState.statementOfPurpose = value;
    saveState();
    updateStatementCounters();
  });
  updateStatementCounters();
}

function updateStatementCounters() {
  const text = formState.statementOfPurpose || "";
  const chars = text.length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charEl = document.getElementById("statementCharCount");
  const wordEl = document.getElementById("statementWordCount");
  if (charEl) {
    charEl.textContent = `Characters: ${chars.toLocaleString()} / ${SOP_MAX_CHARS.toLocaleString()}`;
    charEl.classList.toggle("counter-warn", chars < SOP_MIN_CHARS);
    charEl.classList.toggle("counter-ok", chars >= SOP_MIN_CHARS);
  }
  if (wordEl) wordEl.textContent = `Words: ${words.toLocaleString()}`;
}

/* ---------------- Progress navigation ---------------- */

function buildProgressNav() {
  const desktopNav = document.getElementById("progressNavDesktop");
  const mobileNav = document.getElementById("progressNavMobile");
  [desktopNav, mobileNav].forEach((nav) => {
    if (!nav) return;
    nav.innerHTML = "";
    STEPS.forEach((step, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "nav-step";
      item.dataset.stepIndex = String(index);
      item.innerHTML = `<span class="nav-step-num">${index + 1}</span><span class="nav-step-label">${step.title}</span>`;
      item.addEventListener("click", () => attemptJumpToStep(index));
      nav.appendChild(item);
    });
  });
}

function updateProgressNav() {
  document.querySelectorAll(".nav-step").forEach((el) => {
    const idx = Number(el.dataset.stepIndex);
    el.classList.toggle("active", idx === currentStepIndex);
    el.classList.toggle("visited", idx < currentStepIndex);
  });
}

/** Users may jump to any earlier step freely; jumping forward re-validates the current step first. */
function attemptJumpToStep(targetIndex) {
  if (targetIndex <= currentStepIndex) {
    showStep(targetIndex);
    return;
  }
  goNext(targetIndex);
}

/* ---------------- Step show/hide ---------------- */

function showStep(index) {
  currentStepIndex = index;
  const isReview = STEPS[index].key === "review";

  document.querySelectorAll(".step-panel").forEach((panel) => {
    panel.hidden = panel.dataset.step !== STEPS[index].key;
  });
  clearStepErrors();
  updateProgressNav();

  const commonFooter = document.getElementById("commonStepFooter");
  if (commonFooter) commonFooter.style.display = isReview ? "none" : "";

  document.querySelectorAll("[data-action='back']").forEach((btn) => {
    btn.style.visibility = index === 0 ? "hidden" : "visible";
  });
  document.querySelectorAll("[data-action='next']").forEach((btn) => {
    btn.textContent = STEPS[index + 1] && STEPS[index + 1].key === "review" ? "Review Application" : "Save & Continue";
  });

  if (isReview) renderReview();

  const container = document.getElementById("formContainer");
  if (container) container.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function wireNavButtons() {
  document.querySelectorAll("[data-action='back']").forEach((btn) => btn.addEventListener("click", goBack));
  document.querySelectorAll("[data-action='next']").forEach((btn) => btn.addEventListener("click", () => goNext(currentStepIndex + 1)));
  bindClick("generatePdfBtn", handleGeneratePdf);
}

function goBack() {
  if (currentStepIndex === 0) return;
  showStep(currentStepIndex - 1);
}

function goNext(targetIndex) {
  const step = STEPS[currentStepIndex];
  const validator = VALIDATORS[step.key];
  if (validator) {
    const errors = validator();
    if (errors.length > 0) {
      showStepErrors(errors);
      return;
    }
  }
  showStep(Math.min(targetIndex, STEPS.length - 1));
}

function showStepErrors(errors) {
  const panel = document.querySelector(`.step-panel[data-step="${STEPS[currentStepIndex].key}"]`);
  if (!panel) return;
  let box = panel.querySelector(".error-banner");
  if (!box) {
    box = document.createElement("div");
    box.className = "error-banner";
    panel.insertBefore(box, panel.firstChild);
  }
  box.innerHTML = `<strong>Please review the following before continuing:</strong><ul>${errors
    .map((e) => `<li>${escapeHtml(e.message)}</li>`)
    .join("")}</ul>`;
  box.setAttribute("role", "alert");

  const first = document.getElementById(errors[0].focusId);
  if (first) {
    first.scrollIntoView({ behavior: "smooth", block: "center" });
    first.focus({ preventScroll: true });
  } else {
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function clearStepErrors() {
  document.querySelectorAll(".error-banner").forEach((el) => el.remove());
}

/* ---------------- Clear form ---------------- */

function wireClearForm() {
  bindClick("clearFormBtn", () => {
    const confirmed = window.confirm(
      "This will permanently delete all information entered in this application. This cannot be undone. Continue?"
    );
    if (confirmed) {
      clearState();
      location.reload();
    }
  });
}

/* ---------------- Review page ---------------- */

function reviewCard(title, stepIndex, rows) {
  const rowsHtml = rows
    .map(([label, value]) => `<div class="review-row"><span class="review-label">${escapeHtml(label)}</span><span class="review-value">${escapeHtml(value)}</span></div>`)
    .join("");
  return `
    <div class="review-card">
      <div class="review-card-header">
        <h3>${escapeHtml(title)}</h3>
        <button type="button" class="btn-edit" data-edit-step="${stepIndex}">Edit</button>
      </div>
      ${rowsHtml}
    </div>`;
}

function reviewCardMulti(title, stepIndex, records, buildRows, emptyText) {
  let body;
  if (!records || records.length === 0) {
    body = `<p class="review-empty">${escapeHtml(emptyText)}</p>`;
  } else {
    body = records
      .map((rec, i) => {
        const rows = buildRows(rec, i)
          .map(([label, value]) => `<div class="review-row"><span class="review-label">${escapeHtml(label)}</span><span class="review-value">${escapeHtml(value)}</span></div>`)
          .join("");
        return `<div class="review-subcard"><h4>${title.replace(/s$/, "")} ${i + 1}</h4>${rows}</div>`;
      })
      .join("");
  }
  return `
    <div class="review-card">
      <div class="review-card-header">
        <h3>${escapeHtml(title)}</h3>
        <button type="button" class="btn-edit" data-edit-step="${stepIndex}">Edit</button>
      </div>
      ${body}
    </div>`;
}

function stepIndexOf(key) {
  return STEPS.findIndex((s) => s.key === key);
}

function renderReview() {
  const content = document.getElementById("reviewContent");
  if (!content) return;
  const a = formState.applicant, p = formState.passport, b = formState.birth, ad = formState.address;
  const ec = formState.emergencyContact, eca = formState.emergencyContactAddress, hs = formState.highSchool, ep = formState.englishProficiency;

  let html = "";
  html += reviewCard("Personal Information", stepIndexOf("personal"), [
    ["Given Name", a.givenName], ["Family Name", a.familyName], ["Gender", a.gender], ["Citizenship", a.citizenship],
  ]);
  html += reviewCard("Passport", stepIndexOf("passport"), [
    ["Passport Number", p.number], ["Expiry Date", p.expiry], ["Country of Issue", p.countryOfIssue],
  ]);
  html += reviewCard("Birth Details", stepIndexOf("birth"), [
    ["Date of Birth", b.dob], ["City of Birth", b.city], ["Country of Birth", b.country],
  ]);
  html += reviewCard("Address and Contact", stepIndexOf("address"), [
    ["Street Address", ad.street], ["City", ad.city], ["Province / Region", ad.province], ["State", ad.state],
    ["Postal Code", ad.postalCode], ["Country", ad.country], ["Mobile Number", formState.phone.mobile],
  ]);
  html += reviewCard("Emergency Contact", stepIndexOf("emergencyContact"), [
    ["Full Name", ec.fullName], ["Email", ec.email], ["Telephone", ec.telephone], ["Relationship", ec.relationship],
  ]);
  html += reviewCard("Emergency Contact Address", stepIndexOf("emergencyContactAddress"), [
    ["Street Address", eca.street], ["City", eca.city], ["Province / Region", eca.province], ["Postal Code", eca.postalCode], ["Country", eca.country],
  ]);
  html += reviewCardMulti("Education", stepIndexOf("education"), formState.education, (rec) => [
    ["Level", rec.level], ["Institution", rec.institution], ["Start", rec.start],
    ["Graduation", rec.currentlyStudying ? `${rec.graduation} (In Progress)` : rec.graduation],
    ["City", rec.city], ["Country", rec.country],
  ], "No education history added.");
  html += reviewCard("High School Details", stepIndexOf("highSchool"), [
    ["Name", hs.name], ["City", hs.city], ["Country", hs.country], ["From", hs.attendanceFrom], ["To", hs.attendanceTo],
    ["Diploma", hs.diplomaType === "Other" ? hs.diplomaOther : hs.diplomaType],
  ]);
  html += reviewCardMulti(
    "Standardized Tests", stepIndexOf("tests"),
    formState.standardizedTests.notTaken ? [] : formState.standardizedTests.tests,
    (rec) => [["Test Name", rec.name], ["Date", rec.date], ["Score", rec.score], ["Country", rec.country]],
    formState.standardizedTests.notTaken ? "Applicant has not taken a standardized test." : "No tests added."
  );
  html += reviewCard("English Proficiency", stepIndexOf("english"), ep.native ? [["Proficiency", "Native English Speaker"]] : [
    ["Test Name", ep.testName], ["Date", ep.date], ["Candidate Number", ep.candidateNumber], ["Country", ep.country], ["Score", ep.score],
  ]);
  html += reviewCardMulti(
    "Employment History", stepIndexOf("employment"),
    formState.employment.none ? [] : formState.employment.records,
    (rec) => [["Employer", rec.employer], ["Sector", rec.sector], ["Position", rec.position], ["Responsibility", rec.responsibility], ["From", rec.from], ["To", rec.to], ["Activities", rec.activities]],
    formState.employment.none ? "No employment experience reported." : "No employment records added."
  );
  html += reviewCardMulti(
    "Activities", stepIndexOf("activities"), formState.activities.filter((r) => r.nature || r.organisation || r.description),
    (rec) => [["Nature", rec.nature], ["Organisation", rec.organisation], ["From", rec.from], ["To", rec.to || "Ongoing"], ["Description", rec.description]],
    "No activities added."
  );
  html += reviewCardMulti(
    "Academic References", stepIndexOf("references"), formState.references.filter((r) => r.name && r.email),
    (rec) => [["Name", rec.name], ["Email", rec.email]], "No referees added yet."
  );
  html += reviewCard("Statement of Purpose", stepIndexOf("statement"), [
    ["Length", `${(formState.statementOfPurpose || "").length.toLocaleString()} characters`],
  ]);

  content.innerHTML = html;
  content.querySelectorAll("[data-edit-step]").forEach((btn) => {
    btn.addEventListener("click", () => showStep(Number(btn.dataset.editStep)));
  });

  renderApplicationStatus();
}

function renderApplicationStatus() {
  const list = document.getElementById("statusChecklist");
  const banner = document.getElementById("statusBanner");
  const generateBtn = document.getElementById("generatePdfBtn");
  if (!list) return;

  const results = validateAllSteps();
  const incomplete = [];
  let html = "";
  STEPS.filter((s) => s.key !== "review").forEach((s) => {
    const ok = results[s.key].length === 0;
    if (!ok) incomplete.push(s.title);
    html += `<li class="${ok ? "status-ok" : "status-pending"}"><span class="status-icon">${ok ? "\u2713" : "\u2717"}</span> ${escapeHtml(s.title)}</li>`;
  });
  list.innerHTML = html;

  const ready = incomplete.length === 0;
  if (banner) {
    banner.className = "status-banner " + (ready ? "status-banner-ok" : "status-banner-pending");
    banner.textContent = ready
      ? "Application ready for PDF"
      : `Application incomplete \u2014 please complete: ${incomplete.join(", ")}`;
  }
  if (generateBtn) generateBtn.disabled = !ready;
}

/* ---------------- Generate PDF ---------------- */

function handleGeneratePdf() {
  const results = validateAllSteps();
  const firstIncomplete = STEPS.filter((s) => s.key !== "review").find((s) => results[s.key].length > 0);
  if (firstIncomplete) {
    renderApplicationStatus();
    showStep(stepIndexOf(firstIncomplete.key));
    showStepErrors(results[firstIncomplete.key]);
    return;
  }
  generateApplicationPDF();
}

function escapeHtml(value) {
  if (value === undefined || value === null || value === "") return "\u2014";
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
