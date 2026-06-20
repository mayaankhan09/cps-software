// This file holds all the business logic for students: turning an approved
// registration into a student, listing/editing students, changing their
// status, and the roll-number rules described below.
//
// ROLL NUMBER RULES:
// - Roll numbers are scoped to one class + section + academicYear group.
// - Normal assignment (start of a new academic year): sort that group's
//   active students alphabetically by name and number them 1, 2, 3...
//   -> resortRollNumbers() does this.
// - Mid-session joiner (a student approved partway through the year): we do
//   NOT re-sort everyone else. They just get the next free number
//   (current highest + 1) so nobody else's roll number changes.
//   -> getNextRollNumberForJoiner() does this, and createStudentFromRegistration()
//      always uses it, because a newly approved student is always a
//      mid-session joiner from the system's point of view.

import Student from "./student.model.js";
import { getNextSequence } from "../../core/services/counter.service.js";

// Fields a caller is allowed to change via PUT /:id (profile/document/sibling
// updates). Fields like admissionNumber, rollNumber, academicYear and status
// are deliberately left out — those are managed by dedicated logic, not a
// generic edit.
const EDITABLE_FIELDS = [
  "studentNewOld", "class", "studentName", "dateOfBirth", "gender", "category", "smsContactNo",
  "fatherName", "motherName", "fatherContact1", "fatherContact2",
  "studentAddress", "villageCity", "block", "district", "state", "pincode", "landmark",
  "studentPhoto", "fatherPhoto", "motherPhoto",
  "bus", "hostel", "library",
  "aadhaarNumber", "section", "siblingOf",
];

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

// Works out the current academic year using the common April-to-March
// school year convention (so January-March still counts as part of the
// academic year that started the previous April).
// Exported so other modules (like the dues-generation job) can ask "what
// academic year is it right now?" without duplicating this logic.
export function getCurrentAcademicYear(date = new Date()) {
  const year = date.getFullYear();
  const startYear = date.getMonth() < 3 ? year - 1 : year; // months 0,1,2 = Jan-Mar
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYearShort}`;
}

// Finds the next free roll number for a mid-session joiner: the highest
// existing roll number in that class+section+academicYear group, plus one.
// Existing students' roll numbers are never touched.
export async function getNextRollNumberForJoiner(classValue, section, academicYear) {
  const highestRolled = await Student.findOne({
    class: classValue,
    section: section ?? null,
    academicYear,
    status: "active",
  })
    .sort({ rollNumber: -1 })
    .select("rollNumber");

  return highestRolled?.rollNumber ? highestRolled.rollNumber + 1 : 1;
}

// Re-sorts an entire class+section+academicYear group alphabetically by
// studentName and renumbers everyone 1, 2, 3... This is meant to be run
// deliberately (e.g. at the start of a new academic year), NOT automatically.
export async function resortRollNumbers(classValue, section, academicYear) {
  const students = await Student.find({
    class: classValue,
    section: section ?? null,
    academicYear,
    status: "active",
  }).sort({ studentName: 1 });

  for (let i = 0; i < students.length; i++) {
    students[i].rollNumber = i + 1;
  }
  await Promise.all(students.map((student) => student.save()));

  return students;
}

// Creates the permanent Student record from an approved Registration.
// Called by registration.service.js — a registration is never turned into
// a student more than once (that check lives in registration.service.js).
export async function createStudentFromRegistration(registration) {
  const admissionNumber = await getNextSequence("admissionNumber");
  const academicYear = getCurrentAcademicYear();

  // A brand-new approval is always treated as a mid-session joiner: it gets
  // appended after the current highest roll number instead of triggering a
  // full re-sort of the class.
  const rollNumber = await getNextRollNumberForJoiner(registration.class, null, academicYear);

  const student = new Student({
    studentNewOld: registration.studentNewOld,
    class: registration.class,
    studentName: registration.studentName,
    dateOfBirth: registration.dateOfBirth,
    dobInWords: registration.dobInWords,
    gender: registration.gender,
    category: registration.category,
    smsContactNo: registration.smsContactNo,

    dateOfAdmission: registration.dateOfAdmission,
    admissionType: registration.admissionType,
    admissionScheme: registration.admissionScheme,
    feeCategory: registration.feeCategory,

    fatherName: registration.fatherName,
    motherName: registration.motherName,
    fatherContact1: registration.fatherContact1,
    fatherContact2: registration.fatherContact2,

    studentAddress: registration.studentAddress,
    villageCity: registration.villageCity,
    block: registration.block,
    district: registration.district,
    state: registration.state,
    pincode: registration.pincode,
    landmark: registration.landmark,

    studentPhoto: registration.studentPhoto,
    fatherPhoto: registration.fatherPhoto,
    motherPhoto: registration.motherPhoto,

    bus: registration.bus,
    hostel: registration.hostel,
    library: registration.library,

    siblingOf: registration.siblingOf,
    aadhaarNumber: registration.aadhaarNumber,

    admissionNumber,
    academicYear,
    section: null, // assigned later by Management once classes are finalized
    rollNumber,
    sourceRegistration: registration._id,
  });

  await student.save();
  return student;
}

// Lists students. Defaults to "active" students only — pass status="all" to
// see inactive/transferred students too.
export async function listStudents({ class: classValue, section, status }) {
  const query = {};
  if (classValue) query.class = classValue;
  if (section) query.section = section;

  const effectiveStatus = status || "active";
  if (effectiveStatus !== "all") query.status = effectiveStatus;

  // aadhaarNumber is excluded automatically here because the schema marks it
  // "select: false".
  return Student.find(query).sort({ class: 1, section: 1, rollNumber: 1 });
}

// Loads a single student INCLUDING aadhaarNumber. This is more sensitive
// than the list view, so once roles/permissions exist (a future phase),
// access to this field on this route should be permission-gated rather than
// open to anyone who can view a student.
export async function getStudentById(id) {
  const student = await Student.findById(id).select("+aadhaarNumber");
  if (!student) throw notFoundError("Student not found.");
  return student;
}

// Edits a student's profile/document/sibling info. Status changes go through
// updateStatus() instead, and roll numbers go through the roll-number
// functions above — neither is editable through this generic update.
export async function updateStudent(id, data) {
  const student = await Student.findById(id);
  if (!student) throw notFoundError("Student not found.");

  Object.assign(student, pickEditableFields(data));
  await student.save();
  return student;
}

// Changes a student's status. We never hard-delete a student record — this
// is the only supported way to mark them inactive/transferred.
export async function updateStatus(id, status) {
  const student = await Student.findById(id);
  if (!student) throw notFoundError("Student not found.");

  student.status = status;
  await student.save();
  return student;
}
