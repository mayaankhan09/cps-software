// This file checks that incoming registration data makes sense before we try
// to save it to the database. Plain JavaScript checks — no extra validation
// library needed for this.

const ALLOWED_NEW_OLD = ["New", "Old"];
const ALLOWED_CATEGORY = ["General", "OBC", "SC", "ST"];

// Used when creating a brand new registration. Returns an array of error
// message strings — an empty array means "everything looks fine".
export function validateRegistrationInput(data) {
  const errors = [];

  if (!data.studentName || !data.studentName.trim()) {
    errors.push("studentName is required.");
  }
  if (!data.fatherContact1 || !data.fatherContact1.trim()) {
    errors.push("fatherContact1 is required.");
  }
  if (!data.dateOfBirth) {
    errors.push("dateOfBirth is required.");
  } else if (Number.isNaN(new Date(data.dateOfBirth).getTime())) {
    errors.push("dateOfBirth is not a valid date.");
  }

  errors.push(...validateEnumFields(data));

  return errors;
}

// Used when editing an existing registration. All fields are optional here,
// but if a field IS provided, it still has to be valid.
export function validateRegistrationUpdate(data) {
  const errors = [];

  if (data.studentName !== undefined && !data.studentName.trim()) {
    errors.push("studentName cannot be empty.");
  }
  if (data.fatherContact1 !== undefined && !data.fatherContact1.trim()) {
    errors.push("fatherContact1 cannot be empty.");
  }
  if (data.dateOfBirth !== undefined && Number.isNaN(new Date(data.dateOfBirth).getTime())) {
    errors.push("dateOfBirth is not a valid date.");
  }

  errors.push(...validateEnumFields(data));

  return errors;
}

// Shared enum checks used by both create and update.
function validateEnumFields(data) {
  const errors = [];

  if (data.studentNewOld !== undefined && !ALLOWED_NEW_OLD.includes(data.studentNewOld)) {
    errors.push(`studentNewOld must be one of: ${ALLOWED_NEW_OLD.join(", ")}`);
  }
  if (data.category !== undefined && !ALLOWED_CATEGORY.includes(data.category)) {
    errors.push(`category must be one of: ${ALLOWED_CATEGORY.join(", ")}`);
  }

  return errors;
}
