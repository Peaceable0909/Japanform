/**
 * testsActivities.js
 * Renders and manages the repeatable Standardized Tests and Activities sections.
 * Grouped in one file since both are short, structurally similar repeatable lists.
 */

const ACTIVITY_TYPES = [
  "Sports",
  "Student Organisation",
  "Volunteering",
  "Community Activity",
  "Hobby",
  "Leadership Activity",
  "Other",
];
const ACTIVITY_DESC_MAX_CHARS = 128;

/* ---------------- Standardized Tests ---------------- */

function addTestRecord() {
  formState.standardizedTests.tests.push({ id: nextRecordId(), name: "", date: "", score: "", country: "" });
  saveState();
  renderTests();
}

function removeTestRecord(id) {
  formState.standardizedTests.tests = formState.standardizedTests.tests.filter((r) => r.id !== id);
  saveState();
  renderTests();
}

function toggleNoTest(checked) {
  formState.standardizedTests.notTaken = checked;
  if (checked) formState.standardizedTests.tests = [];
  saveState();
  renderTests();
}

function renderTests() {
  const container = document.getElementById("testsList");
  const noneBox = document.getElementById("noTestTaken");
  const addBtn = document.getElementById("addTestBtn");
  if (!container) return;

  if (noneBox) noneBox.checked = !!formState.standardizedTests.notTaken;
  container.style.display = formState.standardizedTests.notTaken ? "none" : "";
  if (addBtn) addBtn.style.display = formState.standardizedTests.notTaken ? "none" : "";

  container.innerHTML = "";
  if (formState.standardizedTests.notTaken) return;

  if (formState.standardizedTests.tests.length === 0) {
    addTestRecord();
    return;
  }

  formState.standardizedTests.tests.forEach((rec, index) => {
    const card = document.createElement("div");
    card.className = "repeat-card";
    card.innerHTML = `
      <div class="repeat-card-header">
        <h3>Test ${index + 1}</h3>
        <button type="button" class="btn-remove" data-remove-test="${rec.id}" aria-label="Remove Test ${index + 1}">Remove</button>
      </div>
      <div class="field-grid">
        <div class="field">
          <label for="test_name_${rec.id}">Test Name <span class="req">*</span></label>
          <input type="text" id="test_name_${rec.id}" data-test="${rec.id}" data-key="name" value="${escapeAttr(rec.name)}" required placeholder="e.g. SAT, ACT, IB" />
        </div>
        <div class="field">
          <label for="test_date_${rec.id}">Date of Test <span class="req">*</span></label>
          <input type="date" id="test_date_${rec.id}" data-test="${rec.id}" data-key="date" value="${escapeAttr(rec.date)}" required />
        </div>
        <div class="field">
          <label for="test_score_${rec.id}">Test Score <span class="req">*</span></label>
          <input type="text" id="test_score_${rec.id}" data-test="${rec.id}" data-key="score" value="${escapeAttr(rec.score)}" required />
        </div>
        <div class="field">
          <label for="test_country_${rec.id}">Country of Test Location <span class="req">*</span></label>
          <input type="text" list="countryList" id="test_country_${rec.id}" data-test="${rec.id}" data-key="country" value="${escapeAttr(rec.country)}" required />
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("[data-test]").forEach((el) => {
    el.addEventListener("input", (e) => {
      const id = e.target.getAttribute("data-test");
      const key = e.target.getAttribute("data-key");
      const rec = formState.standardizedTests.tests.find((r) => r.id === id);
      if (!rec) return;
      rec[key] = e.target.value;
      saveState();
    });
  });

  container.querySelectorAll("[data-remove-test]").forEach((btn) => {
    btn.addEventListener("click", () => removeTestRecord(btn.getAttribute("data-remove-test")));
  });
}

/* ---------------- Activities ---------------- */

function addActivityRecord() {
  formState.activities.push({ id: nextRecordId(), nature: "", organisation: "", from: "", to: "", description: "" });
  saveState();
  renderActivities();
}

function removeActivityRecord(id) {
  formState.activities = formState.activities.filter((r) => r.id !== id);
  saveState();
  renderActivities();
}

function renderActivities() {
  const container = document.getElementById("activitiesList");
  if (!container) return;
  container.innerHTML = "";

  if (formState.activities.length === 0) {
    addActivityRecord();
    return;
  }

  formState.activities.forEach((rec, index) => {
    const card = document.createElement("div");
    card.className = "repeat-card";
    const charCount = (rec.description || "").length;
    card.innerHTML = `
      <div class="repeat-card-header">
        <h3>Activity ${index + 1}</h3>
        <button type="button" class="btn-remove" data-remove-activity="${rec.id}" aria-label="Remove Activity ${index + 1}">Remove</button>
      </div>
      <div class="field-grid">
        <div class="field">
          <label for="act_nature_${rec.id}">Nature of Activity <span class="req">*</span></label>
          <select id="act_nature_${rec.id}" data-act="${rec.id}" data-key="nature" required>
            <option value="">Select type</option>
            ${ACTIVITY_TYPES.map((t) => `<option value="${t}" ${rec.nature === t ? "selected" : ""}>${t}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="act_org_${rec.id}">Organisation Name <span class="req">*</span></label>
          <input type="text" id="act_org_${rec.id}" data-act="${rec.id}" data-key="organisation" value="${escapeAttr(rec.organisation)}" required />
        </div>
        <div class="field">
          <label for="act_from_${rec.id}">From <span class="req">*</span></label>
          <input type="month" id="act_from_${rec.id}" data-act="${rec.id}" data-key="from" value="${escapeAttr(rec.from)}" required />
        </div>
        <div class="field">
          <label for="act_to_${rec.id}">To</label>
          <input type="month" id="act_to_${rec.id}" data-act="${rec.id}" data-key="to" value="${escapeAttr(rec.to)}" />
        </div>
        <div class="field field-full">
          <label for="act_desc_${rec.id}">Description <span class="req">*</span></label>
          <textarea id="act_desc_${rec.id}" data-act="${rec.id}" data-key="description" maxlength="${ACTIVITY_DESC_MAX_CHARS}" rows="2" required>${escapeHtml(rec.description)}</textarea>
          <div class="char-counter" data-act-counter="${rec.id}">Characters: ${charCount} / ${ACTIVITY_DESC_MAX_CHARS}</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("[data-act]").forEach((el) => {
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, (e) => {
      const id = e.target.getAttribute("data-act");
      const key = e.target.getAttribute("data-key");
      const rec = formState.activities.find((r) => r.id === id);
      if (!rec) return;
      rec[key] = e.target.value;
      saveState();
      if (key === "description") {
        const counter = container.querySelector(`[data-act-counter="${id}"]`);
        if (counter) counter.textContent = `Characters: ${e.target.value.length} / ${ACTIVITY_DESC_MAX_CHARS}`;
      }
    });
  });

  container.querySelectorAll("[data-remove-activity]").forEach((btn) => {
    btn.addEventListener("click", () => removeActivityRecord(btn.getAttribute("data-remove-activity")));
  });
}
