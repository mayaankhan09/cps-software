// This file holds all the business logic for fee structures: creating them,
// listing them, viewing one, editing them, and activating/deactivating
// them. The controller just calls these functions and turns the result into
// an HTTP response.

import FeeStructure from "./feeStructure.model.js";

// Fields a caller is allowed to set when creating or editing a fee
// structure. isActive is deliberately left out — it has its own dedicated
// endpoint (PATCH /:id/status), same pattern as status on other modules.
const EDITABLE_FIELDS = ["academicYear", "className", "board", "components", "dueDayOfMonth"];

function pickFields(data, fields) {
  const result = {};
  for (const key of fields) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

// Adds up every component whose frequency is "monthly". This is what keeps
// monthlyTotal accurate any time components are set or changed.
function calculateMonthlyTotal(components) {
  return components
    .filter((component) => component.frequency === "monthly")
    .reduce((sum, component) => sum + component.amount, 0);
}

function notFoundError(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function conflictError(message) {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
}

// MongoDB raises error code 11000 when a unique index (here, the
// className+academicYear+board combination) is violated. We turn that into
// a clear, friendly error instead of letting a raw database error escape.
function isDuplicateKeyError(error) {
  return error?.code === 11000;
}

// Creates a brand new fee structure, computing monthlyTotal automatically
// from whatever components were given.
export async function createFeeStructure(data) {
  const fields = pickFields(data, EDITABLE_FIELDS);

  const feeStructure = new FeeStructure({
    ...fields,
    monthlyTotal: calculateMonthlyTotal(fields.components),
  });

  try {
    await feeStructure.save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw conflictError(
        "A fee structure already exists for this class, academic year, and board combination."
      );
    }
    throw error;
  }

  return feeStructure;
}

// Lists fee structures, optionally filtered by academicYear/className.
// Defaults to active structures only — pass isActive=all to see deactivated
// ones too (e.g. to look up history for old dues).
export async function listFeeStructures({ academicYear, className, isActive }) {
  const query = {};
  if (academicYear) query.academicYear = academicYear;
  if (className) query.className = className;

  if (isActive !== "all") {
    query.isActive = isActive === undefined ? true : isActive === "true";
  }

  return FeeStructure.find(query).sort({ academicYear: -1, className: 1 });
}

export async function getFeeStructureById(id) {
  const feeStructure = await FeeStructure.findById(id);
  if (!feeStructure) throw notFoundError("Fee structure not found.");
  return feeStructure;
}

// Edits a fee structure. If "components" is part of the update, monthlyTotal
// is recalculated from the new list; otherwise it's left alone.
export async function updateFeeStructure(id, data) {
  const feeStructure = await FeeStructure.findById(id);
  if (!feeStructure) throw notFoundError("Fee structure not found.");

  const fields = pickFields(data, EDITABLE_FIELDS);
  Object.assign(feeStructure, fields);

  if (fields.components !== undefined) {
    feeStructure.monthlyTotal = calculateMonthlyTotal(feeStructure.components);
  }

  try {
    await feeStructure.save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw conflictError(
        "Another fee structure already exists for this class, academic year, and board combination."
      );
    }
    throw error;
  }

  return feeStructure;
}

// Activates or deactivates a fee structure. We never hard-delete one —
// dues already generated from it may still need to reference it later.
export async function updateActiveStatus(id, isActive) {
  const feeStructure = await FeeStructure.findById(id);
  if (!feeStructure) throw notFoundError("Fee structure not found.");

  feeStructure.isActive = isActive;
  await feeStructure.save();
  return feeStructure;
}
