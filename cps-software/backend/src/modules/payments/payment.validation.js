// This file checks that incoming payment requests make sense before we try
// to act on them. Plain JavaScript checks — no extra validation library
// needed for this.

const ALLOWED_MODES = ["cash", "upi", "card", "cheque", "bank"];

// Used for POST / (recordPayment).
export function validateRecordPaymentInput(data) {
  const errors = [];

  if (!data.studentId || !String(data.studentId).trim()) {
    errors.push("studentId is required.");
  }
  if (!Array.isArray(data.dueIds) || data.dueIds.length === 0) {
    errors.push("dueIds must be a non-empty array of fee due ids.");
  }
  if (!data.mode || !ALLOWED_MODES.includes(data.mode)) {
    errors.push(`mode is required and must be one of: ${ALLOWED_MODES.join(", ")}`);
  }
  if (!data.collectedBy || !String(data.collectedBy).trim()) {
    errors.push("collectedBy is required.");
  }

  return errors;
}

// Used for POST /:id/reverse.
export function validateReverseInput(data) {
  const errors = [];

  if (!data.reason || !String(data.reason).trim()) {
    errors.push("reason is required when reversing a payment.");
  }

  return errors;
}
