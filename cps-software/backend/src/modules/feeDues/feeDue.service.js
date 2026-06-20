// This file holds all the business logic for fee dues: generating a
// month's dues for every active student, and the various ways of listing
// them (all, unpaid, paid, overdue, or for one student).

import FeeDue from "./feeDue.model.js";
import Student from "../students/student.model.js";
import FeeStructure from "../feeStructures/feeStructure.model.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "2026-04" -> "April 2026".
function formatMonthLabel(month) {
  const [year, monthNum] = month.split("-").map(Number);
  return `${MONTH_NAMES[monthNum - 1]} ${year}`;
}

// Returns today's month as "YYYY-MM" — used by the scheduled job so it
// always generates dues for the month it's actually running in.
export function getCurrentMonthString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Works out the actual due date for a month from the FeeStructure's
// dueDayOfMonth, e.g. month "2026-02" + dueDayOfMonth 31 -> Feb 28 (clamped
// to the real last day of that month, since February never has 31 days).
function calculateDueDate(month, dueDayOfMonth) {
  const [year, monthNum] = month.split("-").map(Number);
  const lastDayOfMonth = new Date(year, monthNum, 0).getDate(); // day 0 of next month = last day of this one
  const day = Math.min(dueDayOfMonth || 10, lastDayOfMonth);
  return new Date(year, monthNum - 1, day);
}

// Generates one month's FeeDue for every ACTIVE student, based on their
// class's FeeStructure. Safe to run more than once for the same month —
// see the unique index on FeeDue (student + month) in feeDue.model.js,
// which is what actually guarantees no student is ever double-charged,
// even if this function somehow ran twice at the exact same moment.
//
// NOTE: for now this looks up the board-agnostic (board: null) FeeStructure
// for the student's class, since Student doesn't have its own "board" field
// yet — see the comment on FeeStructure.board for why that's fine today.
export async function generateMonthlyDues(academicYear, month) {
  const monthLabel = formatMonthLabel(month);
  const activeStudents = await Student.find({ academicYear, status: "active" });

  let created = 0;
  let skippedAlreadyExists = 0;
  let skippedNoFeeStructure = 0;

  for (const student of activeStudents) {
    const feeStructure = await FeeStructure.findOne({
      className: student.class,
      academicYear,
      board: null,
      isActive: true,
    });

    if (!feeStructure) {
      skippedNoFeeStructure += 1;
      continue;
    }

    try {
      await FeeDue.create({
        student: student._id,
        studentName: student.studentName,
        className: student.class,
        academicYear,
        month,
        monthLabel,
        amount: feeStructure.monthlyTotal,
        dueDate: calculateDueDate(month, feeStructure.dueDayOfMonth),
      });
      created += 1;
    } catch (error) {
      // The unique index on {student, month} is what actually enforces
      // idempotency. If a due already exists, MongoDB rejects this insert
      // with code 11000 — we just count that as "already covered" instead
      // of treating it as a real error.
      if (error.code === 11000) {
        skippedAlreadyExists += 1;
      } else {
        throw error;
      }
    }
  }

  const skipped = skippedAlreadyExists + skippedNoFeeStructure;

  console.log(
    `[generateMonthlyDues] ${monthLabel}: created ${created}, skipped ${skipped} ` +
      `(already existed: ${skippedAlreadyExists}, no fee structure: ${skippedNoFeeStructure})`
  );

  return {
    academicYear,
    month,
    monthLabel,
    studentsProcessed: activeStudents.length,
    created,
    skipped,
    skippedAlreadyExists,
    skippedNoFeeStructure,
  };
}

// Lists dues, optionally filtered by any combination of status/className/
// month/student.
export async function listFeeDues({ status, className, month, student }) {
  const query = {};
  if (status) query.status = status;
  if (className) query.className = className;
  if (month) query.month = month;
  if (student) query.student = student;

  return FeeDue.find(query).sort({ month: 1, studentName: 1 });
}

// Dues that are still unpaid AND past their due date — the actual
// "overdue" list. (An unpaid due that isn't past its due date yet is just
// "upcoming", not overdue.)
export async function listOverdueDues() {
  return FeeDue.find({ status: "unpaid", dueDate: { $lt: new Date() } }).sort({ dueDate: 1 });
}

// All dues for one student, oldest month first — what a "pay fees" screen
// would show to let someone pick which unpaid months to pay.
export async function listDuesForStudent(studentId) {
  return FeeDue.find({ student: studentId }).sort({ month: 1 });
}
