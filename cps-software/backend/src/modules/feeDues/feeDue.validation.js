// This file checks that incoming requests for the dues module make sense.
// Plain JavaScript checks — no extra validation library needed for this.

const MONTH_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/; // e.g. "2026-04"

// Used for POST /generate.
export function validateGenerateRequest(data) {
  const errors = [];

  if (!data.academicYear || !String(data.academicYear).trim()) {
    errors.push('academicYear is required (e.g. "2026-27").');
  }
  if (!data.month || !MONTH_FORMAT.test(data.month)) {
    errors.push('month is required and must be in "YYYY-MM" format (e.g. "2026-04").');
  }

  return errors;
}
