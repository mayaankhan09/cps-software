// This file checks that incoming student data makes sense before we try to
// save it to the database. Plain JavaScript checks — no extra validation
// library needed for this.

const ALLOWED_STATUS = ["active", "inactive", "transferred"];
const ALLOWED_CATEGORY = ["General", "OBC", "SC", "ST"];

// Used when editing an existing student's profile/document/sibling info.
export function validateStudentUpdate(data) {
  const errors = [];

  if (data.studentName !== undefined && !data.studentName.trim()) {
    errors.push("studentName cannot be empty.");
  }
  if (data.category !== undefined && !ALLOWED_CATEGORY.includes(data.category)) {
    errors.push(`category must be one of: ${ALLOWED_CATEGORY.join(", ")}`);
  }
  if (data.status !== undefined) {
    errors.push("status cannot be changed here — use PATCH /:id/status instead.");
  }

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

// Used for POST /resort-rolls — needs to know exactly which group of
// students to re-sort.
export function validateResortRequest(data) {
  const errors = [];

  if (!data.class) errors.push("class is required.");
  if (!data.academicYear) errors.push("academicYear is required.");

  return errors;
}
