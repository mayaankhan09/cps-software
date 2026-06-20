// This file checks that incoming fee structure data makes sense before we
// try to save it to the database. Plain JavaScript checks — no extra
// validation library needed for this.

const ALLOWED_BOARDS = ["CBSE", "CG_STATE"];

// Checks one component object, e.g. { name: "Tuition", amount: 1200, frequency: "monthly" }.
// Returns an array of error messages (empty means "this component is fine").
function validateComponent(component, index) {
  const errors = [];
  const label = `components[${index}]`;

  if (!component || typeof component !== "object") {
    return [`${label} must be an object with name, amount, and frequency.`];
  }
  if (!component.name || !String(component.name).trim()) {
    errors.push(`${label}.name is required.`);
  }
  if (component.amount === undefined || component.amount === null || Number(component.amount) < 0) {
    errors.push(`${label}.amount is required and must be 0 or more.`);
  }
  if (!component.frequency || !String(component.frequency).trim()) {
    errors.push(`${label}.frequency is required (e.g. "monthly").`);
  }

  return errors;
}

// Shared by create and update — board is only checked if it was actually
// provided, since leaving it out (or sending null) is the normal case.
function validateBoard(board) {
  if (board === undefined || board === null) return [];
  if (!ALLOWED_BOARDS.includes(board)) {
    return [`board must be one of: ${ALLOWED_BOARDS.join(", ")}, or left out/null.`];
  }
  return [];
}

function validateComponentsList(components) {
  const errors = [];

  if (!Array.isArray(components) || components.length === 0) {
    return ["components must be a non-empty array — at least one fee component is required."];
  }

  components.forEach((component, index) => {
    errors.push(...validateComponent(component, index));
  });

  return errors;
}

// Used when creating a brand new fee structure.
export function validateFeeStructureInput(data) {
  const errors = [];

  if (!data.academicYear || !String(data.academicYear).trim()) {
    errors.push("academicYear is required.");
  }
  if (!data.className || !String(data.className).trim()) {
    errors.push("className is required.");
  }

  errors.push(...validateComponentsList(data.components));
  errors.push(...validateBoard(data.board));

  return errors;
}

// Used when editing an existing fee structure. academicYear/className are
// still required if you're changing them, but since PUT can be a partial
// edit, we only check fields that were actually sent.
export function validateFeeStructureUpdate(data) {
  const errors = [];

  if (data.academicYear !== undefined && !String(data.academicYear).trim()) {
    errors.push("academicYear cannot be empty.");
  }
  if (data.className !== undefined && !String(data.className).trim()) {
    errors.push("className cannot be empty.");
  }
  if (data.components !== undefined) {
    errors.push(...validateComponentsList(data.components));
  }
  errors.push(...validateBoard(data.board));

  return errors;
}

// Used for PATCH /:id/status.
export function validateStatusChange(data) {
  const errors = [];

  if (typeof data.isActive !== "boolean") {
    errors.push("isActive is required and must be true or false.");
  }

  return errors;
}
