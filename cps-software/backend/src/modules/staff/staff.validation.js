// This file checks that incoming staff data makes sense before we try to
// save it to the database. Plain JavaScript checks — no extra validation
// library needed for this.

const ALLOWED_MEDIUM = ["Hindi", "English", "Both"];
const ALLOWED_STAFF_TYPE = ["teaching", "driver", "office", "admin", "other"];
const ALLOWED_STATUS = ["active", "resigned"];

// A very loose check — just enough to catch obviously-wrong input like a
// missing "@", without being a full email-format validator.
function looksLikeEmail(value) {
  return typeof value === "string" && value.includes("@");
}

// Used when creating a brand new staff member. Returns an array of error
// message strings — an empty array means "everything looks fine".
export function validateStaffInput(data) {
  const errors = [];

  if (!data.employeeName || !data.employeeName.trim()) {
    errors.push("employeeName is required.");
  }
  if (!data.gender || !data.gender.trim()) {
    errors.push("gender is required.");
  }
  if (!data.email || !looksLikeEmail(data.email)) {
    errors.push("email is required and must look like a valid email address.");
  }
  if (!data.contactNo1 || !data.contactNo1.trim()) {
    errors.push("contactNo1 is required.");
  }

  errors.push(...validateEnumFields(data, { mediumRequired: true, staffTypeRequired: true }));

  return errors;
}

// Used when editing an existing staff member. All fields are optional here,
// but if a field IS provided, it still has to be valid.
export function validateStaffUpdate(data) {
  const errors = [];

  if (data.employeeName !== undefined && !data.employeeName.trim()) {
    errors.push("employeeName cannot be empty.");
  }
  if (data.email !== undefined && !looksLikeEmail(data.email)) {
    errors.push("email must look like a valid email address.");
  }
  if (data.contactNo1 !== undefined && !data.contactNo1.trim()) {
    errors.push("contactNo1 cannot be empty.");
  }
  if (data.status !== undefined) {
    errors.push("status cannot be changed here — use PATCH /:id/status instead.");
  }

  errors.push(...validateEnumFields(data, { mediumRequired: false, staffTypeRequired: false }));

  return errors;
}

// Used for PATCH /:id/status — only the status field is expected.
export function validateStatusChange(data) {
  const errors = [];

  if (!data.status) {
    errors.push("status is required.");
  } else if (!ALLOWED_STATUS.includes(data.status)) {
    errors.push(`status must be one of: ${ALLOWED_STATUS.join(", ")}`);
  }

  return errors;
}

// Shared enum checks used by both create and update.
function validateEnumFields(data, { mediumRequired, staffTypeRequired }) {
  const errors = [];

  if (mediumRequired && !data.medium) {
    errors.push("medium is required.");
  } else if (data.medium !== undefined && !ALLOWED_MEDIUM.includes(data.medium)) {
    errors.push(`medium must be one of: ${ALLOWED_MEDIUM.join(", ")}`);
  }

  if (staffTypeRequired && !data.staffType) {
    errors.push("staffType is required.");
  } else if (data.staffType !== undefined && !ALLOWED_STAFF_TYPE.includes(data.staffType)) {
    errors.push(`staffType must be one of: ${ALLOWED_STAFF_TYPE.join(", ")}`);
  }

  return errors;
}
