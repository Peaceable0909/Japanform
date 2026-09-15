/**
 * references.js
 * Renders and manages the repeatable Academic References list.
 * At least 2 references are required before PDF generation.
 */

const MIN_REFERENCES = 2;

function addReferenceRecord() {
  formState.references.push({ id: nextRecordId(), name: "", email: "" });
  saveState();
  renderReferences();
}

function removeReferenceRecord(id) {
  formState.references = formState.references.filter((r) => r.id !== id);
  saveState();
  renderReferences();
}

function renderReferences() {
  const container = document.getElementById("referencesList");
  const counter = document.getElementById("referencesCounter");
  if (!container) return;
  container.innerHTML = "";

  while (formState.references.length < MIN_REFERENCES) {
    formState.references.push({ id: nextRecordId(), name: "", email: "" });
  }

  formState.references.forEach((rec, index) => {
    const card = document.createElement("div");
    card.className = "repeat-card";
    const canRemove = formState.references.length > MIN_REFERENCES;
    card.innerHTML = `
      <div class="repeat-card-header">
        <h3>Referee ${index + 1}</h3>
        ${canRemove ? `<button type="button" class="btn-remove" data-remove-reference="${rec.id}" aria-label="Remove Referee ${index + 1}">Remove</button>` : ""}
      </div>
      <div class="field-grid">
        <div class="field">
          <label for="ref_name_${rec.id}">Referee Full Name <span class="req">*</span></label>
          <input type="text" id="ref_name_${rec.id}" data-ref="${rec.id}" data-key="name" value="${escapeAttr(rec.name)}" required />
        </div>
        <div class="field">
          <label for="ref_email_${rec.id}">Referee Email <span class="req">*</span></label>
          <input type="email" id="ref_email_${rec.id}" data-ref="${rec.id}" data-key="email" value="${escapeAttr(rec.email)}" required />
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("[data-ref]").forEach((el) => {
    el.addEventListener("input", (e) => {
      const id = e.target.getAttribute("data-ref");
      const key = e.target.getAttribute("data-key");
      const rec = formState.references.find((r) => r.id === id);
      if (!rec) return;
      rec[key] = e.target.value;
      saveState();
      updateReferencesCounter();
    });
  });

  container.querySelectorAll("[data-remove-reference]").forEach((btn) => {
    btn.addEventListener("click", () => removeReferenceRecord(btn.getAttribute("data-remove-reference")));
  });

  updateReferencesCounter();
}

function countCompleteReferences() {
  return formState.references.filter((r) => r.name.trim() && r.email.trim()).length;
}

function updateReferencesCounter() {
  const counter = document.getElementById("referencesCounter");
  if (!counter) return;
  const complete = countCompleteReferences();
  counter.textContent = `References added: ${complete} / Minimum ${MIN_REFERENCES}`;
  counter.classList.toggle("counter-ok", complete >= MIN_REFERENCES);
  counter.classList.toggle("counter-warn", complete < MIN_REFERENCES);
}
