/**
 * validation.js
 * Per-section validation. Each function returns an array of
 * { message, focusId } objects. An empty array means the section is valid.
 * focusId lets the UI scroll to and focus the offending field.
 */

const SOP_MIN_CHARS = 3000;
const SOP_MAX_CHARS = 8000;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

function req(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function validatePersonal() {
  const errors = [];
  const a = formState.applicant;
  if (!req(a.givenName)) errors.push({ message: "Please enter the applicant's Given Name.", focusId: "personGivenName" });
  if (!req(a.familyName)) errors.push({ message: "Please enter the applicant's Family Name.", focusId: "personFamilyName" });
  if (!req(a.gender)) errors.push({ message: "Please select a Gender.", focusId: "personGender" });
  if (!req(a.citizenship)) errors.push({ message: "Please enter the applicant's Citizenship.", focusId: "personCitizenship" });
  return errors;
}

function validatePassport() {
  const errors = [];
  const p = formState.passport;
  if (!req(p.number)) errors.push({ message: "Please enter your passport number.", focusId: "passportNumber" });
  if (!req(p.expiry)) errors.push({ message: "Please enter your passport expiry date.", focusId: "passportExpiry" });
  if (!req(p.countryOfIssue)) errors.push({ message: "Please enter the passport's country of issue.", focusId: "passportCountry" });
  return errors;
}

function validateBirth() {
  const errors = [];
  const b = formState.birth;
  if (!req(b.dob)) errors.push({ message: "Please enter the Date of Birth.", focusId: "birthDob" });
  if (!req(b.city)) errors.push({ message: "Please enter the City of Birth.", focusId: "birthCity" });
  if (!req(b.country)) errors.push({ message: "Please enter the Country of Birth.", focusId: "birthCountry" });
  return errors;
}

function validateAddress() {
  const errors = [];
  const ad = formState.address;
  if (!req(ad.street)) errors.push({ message: "Please enter the Street Address.", focusId: "addrStreet" });
  if (!req(ad.city)) errors.push({ message: "Please enter the City.", focusId: "addrCity" });
  if (!req(ad.postalCode)) errors.push({ message: "Please enter the Postal Code.", focusId: "addrPostal" });
  if (!req(ad.country)) errors.push({ message: "Please enter the Country.", focusId: "addrCountry" });
  if (!req(formState.phone.mobile)) errors.push({ message: "Please enter a Mobile Number.", focusId: "phoneMobile" });
  return errors;
}

function validateEmergencyContact() {
  const errors = [];
  const ec = formState.emergencyContact;
  if (!req(ec.fullName)) errors.push({ message: "Please enter the Emergency Contact's Full Name.", focusId: "ecFullName" });
  if (!req(ec.email)) errors.push({ message: "Please enter the Emergency Contact's Email.", focusId: "ecEmail" });
  else if (!isValidEmail(ec.email)) errors.push({ message: "Please enter a valid email address for the Emergency Contact.", focusId: "ecEmail" });
  if (!req(ec.telephone)) errors.push({ message: "Please enter the Emergency Contact's Telephone.", focusId: "ecTelephone" });
  if (!req(ec.relationship)) errors.push({ message: "Please select the Relationship to Applicant.", focusId: "ecRelationship" });
  return errors;
}

function validateEmergencyContactAddress() {
  const errors = [];
  const eca = formState.emergencyContactAddress;
  if (!req(eca.street)) errors.push({ message: "Please enter the Emergency Contact's Street Address.", focusId: "ecaStreet" });
  if (!req(eca.city)) errors.push({ message: "Please enter the Emergency Contact's City.", focusId: "ecaCity" });
  if (!req(eca.postalCode)) errors.push({ message: "Please enter the Emergency Contact's Postal Code.", focusId: "ecaPostal" });
  if (!req(eca.country)) errors.push({ message: "Please enter the Emergency Contact's Country.", focusId: "ecaCountry" });
  return errors;
}

function validateEducation() {
  const errors = [];
  if (formState.education.length === 0) {
    errors.push({ message: "Please add at least one Education record.", focusId: "addEducationBtn" });
    return errors;
  }
  formState.education.forEach((rec, i) => {
    const label = `Education ${i + 1}`;
    if (!req(rec.level)) errors.push({ message: `${label}: please select a Level of Education.`, focusId: `edu_level_${rec.id}` });
    if (!req(rec.institution)) errors.push({ message: `${label}: please enter the institution name.`, focusId: `edu_institution_${rec.id}` });
    if (!req(rec.start)) errors.push({ message: `${label}: please enter the Start of Studies.`, focusId: `edu_start_${rec.id}` });
    if (!rec.currentlyStudying && !req(rec.graduation)) errors.push({ message: `${label}: please enter the Graduation date.`, focusId: `edu_grad_${rec.id}` });
    if (!req(rec.country)) errors.push({ message: `${label}: please enter the Country.`, focusId: `edu_country_${rec.id}` });
    if (!req(rec.city)) errors.push({ message: `${label}: please enter the City.`, focusId: `edu_city_${rec.id}` });
  });
  return errors;
}

function validateHighSchool() {
  const errors = [];
  const hs = formState.highSchool;
  if (!req(hs.name)) errors.push({ message: "Please enter the High School Name.", focusId: "hsName" });
  if (!req(hs.city)) errors.push({ message: "Please enter the High School City.", focusId: "hsCity" });
  if (!req(hs.country)) errors.push({ message: "Please enter the High School Country.", focusId: "hsCountry" });
  if (!req(hs.attendanceFrom)) errors.push({ message: "Please enter the Attendance From date.", focusId: "hsFrom" });
  if (!req(hs.attendanceTo)) errors.push({ message: "Please enter the Attendance To date.", focusId: "hsTo" });
  if (!req(hs.diplomaType)) errors.push({ message: "Please select the Type of Diploma.", focusId: "hsDiploma" });
  if (hs.diplomaType === "Other" && !req(hs.diplomaOther)) errors.push({ message: "Please specify the diploma type.", focusId: "hsDiplomaOther" });
  return errors;
}

function validateTests() {
  const errors = [];
  const st = formState.standardizedTests;
  if (st.notTaken) return errors;
  if (st.tests.length === 0) {
    errors.push({ message: 'Please add a standardized test, or check "I have not taken a standardized test".', focusId: "addTestBtn" });
    return errors;
  }
  st.tests.forEach((rec, i) => {
    const label = `Test ${i + 1}`;
    if (!req(rec.name)) errors.push({ message: `${label}: please enter the Test Name.`, focusId: `test_name_${rec.id}` });
    if (!req(rec.date)) errors.push({ message: `${label}: please enter the Date of Test.`, focusId: `test_date_${rec.id}` });
    if (!req(rec.score)) errors.push({ message: `${label}: please enter the Test Score.`, focusId: `test_score_${rec.id}` });
    if (!req(rec.country)) errors.push({ message: `${label}: please enter the Country of Test Location.`, focusId: `test_country_${rec.id}` });
  });
  return errors;
}

function validateEnglish() {
  const errors = [];
  const ep = formState.englishProficiency;
  if (ep.native) return errors;
  if (!req(ep.testName)) errors.push({ message: "Please enter the Name of Test for English Proficiency.", focusId: "engTestName" });
  if (!req(ep.date)) errors.push({ message: "Please enter the Date of the English Proficiency Test.", focusId: "engDate" });
  if (!req(ep.candidateNumber)) errors.push({ message: "Please enter the Candidate / Registration Number.", focusId: "engCandidate" });
  if (!req(ep.country)) errors.push({ message: "Please enter the Country of Test Location.", focusId: "engCountry" });
  if (!req(ep.score)) errors.push({ message: "Please enter the English Proficiency Score.", focusId: "engScore" });
  return errors;
}

function validateEmployment() {
  const errors = [];
  const em = formState.employment;
  if (em.none) return errors;
  em.records.forEach((rec, i) => {
    const label = `Employment ${i + 1}`;
    if (!req(rec.employer)) errors.push({ message: `${label}: please enter the Employer / Company Name.`, focusId: `emp_employer_${rec.id}` });
    if (!req(rec.sector)) errors.push({ message: `${label}: please enter the Type of Business / Sector.`, focusId: `emp_sector_${rec.id}` });
    if (!req(rec.position)) errors.push({ message: `${label}: please enter the Occupation / Position.`, focusId: `emp_position_${rec.id}` });
    if (!req(rec.responsibility)) errors.push({ message: `${label}: please select the Level of Responsibility.`, focusId: `emp_level_${rec.id}` });
    if (!req(rec.from)) errors.push({ message: `${label}: please enter the From date.`, focusId: `emp_from_${rec.id}` });
    if (!req(rec.to)) errors.push({ message: `${label}: please enter the To date.`, focusId: `emp_to_${rec.id}` });
    if (!req(rec.activities)) errors.push({ message: `${label}: please describe the Most Important Activities.`, focusId: `emp_activities_${rec.id}` });
  });
  return errors;
}

/** Activities are optional overall; a card only needs to be complete once the user starts filling it in. */
function validateActivities() {
  const errors = [];
  formState.activities.forEach((rec, i) => {
    const started = req(rec.nature) || req(rec.organisation) || req(rec.from) || req(rec.description);
    if (!started) return;
    const label = `Activity ${i + 1}`;
    if (!req(rec.nature)) errors.push({ message: `${label}: please select the Nature of Activity.`, focusId: `act_nature_${rec.id}` });
    if (!req(rec.organisation)) errors.push({ message: `${label}: please enter the Organisation Name.`, focusId: `act_org_${rec.id}` });
    if (!req(rec.from)) errors.push({ message: `${label}: please enter the From date.`, focusId: `act_from_${rec.id}` });
    if (!req(rec.description)) errors.push({ message: `${label}: please enter a Description.`, focusId: `act_desc_${rec.id}` });
  });
  return errors;
}

function validateReferences() {
  const errors = [];
  const complete = formState.references.filter((r) => req(r.name) && req(r.email));
  if (complete.length < MIN_REFERENCES) {
    errors.push({ message: `Please add at least ${MIN_REFERENCES} referees with full name and email.`, focusId: "referencesList" });
  }
  formState.references.forEach((r, i) => {
    if (req(r.email) && !isValidEmail(r.email)) {
      errors.push({ message: `Referee ${i + 1}: please enter a valid email address.`, focusId: `ref_email_${r.id}` });
    }
  });
  return errors;
}

function validateStatement() {
  const errors = [];
  const len = (formState.statementOfPurpose || "").length;
  if (len < SOP_MIN_CHARS) {
    errors.push({ message: `Your Statement of Purpose must contain at least ${SOP_MIN_CHARS.toLocaleString()} characters.`, focusId: "statementText" });
  }
  if (len > SOP_MAX_CHARS) {
    errors.push({ message: `Your Statement of Purpose must not exceed ${SOP_MAX_CHARS.toLocaleString()} characters.`, focusId: "statementText" });
  }
  return errors;
}

/** Maps every step id to its validator function, used by app.js for step-by-step and full-form checks. */
const VALIDATORS = {
  personal: validatePersonal,
  passport: validatePassport,
  birth: validateBirth,
  address: validateAddress,
  emergencyContact: validateEmergencyContact,
  emergencyContactAddress: validateEmergencyContactAddress,
  education: validateEducation,
  highSchool: validateHighSchool,
  tests: validateTests,
  english: validateEnglish,
  employment: validateEmployment,
  activities: validateActivities,
  references: validateReferences,
  statement: validateStatement,
};

function validateAllSteps() {
  const results = {};
  Object.keys(VALIDATORS).forEach((key) => {
    results[key] = VALIDATORS[key]();
  });
  return results;
}
