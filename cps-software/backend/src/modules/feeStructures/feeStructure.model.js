// This file defines what a "FeeStructure" looks like in the database.
// A FeeStructure says: "for this class, in this academic year, here is the
// list of fee components families owe (and when)." Other modules (dues
// generation, payments, overdue lists — all built in later phases) will
// read from this instead of having fee amounts hardcoded anywhere.

import mongoose from "mongoose";

// One fee component, e.g. { name: "Tuition", amount: 1200, frequency: "monthly" }.
// Today there is usually just one component (Tuition), but modeling it as a
// list means transport/library/exam fees etc. can be added later as more
// entries, without changing the shape of a FeeStructure itself.
const componentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    // Free text on purpose (e.g. "monthly", "yearly", "one-time") so new
    // frequencies can be introduced later without a schema change. The one
    // frequency the system currently does something special with is
    // "monthly" — see monthlyTotal below.
    frequency: { type: String, required: true },
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
  {
    // e.g. "2026-27".
    academicYear: { type: String, required: true },

    // e.g. "Class 10". Plain text to match how classes are referred to
    // elsewhere in this project (Student.class is also a free-text string).
    className: { type: String, required: true },

    // Which board this fee applies to. Left null on purpose for most
    // schools today — null means "applies to every board for this class".
    // Later, if the school needs different amounts per board, they can add
    // a second FeeStructure for the same class/year with board set to
    // "CBSE" or "CG_STATE" instead of null.
    // "null" is listed inside the enum array on purpose — Mongoose's enum
    // validator otherwise rejects null even though it's our default value.
    board: { type: String, enum: ["CBSE", "CG_STATE", null], default: null },

    components: {
      type: [componentSchema],
      // At least one component is required — see feeStructure.validation.js
      // for the actual check (kept there so the error message is clear).
      default: [],
    },

    // A convenience number = the sum of every component whose frequency is
    // "monthly". This is recalculated by feeStructure.service.js whenever
    // components are set or changed, so other modules (like a future "what
    // does this class owe this month" report) can just read this field
    // instead of re-summing the components list every time.
    monthlyTotal: { type: Number, default: 0 },

    // The day of the month by which that month's fee is due, e.g. 10 means
    // "due by the 10th". This is what a future overdue-fees job will use to
    // decide whether a month's dues are late yet.
    dueDayOfMonth: { type: Number },

    // Fee structures are never hard-deleted — past dues may reference one,
    // so deactivating (instead of deleting) keeps that history intact.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// A class can only have ONE fee structure per academic year per board value
// (including one per class/year where board is null, meaning "all boards").
// This stops two conflicting structures from accidentally being created for
// the same class/year/board combination.
feeStructureSchema.index({ className: 1, academicYear: 1, board: 1 }, { unique: true });

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);

export default FeeStructure;
