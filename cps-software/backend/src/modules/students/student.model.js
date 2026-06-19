// This file defines what a "Student" looks like in the database.
// A Student is created FROM an approved Registration (see
// registration.service.js and student.service.js). Once it exists, the
// Student record is the single source of truth for that child — the original
// registration is frozen and never edited again.

import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // --- Personal info (copied from the registration at approval time) ---
    studentNewOld: { type: String, enum: ["New", "Old"] },
    class: { type: String },
    studentName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    dobInWords: { type: String },
    gender: { type: String },
    category: { type: String, enum: ["General", "OBC", "SC", "ST"] },
    smsContactNo: { type: String },

    // --- Admission details (copied from the registration at approval time) ---
    dateOfAdmission: { type: Date },
    admissionType: { type: String },
    admissionScheme: { type: String }, // e.g. "NON-RTE" or "RTE"
    feeCategory: { type: String }, // e.g. "CBSE BOARD" or "CG STATE BOARD"

    // --- Parent info ---
    fatherName: { type: String },
    motherName: { type: String },
    fatherContact1: { type: String, required: true },
    fatherContact2: { type: String },

    // --- Address info ---
    studentAddress: { type: String },
    villageCity: { type: String },
    block: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },
    landmark: { type: String },

    // --- Photos (stored as file paths/URLs for now) ---
    studentPhoto: { type: String },
    fatherPhoto: { type: String },
    motherPhoto: { type: String },

    // --- Services opted for ---
    bus: { type: Boolean, default: false },
    hostel: { type: Boolean, default: false },
    library: { type: Boolean, default: false },

    // Optional link to another Student, used to connect siblings together.
    siblingOf: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },

    // SENSITIVE: same rule as on the Registration model — this is a
    // government ID number. It must NEVER be shown in list views or logs,
    // and "select: false" means a query has to explicitly ask for it.
    aadhaarNumber: { type: String, select: false },

    // --- Fields that only exist once a registration becomes a real student ---

    // Auto-generated, permanent, unique ID — assigned once at approval and
    // never reused, even if the student later becomes inactive.
    admissionNumber: { type: Number, required: true, unique: true },

    // e.g. "2025-26". Set automatically at approval time (see student.service.js).
    academicYear: { type: String, required: true },

    // Can be assigned/changed later by Management once classes are finalized.
    section: { type: String, default: null },

    // See student.service.js for the rules on how this number is assigned.
    rollNumber: { type: Number },

    // Points back at the registration this student was created from.
    sourceRegistration: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },

    // Students are never hard-deleted from the database — this status is how
    // we mark them as no longer currently studying here.
    status: { type: String, enum: ["active", "inactive", "transferred"], default: "active" },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
