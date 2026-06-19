// This file holds all the business logic for registrations: creating them,
// listing them, editing them (while still pending), and approving/rejecting
// them. The controller just calls these functions and turns the result into
// an HTTP response.

import Registration from "./registration.model.js";
import { getNextSequence } from "../../core/services/counter.service.js";
import { dateToWords } from "../../core/services/dateToWords.util.js";
import { createStudentFromRegistration } from "../students/student.service.js";

// Fields a caller is allowed to set when creating or editing a registration.
// Anything else in the request body (like status or registrationNo) is
// ignored on purpose — those are controlled by this service, not the caller.
const EDITABLE_FIELDS = [
  "studentNewOld", "class", "studentName",
  "fatherName", "motherName", "fatherContact1", "fatherContact2",
  "dateOfBirth", "gender",
  "dateOfAdmission", "admissionType", "admissionScheme", "feeCategory",
  "registrationFees", "paymentMode", "smsContactNo", "aadhaarNumber", "category",
  "studentAddress", "villageCity", "block", "district", "state", "pincode", "landmark",
  "bus", "hostel", "library",
  "studentPhoto", "fatherPhoto", "motherPhoto",
  "remark1", "remark2", "remark3", "remark4", "siblingOf",
];

// Copies only the allowed keys out of an incoming request body.
function pickEditableFields(data) {
  const result = {};
  for (const key of EDITABLE_FIELDS) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
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

// Creates a brand new registration: gives it the next registrationNo and
// fills in dobInWords automatically from the date of birth supplied.
export async function createRegistration(data) {
  const registrationNo = await getNextSequence("registrationNo");

  const registration = new Registration({
    ...pickEditableFields(data),
    registrationNo,
    dobInWords: dateToWords(data.dateOfBirth),
  });

  await registration.save();
  return registration;
}

// Lists registrations. By default only "pending" ones are shown, since that
// is the queue Management usually needs to act on. Pass status="all" to see
// every registration regardless of status.
export async function listRegistrations({ status }) {
  const effectiveStatus = status || "pending";
  const query = effectiveStatus === "all" ? {} : { status: effectiveStatus };

  // aadhaarNumber is excluded automatically here because the schema marks it
  // "select: false" — we don't need to do anything extra for that.
  return Registration.find(query).sort({ registrationNo: 1 });
}

export async function getRegistrationById(id) {
  const registration = await Registration.findById(id);
  if (!registration) throw notFoundError("Registration not found.");
  return registration;
}

// Edits a registration. Only allowed while it is still "pending" — once
// approved or rejected, a registration is frozen so the history of what was
// actually submitted/approved never changes.
export async function updateRegistration(id, data) {
  const registration = await Registration.findById(id);
  if (!registration) throw notFoundError("Registration not found.");

  if (registration.status !== "pending") {
    throw conflictError("Only a pending registration can be edited.");
  }

  Object.assign(registration, pickEditableFields(data));

  // If the date of birth changed, regenerate the words version to match.
  if (data.dateOfBirth !== undefined) {
    registration.dobInWords = dateToWords(registration.dateOfBirth);
  }

  await registration.save();
  return registration;
}

// Approves a registration: creates the real Student record from it, links
// the two records together, and freezes this registration as "approved".
export async function approveRegistration(id) {
  // We need aadhaarNumber here (even though it's hidden by default) so we
  // can copy it onto the new Student record.
  const registration = await Registration.findById(id).select("+aadhaarNumber");
  if (!registration) throw notFoundError("Registration not found.");

  if (registration.status === "approved") {
    throw conflictError("This registration has already been approved.");
  }

  const student = await createStudentFromRegistration(registration);

  registration.status = "approved";
  registration.convertedToStudent = student._id;
  await registration.save();

  return { registration, student };
}

// Rejects a registration. An already-approved registration cannot be
// rejected, since a real Student record already exists for it.
export async function rejectRegistration(id) {
  const registration = await Registration.findById(id);
  if (!registration) throw notFoundError("Registration not found.");

  if (registration.status === "approved") {
    throw conflictError("An approved registration cannot be rejected.");
  }

  registration.status = "rejected";
  await registration.save();
  return registration;
}
