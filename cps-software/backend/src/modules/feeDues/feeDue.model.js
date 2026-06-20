// This file defines what a "FeeDue" looks like in the database.
// A FeeDue is one month's fee owed by one student — e.g. "Aarav Mehta owes
// 1000 for April 2026". Dues are generated automatically (see
// feeDue.service.js) from each student's class's FeeStructure. Once a due
// is generated, its amount is frozen — even if the FeeStructure changes
// later, this due keeps the amount it was created with.

import mongoose from "mongoose";

const feeDueSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    // Copied from the student at generation time, purely so a dues list can
    // show a name without a separate lookup for every row.
    studentName: { type: String, required: true },
    className: { type: String, required: true },
    academicYear: { type: String, required: true },

    // "2026-04" — sortable and easy to compare/filter by.
    month: { type: String, required: true },
    // "April 2026" — for display, so screens don't have to reformat "month".
    monthLabel: { type: String, required: true },

    // Copied from the FeeStructure's monthlyTotal AT THE MOMENT this due was
    // generated. If the school changes the fee later, this due keeps its
    // original amount — only dues generated after the change will use it.
    amount: { type: Number, required: true },

    // The day this month's fee is due by, calculated from the FeeStructure's
    // dueDayOfMonth at generation time. This is what the overdue list
    // (GET /api/fee-dues/overdue) compares against today's date.
    dueDate: { type: Date, required: true },

    status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },

    // Set once this due is paid — points at the Payment that covered it.
    // Cleared back to null if that payment is later reversed.
    paidByPayment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  },
  { timestamps: true }
);

// A student can never have two dues for the same month. This is what makes
// generateMonthlyDues() safe to run more than once (or even twice at the
// exact same time) without ever double-charging anyone — MongoDB itself
// rejects the second attempt, rather than us having to check first and
// hope nothing else runs in between.
feeDueSchema.index({ student: 1, month: 1 }, { unique: true });

const FeeDue = mongoose.model("FeeDue", feeDueSchema);

export default FeeDue;
