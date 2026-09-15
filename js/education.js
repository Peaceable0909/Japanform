/**
 * education.js
 * Renders and manages the repeatable Education History cards.
 */

const EDUCATION_LEVELS = [
  "Elementary School",
  "Middle School",
  "High School",
  "College / University",
  "Vocational / Technical School",
  "Other",
];

function addEducationRecord() {
  formState.education.push({
    id: nextRecordId(),
    level: "",
    institution: "",
    start: "",
    graduation: "",
    currentlyStudying: false,
    country: "",
    city: "",
  });
  saveState();
  renderEducation();
}

function removeEducationRecord(id) {
  formState.education = formState.education.filter((r) => r.id !== id);
  saveState();
  renderEducation();
}

function renderEducation() {
  const container = document.getElementById("educationList");
  if (!container) return;
  container.innerHTML = "";

  if (formState.education.length === 0) {
    addEducationRecord();
    return;
  }

  formState.education.forEach((rec, index) => {
    const card = document.createElement("div");
    card.className = "repeat-card";
    card.innerHTML = `
      <div class="repeat-card-header">
        <h3>Education ${index + 1}</h3>
        <button type="button" class="btn-remove" data-remove-education="${rec.id}" aria-label="Remove Education ${index + 1}">Remove</button>
      </div>
      <div class="field-grid">
        <div class="field">
          <label for="edu_level_${rec.id}">Level of Education <span class="req">*</span></label>
          <select id="edu_level_${rec.id}" data-edu="${rec.id}" data-key="level" required>
            <option value="">Select level</option>
            ${EDUCATION_LEVELS.map((l) => `<option value="${l}" ${rec.level === l ? "selected" : ""}>${l}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="edu_institution_${rec.id}">Official Name of School / University / Institution <span class="req">*</span></label>
          <input type="text" id="edu_institution_${rec.id}" data-edu="${rec.id}" data-key="institution" value="${escapeAttr(rec.institution)}" required />
        </div>
        <div class="field">
          <label for="edu_start_${rec.id}">Start of Studies <span class="req">*</span></label>
          <input type="month" id="edu_start_${rec.id}" data-edu="${rec.id}" data-key="start" value="${escapeAttr(rec.start)}" required />
        </div>
        <div class="field">
          <label class="checkbox-label" for="edu_current_${rec.id}">
            <input type="checkbox" id="edu_current_${rec.id}" data-edu="${rec.id}" data-key="currentlyStudying" ${rec.currentlyStudying ? "checked" : ""} />
            Currently studying
          </label>
        </div>
        <div class="field">
          <label for="edu_grad_${rec.id}">${rec.currentlyStudying ? "Expected Graduation" : "Expected / Actual Graduation"} ${rec.currentlyStudying ? "" : '<span class="req">*</span>'}</label>
          <input type="month" id="edu_grad_${rec.id}" data-edu="${rec.id}" data-key="graduation" value="${escapeAttr(rec.graduation)}" ${rec.currentlyStudying ? "" : "required"} />
        </div>
        <div class="field">
          <label for="edu_country_${rec.id}">Country <span class="req">*</span></label>
          <input type="text" list="countryList" id="edu_country_${rec.id}" data-edu="${rec.id}" data-key="country" value="${escapeAttr(rec.country)}" required />
        </div>
        <div class="field">
          <label for="edu_city_${rec.id}">City <span class="req">*</span></label>
          <input type="text" id="edu_city_${rec.id}" data-edu="${rec.id}" data-key="city" value="${escapeAttr(rec.city)}" required />
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("[data-edu]").forEach((el) => {
    const evt = el.type === "checkbox" ? "change" : el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, (e) => {
      const id = e.target.getAttribute("data-edu");
      const key = e.target.getAttribute("data-key");
      const rec = formState.education.find((r) => r.id === id);
      if (!rec) return;
      rec[key] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      saveState();
      if (key === "currentlyStudying") renderEducation();
    });
  });

  container.querySelectorAll("[data-remove-education]").forEach((btn) => {
    btn.addEventListener("click", () => removeEducationRecord(btn.getAttribute("data-remove-education")));
  });
}

function escapeAttr(value) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
