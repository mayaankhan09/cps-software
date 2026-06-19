// This file defines what a "Registration" looks like in the database.
// A Registration is a student's APPLICATION to join the school. It is kept
// separate from the real Student record until Management approves it — see
// registration.service.js for how an approved registration becomes a Student.

import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    // Auto-generated sequential number handed out by the Counter service.
    // We never calculate this from _id or array length, because that can
    // produce duplicate or wrong numbers if documents are deleted or two
    // requests happen at the same time.
    registrationNo: { type: Number, required: true, unique: true },

    studentNewOld: { type: String, enum: ["New", "Old"] },
    class: { type: String },
    studentName: { type: String, required: true },

    fatherName: { type: String },
    motherName: { type: String },
    fatherContact1: { type: String, required: true },
    fatherContact2: { type: String },

    dateOfBirth: { type: Date, required: true },
    // Auto-filled from dateOfBirth when the registration is created or its
    // dateOfBirth is edited — see dateToWords.util.js. Example output:
    // "Twentieth June Two Thousand Ten".
    dobInWords: { type: String },
    gender: { type: String },

    dateOfAdmission: { type: Date },
    admissionType: { type: String },
    admissionScheme: { type: String }, // e.g. "NON-RTE" or "RTE"
    feeCategory: { type: String }, // e.g. "CBSE BOARD" or "CG STATE BOARD"

    registrationFees: { type: Number },
    paymentMode: { type: String },

    smsContactNo: { type: String },

    // SENSITIVE: this is a government ID number. It must NEVER be shown in
    // list views, included in logs, or returned by default. "select: false"
    // means a query has to explicitly ask for this field (.select("+aadhaarNumber"))
    // before Mongoose will include it.
    aadhaarNumber: { type: String, select: false },

    category: { type: String, enum: ["General", "OBC", "SC", "ST"] },

    studentAddress: { type: String },
    villageCity: { type: String },
    block: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },
    landmark: { type: String },

    // Services the family has opted into.
    bus: { type: Boolean, default: false },
    hostel: { type: Boolean, default: false },
    library: { type: Boolean, default: false },

    // Stored as file paths/URLs for now — actual file upload handling is not
    // part of this phase.
    studentPhoto: { type: String },
    fatherPhoto: { type: String },
    motherPhoto: { type: String },

    remark1: { type: String },
    remark2: { type: String },
    remark3: { type: String },
    remark4: { type: String },

    // Optional link to an existing Student, used to connect siblings already
    // studying at the school.
    siblingOf: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },

    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

    // Filled in only once this registration is approved — points at the
    // Student record this registration turned into.
    convertedToStudent: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
  },
  { timestamps: true }
);

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
