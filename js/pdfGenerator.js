/**
 * pdfGenerator.js
 * Builds a formal, multi-page PDF of the completed application using jsPDF
 * and jsPDF-AutoTable. Entirely client-side; no data leaves the browser.
 * Kept independent of the form/validation logic - it only ever reads formState.
 */

const PDF_COLORS = {
  navy: [27, 42, 74],
  maroon: [122, 31, 43],
  grey: [96, 104, 119],
  lightGrey: [245, 246, 248],
  border: [214, 219, 228],
  white: [255, 255, 255],
};

const PAGE_MARGIN = 40;
const HEADER_Y = 38;
const CONTENT_TOP = 72;
const FOOTER_LINE_OFFSET = 45;

function pdfValue(v) {
  const s = (v === undefined || v === null) ? "" : String(v).trim();
  return s === "" ? "\u2014" : s;
}

function formatFullDate(isoDate) {
  if (!isoDate) return "\u2014";
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function formatMonthYear(monthStr) {
  if (!monthStr) return "\u2014";
  const parts = monthStr.split("-");
  if (parts.length < 2) return monthStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  if (isNaN(d.getTime())) return monthStr;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function sanitizeFilenamePart(value) {
  return (value || "").trim().replace(/[^a-zA-Z0-9 _-]/g, "");
}

function buildPdfFilename() {
  const given = sanitizeFilenamePart(formState.applicant.givenName);
  const family = sanitizeFilenamePart(formState.applicant.familyName);
  const full = [given, family].filter(Boolean).join(" ");
  return full ? `iCLA Application - ${full}.pdf` : "iCLA Application.pdf";
}

/** Ensures there is room for `neededHeight` below cursor.y; adds a page if not. */
function ensureSpace(doc, cursor, neededHeight, pageHeight) {
  if (cursor.y + neededHeight > pageHeight - 60) {
    doc.addPage();
    cursor.y = CONTENT_TOP;
  }
}

function drawSectionHeading(doc, cursor, title, pageWidth, pageHeight) {
  ensureSpace(doc, cursor, 40, pageHeight);
  cursor.y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(title.toUpperCase(), PAGE_MARGIN, cursor.y);
  doc.setDrawColor(...PDF_COLORS.maroon);
  doc.setLineWidth(1.2);
  doc.line(PAGE_MARGIN, cursor.y + 5, pageWidth - PAGE_MARGIN, cursor.y + 5);
  cursor.y += 16;
}

function drawSubHeading(doc, cursor, title, pageHeight) {
  ensureSpace(doc, cursor, 44, pageHeight);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...PDF_COLORS.maroon);
  doc.text(title, PAGE_MARGIN, cursor.y);
  cursor.y += 10;
}

function drawNote(doc, cursor, text, pageWidth, pageHeight) {
  ensureSpace(doc, cursor, 30, pageHeight);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_COLORS.grey);
  const lines = doc.splitTextToSize(text, pageWidth - PAGE_MARGIN * 2);
  doc.text(lines, PAGE_MARGIN, cursor.y);
  cursor.y += lines.length * 13 + 14;
}

function drawKeyValueTable(doc, cursor, rows, pageWidth) {
  doc.autoTable({
    startY: cursor.y,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: CONTENT_TOP, bottom: 60 },
    theme: "grid",
    head: [],
    body: rows,
    styles: {
      fontSize: 9.5,
      cellPadding: 6,
      textColor: PDF_COLORS.navy,
      lineColor: PDF_COLORS.border,
      lineWidth: 0.6,
      valign: "top",
    },
    columnStyles: {
      0: { cellWidth: 170, fontStyle: "bold", fillColor: PDF_COLORS.lightGrey },
      1: { cellWidth: pageWidth - PAGE_MARGIN * 2 - 170 },
    },
  });
  cursor.y = doc.lastAutoTable.finalY + 20;
}

