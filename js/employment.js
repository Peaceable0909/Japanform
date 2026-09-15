/**
 * employment.js
 * Renders and manages the repeatable Employment History cards.
 */

const RESPONSIBILITY_LEVELS = ["Board Level", "Senior Management", "Middle Management", "Junior Management"];
const ACTIVITIES_MAX_CHARS = 128;

function addEmploymentRecord() {
  formState.employment.records.push({
    id: nextRecordId(),
    employer: "",
    sector: "",
    position: "",
    responsibility: "",
    from: "",
    to: "",
    activities: "",
  });
  saveState();
  renderEmployment();
}

function removeEmploymentRecord(id) {
  formState.employment.records = formState.employment.records.filter((r) => r.id !== id);
  saveState();
  renderEmployment();
}

function toggleNoEmployment(checked) {
  formState.employment.none = checked;
  if (checked) formState.employment.records = [];
  saveState();
  renderEmployment();
}

function renderEmployment() {
  const container = document.getElementById("employmentList");
  const noneBox = document.getElementById("noEmployment");
  const addBtn = document.getElementById("addEmploymentBtn");
  if (!container) return;

  if (noneBox) noneBox.checked = !!formState.employment.none;
  container.style.display = formState.employment.none ? "none" : "";
  if (addBtn) addBtn.style.display = formState.employment.none ? "none" : "";

  container.innerHTML = "";
  if (formState.employment.none) return;

  if (formState.employment.records.length === 0) {
    addEmploymentRecord();
    return;
  }

  formState.employment.records.forEach((rec, index) => {
    const card = document.createElement("div");
    card.className = "repeat-card";
    const charCount = (rec.activities || "").length;
    card.innerHTML = `
      <div class="repeat-card-header">
        <h3>Employment ${index + 1}</h3>
        <button type="button" class="btn-remove" data-remove-employment="${rec.id}" aria-label="Remove Employment ${index + 1}">Remove</button>
      </div>
      <div class="field-grid">
        <div class="field">
          <label for="emp_employer_${rec.id}">Employer / Company Name <span class="req">*</span></label>
          <input type="text" id="emp_employer_${rec.id}" data-emp="${rec.id}" data-key="employer" value="${escapeAttr(rec.employer)}" required />
        </div>
        <div class="field">
          <label for="emp_sector_${rec.id}">Type of Business / Sector <span class="req">*</span></label>
          <input type="text" id="emp_sector_${rec.id}" data-emp="${rec.id}" data-key="sector" value="${escapeAttr(rec.sector)}" required />
        </div>
        <div class="field">
          <label for="emp_position_${rec.id}">Occupation / Position <span class="req">*</span></label>
          <input type="text" id="emp_position_${rec.id}" data-emp="${rec.id}" data-key="position" value="${escapeAttr(rec.position)}" required />
        </div>
        <div class="field">
          <label for="emp_level_${rec.id}">Level of Responsibility <span class="req">*</span></label>
          <select id="emp_level_${rec.id}" data-emp="${rec.id}" data-key="responsibility" required>
            <option value="">Select level</option>
            ${RESPONSIBILITY_LEVELS.map((l) => `<option value="${l}" ${rec.responsibility === l ? "selected" : ""}>${l}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="emp_from_${rec.id}">From <span class="req">*</span></label>
          <input type="month" id="emp_from_${rec.id}" data-emp="${rec.id}" data-key="from" value="${escapeAttr(rec.from)}" required />
        </div>
        <div class="field">
          <label for="emp_to_${rec.id}">To <span class="req">*</span></label>
          <input type="month" id="emp_to_${rec.id}" data-emp="${rec.id}" data-key="to" value="${escapeAttr(rec.to)}" required />
        </div>
        <div class="field field-full">
          <label for="emp_activities_${rec.id}">Most Important Activities <span class="req">*</span></label>
          <textarea id="emp_activities_${rec.id}" data-emp="${rec.id}" data-key="activities" maxlength="${ACTIVITIES_MAX_CHARS}" rows="2" required>${escapeHtml(rec.activities)}</textarea>
          <div class="char-counter" data-emp-counter="${rec.id}">Characters: ${charCount} / ${ACTIVITIES_MAX_CHARS}</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("[data-emp]").forEach((el) => {
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, (e) => {
      const id = e.target.getAttribute("data-emp");
      const key = e.target.getAttribute("data-key");
      const rec = formState.employment.records.find((r) => r.id === id);
      if (!rec) return;
      rec[key] = e.target.value;
      saveState();
      if (key === "activities") {
        const counter = container.querySelector(`[data-emp-counter="${id}"]`);
        if (counter) counter.textContent = `Characters: ${e.target.value.length} / ${ACTIVITIES_MAX_CHARS}`;
      }
    });
  });

  container.querySelectorAll("[data-remove-employment]").forEach((btn) => {
    btn.addEventListener("click", () => removeEmploymentRecord(btn.getAttribute("data-remove-employment")));
  });
}

function escapeHtml(value) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
