// This file defines what a "Staff" member looks like in the database.
// Staff covers teachers, drivers, office staff, and other school employees.
// The "staffType" field is what lets future modules (a teacher-only
// timetable, a driver-only vehicle log, etc.) tell different kinds of staff
// apart.

import mongoose from "mongoose";

// A small sub-schema just for salary numbers. Kept separate (with its own
// "_id: false") so it behaves as a single embedded object, e.g.
// { basic: 20000, allowances: 2000, deductions: 500 } — not a list.
const salarySchema = new mongoose.Schema(
  {
    basic: { type: Number },
    allowances: { type: Number },
    deductions: { type: Number },
  },
  { _id: false }
);

const staffSchema = new mongoose.Schema(
  {
    // Auto-generated, permanent, unique ID — handed out by the same Counter
    // service used for registrationNo/admissionNumber, with its own sequence.
    employeeId: { type: Number, required: true, unique: true },

    employeeName: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date },

    email: { type: String, required: true },
    contactNo1: { type: String, required: true },
    contactNo2: { type: String },
    whatsappNo: { type: String },

    category: { type: String },
    religion: { type: String },
    bloodGroup: { type: String },

    department: { type: String },
    designation: { type: String },

    medium: { type: String, required: true, enum: ["Hindi", "English", "Both"] },

    // Distinguishes a teacher from a driver/office/admin/other staff member.
    // Future modules (timetables, vehicle logs, payroll rules, etc.) will
    // filter on this instead of guessing from "designation".
    staffType: {
      type: String,
      required: true,
      enum: ["teaching", "driver", "office", "admin", "other"],
    },

    joiningDate: { type: Date },

    // SENSITIVE: salary details. "select: false" means a normal query will
    // NOT return this field unless explicitly asked for with
    // .select("+salary"). Once roles/permissions exist (a future phase),
    // reading this should be gated to people actually allowed to see payroll.
    // This is just reserving the shape for now — no payroll logic yet.
    salary: { type: salarySchema, select: false },

    // Whether this staff member should receive system messages/alerts.
    checkForMessage: { type: Boolean, default: false },

    // Staff are never hard-deleted from the database — this status is how
    // we mark someone as no longer working here.
    status: { type: String, enum: ["active", "resigned"], default: "active" },

    // Reserved for a future login account. There is no auth system yet, but
    // when one is built, a staff member's User account will be linked here.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
