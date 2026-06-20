// This file holds all the business logic for staff: creating them, listing
// them, viewing one, editing them, and changing their status. The controller
// just calls these functions and turns the result into an HTTP response.

import Staff from "./staff.model.js";
import { getNextSequence } from "../../core/services/counter.service.js";

// Fields a caller is allowed to set when creating a staff member.
const CREATABLE_FIELDS = [
  "employeeName", "gender", "dateOfBirth",
  "email", "contactNo1", "contactNo2", "whatsappNo",
  "category", "religion", "bloodGroup",
  "department", "designation",
  "medium", "staffType", "joiningDate",
  "salary", "checkForMessage",
];

// Fields a caller is allowed to change via PUT /:id. employeeId, status, and
// userId are deliberately left out — status has its own dedicated endpoint,
// employeeId is permanent, and userId will only ever be set by a future
// auth/account-linking flow, not a generic profile edit.
const EDITABLE_FIELDS = CREATABLE_FIELDS;

function pickFields(data, fields) {
  const result = {};
  for (const key of fields) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

function notFoundError(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

// Creates a brand new staff member and gives them the next employeeId.
export async function createStaff(data) {
  const employeeId = await getNextSequence("employeeId");

  const staff = new Staff({
    ...pickFields(data, CREATABLE_FIELDS),
    employeeId,
  });

  await staff.save();
  return staff;
}

// Lists staff, optionally filtered by staffType/department/status. Defaults
// to "active" staff only — pass status="all" to see resigned staff too.
export async function listStaff({ staffType, department, status }) {
  const query = {};
  if (staffType) query.staffType = staffType;
  if (department) query.department = department;

  const effectiveStatus = status || "active";
  if (effectiveStatus !== "all") query.status = effectiveStatus;

  // salary is excluded automatically here because the schema marks it
  // "select: false" — nothing extra needed to keep it out of list views.
  return Staff.find(query).sort({ employeeId: 1 });
}

// Loads a single staff member INCLUDING salary. This is more sensitive than
// the list view, so once roles/permissions exist (a future phase), access to
// this field on this route should be permission-gated rather than open to
// anyone who can view a staff record.
export async function getStaffById(id) {
  const staff = await Staff.findById(id).select("+salary");
  if (!staff) throw notFoundError("Staff member not found.");
  return staff;
}

// Edits a staff member's profile info. Status changes go through
// updateStatus() instead, and employeeId/userId are not editable here.
export async function updateStaff(id, data) {
  const staff = await Staff.findById(id);
  if (!staff) throw notFoundError("Staff member not found.");

  Object.assign(staff, pickFields(data, EDITABLE_FIELDS));
  await staff.save();
  return staff;
}

// Changes a staff member's status. We never hard-delete a staff record —
// this is the only supported way to mark someone as no longer working here.
export async function updateStatus(id, status) {
  const staff = await Staff.findById(id);
  if (!staff) throw notFoundError("Staff member not found.");

  staff.status = status;
  await staff.save();
  return staff;
}
