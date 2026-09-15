/**
 * formState.js
 * Single source of truth for all applicant data entered into the form.
 * Persists to localStorage on every change so an accidental refresh does not
 * lose the applicant's progress. No data ever leaves the browser.
 */

const STORAGE_KEY = "iclaApplicationState_v1";

let recordIdCounter = 1;
function nextRecordId() {
  return "rec_" + recordIdCounter++;
}

function createEmptyState() {
  return {
    applicant: {
      givenName: "",
      familyName: "",
      gender: "",
      citizenship: "",
    },
    passport: {
      number: "",
      expiry: "",
      countryOfIssue: "",
    },
    birth: {
      dob: "",
      city: "",
      country: "",
    },
    address: {
      street: "",
      city: "",
      province: "",
      state: "",
      postalCode: "",
      country: "",
    },
    phone: {
      mobile: "",
    },
    emergencyContact: {
      fullName: "",
      email: "",
      telephone: "",
      relationship: "",
    },
    emergencyContactAddress: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: "",
    },
    education: [],
    highSchool: {
      name: "",
      city: "",
      country: "",
      attendanceFrom: "",
      attendanceTo: "",
      diplomaType: "",
      diplomaOther: "",
    },
    standardizedTests: {
      notTaken: false,
      tests: [],
    },
    englishProficiency: {
      native: false,
      testName: "",
      date: "",
      candidateNumber: "",
      country: "",
      score: "",
    },
    employment: {
      none: false,
      records: [],
    },
    activities: [],
    references: [],
    statementOfPurpose: "",
  };
}

// `var` (rather than `let`) so this is reachable as `window.formState` too,
// which is convenient for debugging in the browser console.
var formState = loadState() || createEmptyState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
  } catch (e) {
    // localStorage may be unavailable (private browsing, quota, etc). Fail silently
    // so the form keeps working in-memory for the current session.
    console.warn("Could not save application progress locally.");
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Merge onto a fresh default so any new fields added later always exist.
    const fresh = createEmptyState();
    return deepMerge(fresh, parsed);
  } catch (e) {
    return null;
  }
}

function deepMerge(target, source) {
  if (Array.isArray(source)) return source;
  if (typeof source !== "object" || source === null) return source;
  const out = { ...target };
  Object.keys(source).forEach((key) => {
    if (typeof target[key] === "object" && target[key] !== null && !Array.isArray(target[key])) {
      out[key] = deepMerge(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  });
  return out;
}

function clearState() {
  formState = createEmptyState();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* ignore */
  }
}

/** Reads a nested value from formState using a dot path, e.g. "address.city". */
function getStateValue(path) {
  return path.split(".").reduce((obj, key) => (obj ? obj[key] : undefined), formState);
}

/** Writes a nested value into formState using a dot path, then persists. */
function setStateValue(path, value) {
  const keys = path.split(".");
  let obj = formState;
  for (let i = 0; i < keys.length - 1; i++) {
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  saveState();
}