/* ------------------------- Section builders ------------------------- */

function buildPersonal() {
  const a = formState.applicant;
  return [
    ["Given Name", pdfValue(a.givenName)],
    ["Family Name", pdfValue(a.familyName)],
    ["Gender", pdfValue(a.gender)],
    ["Citizenship", pdfValue(a.citizenship)],
  ];
}

function buildPassport() {
  const p = formState.passport;
  return [
    ["Passport Number", pdfValue(p.number)],
    ["Expiry Date", formatFullDate(p.expiry)],
    ["Country of Issue", pdfValue(p.countryOfIssue)],
  ];
}

function buildBirth() {
  const b = formState.birth;
  return [
    ["Date of Birth", formatFullDate(b.dob)],
    ["City of Birth", pdfValue(b.city)],
    ["Country of Birth", pdfValue(b.country)],
  ];
}

function buildAddress() {
  const ad = formState.address;
  return [
    ["Street Address", pdfValue(ad.street)],
    ["City", pdfValue(ad.city)],
    ["Province / Region", pdfValue(ad.province)],
    ["State", pdfValue(ad.state)],
    ["Postal Code", pdfValue(ad.postalCode)],
    ["Country", pdfValue(ad.country)],
    ["Mobile Number", pdfValue(formState.phone.mobile)],
  ];
}

function buildEmergencyContact() {
  const ec = formState.emergencyContact;
  return [
    ["Full Name", pdfValue(ec.fullName)],
    ["Email", pdfValue(ec.email)],
    ["Telephone", pdfValue(ec.telephone)],
    ["Relationship to Applicant", pdfValue(ec.relationship)],
  ];
}

function buildEmergencyContactAddress() {
  const eca = formState.emergencyContactAddress;
  return [
    ["Street Address", pdfValue(eca.street)],
    ["City", pdfValue(eca.city)],
    ["Province / Region", pdfValue(eca.province)],
    ["Postal Code", pdfValue(eca.postalCode)],
    ["Country", pdfValue(eca.country)],
  ];
}

function buildHighSchool() {
  const hs = formState.highSchool;
  const diploma = hs.diplomaType === "Other" ? pdfValue(hs.diplomaOther) : pdfValue(hs.diplomaType);
  return [
    ["High School Name", pdfValue(hs.name)],
    ["City", pdfValue(hs.city)],
    ["Country", pdfValue(hs.country)],
    ["Attendance From", formatMonthYear(hs.attendanceFrom)],
    ["Attendance To", formatMonthYear(hs.attendanceTo)],
    ["Diploma / Graduation Certificate", diploma],
  ];
}

function buildEnglish() {
  const ep = formState.englishProficiency;
  if (ep.native) {
    return [["Proficiency", "Native English Speaker"]];
  }
  return [
    ["Name of Test", pdfValue(ep.testName)],
    ["Date of Test", formatFullDate(ep.date)],
    ["Candidate / Registration Number", pdfValue(ep.candidateNumber)],
    ["Country of Test Location", pdfValue(ep.country)],
    ["Score", pdfValue(ep.score)],
  ];
}

/* ------------------------- Main generation flow ------------------------- */

function generateApplicationPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const cursor = { y: CONTENT_TOP };

  const fullName = [formState.applicant.givenName, formState.applicant.familyName].filter(Boolean).join(" ") || "Applicant";
  const generatedDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  /* Cover block */
  cursor.y = 110;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text("iCLA APPLICATION FORM", pageWidth / 2, cursor.y, { align: "center" });
  cursor.y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...PDF_COLORS.maroon);
  doc.text("Applicant Information", pageWidth / 2, cursor.y, { align: "center" });
  cursor.y += 22;
  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(1);
  doc.line(PAGE_MARGIN, cursor.y, pageWidth - PAGE_MARGIN, cursor.y);
  cursor.y += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(fullName, pageWidth / 2, cursor.y, { align: "center" });
  cursor.y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_COLORS.grey);
  doc.text(`Application prepared on ${generatedDate}`, pageWidth / 2, cursor.y, { align: "center" });
  cursor.y += 30;

  /* 1. Personal Information */
  drawSectionHeading(doc, cursor, "Personal Information", pageWidth, pageHeight);
  drawKeyValueTable(doc, cursor, buildPersonal(), pageWidth);

  /* 2. Passport Information */
  drawSectionHeading(doc, cursor, "Passport Information", pageWidth, pageHeight);
  drawKeyValueTable(doc, cursor, buildPassport(), pageWidth);

  /* 3. Birth Details */
  drawSectionHeading(doc, cursor, "Birth Details", pageWidth, pageHeight);
  drawKeyValueTable(doc, cursor, buildBirth(), pageWidth);

  /* 4. Address and Contact */
  drawSectionHeading(doc, cursor, "Address and Contact", pageWidth, pageHeight);
  drawKeyValueTable(doc, cursor, buildAddress(), pageWidth);

  /* 5. Emergency Contact */
  drawSectionHeading(doc, cursor, "Emergency Contact", pageWidth, pageHeight);
  drawKeyValueTable(doc, cursor, buildEmergencyContact(), pageWidth);

  /* 6. Emergency Contact Address */
  drawSectionHeading(doc, cursor, "Emergency Contact Address", pageWidth, pageHeight);
  drawKeyValueTable(doc, cursor, buildEmergencyContactAddress(), pageWidth);

  /* 7. Education History */
  drawSectionHeading(doc, cursor, "Education History", pageWidth, pageHeight);
  if (formState.education.length === 0) {
    drawNote(doc, cursor, "No education history was reported.", pageWidth, pageHeight);
  } else {
    formState.education.forEach((rec, i) => {
      drawSubHeading(doc, cursor, `Education ${i + 1}`, pageHeight);
      drawKeyValueTable(
        doc,
        cursor,
        [
          ["Level of Education", pdfValue(rec.level)],
          ["Institution", pdfValue(rec.institution)],
          ["Start of Studies", formatMonthYear(rec.start)],
          [rec.currentlyStudying ? "Expected Graduation" : "Graduation", rec.currentlyStudying ? formatMonthYear(rec.graduation) + " (In Progress)" : formatMonthYear(rec.graduation)],
          ["City", pdfValue(rec.city)],
          ["Country", pdfValue(rec.country)],
        ],
        pageWidth
      );
    });
  }

  /* 8. High School Details */
  drawSectionHeading(doc, cursor, "High School Details", pageWidth, pageHeight);
  drawKeyValueTable(doc, cursor, buildHighSchool(), pageWidth);

  /* 9. Standardized Tests */
  drawSectionHeading(doc, cursor, "Standardized Tests", pageWidth, pageHeight);
  if (formState.standardizedTests.notTaken || formState.standardizedTests.tests.length === 0) {
    drawNote(doc, cursor, "The applicant has not taken a standardized test.", pageWidth, pageHeight);
  } else {
    formState.standardizedTests.tests.forEach((rec, i) => {
      drawSubHeading(doc, cursor, `Test ${i + 1}`, pageHeight);
      drawKeyValueTable(
        doc,
        cursor,
        [
          ["Test Name", pdfValue(rec.name)],
          ["Date of Test", formatFullDate(rec.date)],
          ["Test Score", pdfValue(rec.score)],
          ["Country of Test Location", pdfValue(rec.country)],
        ],
        pageWidth
      );
    });
  }

  /* 10. English Proficiency */
  drawSectionHeading(doc, cursor, "English Proficiency", pageWidth, pageHeight);
  drawKeyValueTable(doc, cursor, buildEnglish(), pageWidth);

  /* 11. Employment History */
  drawSectionHeading(doc, cursor, "Employment History", pageWidth, pageHeight);
  if (formState.employment.none || formState.employment.records.length === 0) {
    drawNote(doc, cursor, "The applicant reported no employment experience.", pageWidth, pageHeight);
  } else {
    formState.employment.records.forEach((rec, i) => {
      drawSubHeading(doc, cursor, `Employment ${i + 1}`, pageHeight);
      drawKeyValueTable(
        doc,
        cursor,
        [
          ["Employer / Company Name", pdfValue(rec.employer)],
          ["Type of Business / Sector", pdfValue(rec.sector)],
          ["Occupation / Position", pdfValue(rec.position)],
          ["Level of Responsibility", pdfValue(rec.responsibility)],
          ["From", formatMonthYear(rec.from)],
          ["To", formatMonthYear(rec.to)],
          ["Most Important Activities", pdfValue(rec.activities)],
        ],
        pageWidth
      );
    });
  }

  /* 12. Activities */
  drawSectionHeading(doc, cursor, "Activities", pageWidth, pageHeight);
  const reportedActivities = formState.activities.filter((r) => r.nature || r.organisation || r.description);
  if (reportedActivities.length === 0) {
    drawNote(doc, cursor, "No activities were reported.", pageWidth, pageHeight);
  } else {
    reportedActivities.forEach((rec, i) => {
      drawSubHeading(doc, cursor, `Activity ${i + 1}`, pageHeight);
      drawKeyValueTable(
        doc,
        cursor,
        [
          ["Nature of Activity", pdfValue(rec.nature)],
          ["Organisation Name", pdfValue(rec.organisation)],
          ["From", formatMonthYear(rec.from)],
          ["To", rec.to ? formatMonthYear(rec.to) : "Ongoing"],
          ["Description", pdfValue(rec.description)],
        ],
        pageWidth
      );
    });
  }

  /* 13. Academic References */
  drawSectionHeading(doc, cursor, "Academic References", pageWidth, pageHeight);
  const completeRefs = formState.references.filter((r) => r.name && r.email);
  drawKeyValueTable(
    doc,
    cursor,
    completeRefs.map((r, i) => [`Referee ${i + 1}`, `${pdfValue(r.name)}  \u2014  ${pdfValue(r.email)}`]),
    pageWidth
  );

  /* 14. Statement of Purpose */
  drawSectionHeading(doc, cursor, "Statement of Purpose", pageWidth, pageHeight);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.navy);
  const sopLines = doc.splitTextToSize(formState.statementOfPurpose || "", pageWidth - PAGE_MARGIN * 2);
  const lineHeight = 14;
  sopLines.forEach((line) => {
    ensureSpace(doc, cursor, lineHeight, pageHeight);
    doc.text(line, PAGE_MARGIN, cursor.y);
    cursor.y += lineHeight;
  });

  /* Header + footer on every page, added last so total page count is known */
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.6);
    doc.line(PAGE_MARGIN, 48, pageWidth - PAGE_MARGIN, 48);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_COLORS.navy);
    doc.text("iCLA APPLICATION FORM", PAGE_MARGIN, HEADER_Y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...PDF_COLORS.grey);
    doc.text(fullName, pageWidth / 2, HEADER_Y, { align: "center" });
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - PAGE_MARGIN, HEADER_Y, { align: "right" });

    doc.setDrawColor(...PDF_COLORS.border);
    doc.line(PAGE_MARGIN, pageHeight - FOOTER_LINE_OFFSET, pageWidth - PAGE_MARGIN, pageHeight - FOOTER_LINE_OFFSET);
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.grey);
    doc.text("Generated from iCLA Application Form", PAGE_MARGIN, pageHeight - FOOTER_LINE_OFFSET + 14);
    doc.text(generatedDate, pageWidth - PAGE_MARGIN, pageHeight - FOOTER_LINE_OFFSET + 14, { align: "right" });
  }

  doc.save(buildPdfFilename());
}
