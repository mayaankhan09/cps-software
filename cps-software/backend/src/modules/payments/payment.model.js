// This file defines what a "Payment" looks like in the database.
// Payments are PERMANENT records — once created, a payment is never edited
// or deleted. If a payment needs to be corrected (e.g. it was a mistake),
// that's done by REVERSING it: a brand new Payment record is created that
// cancels it out, and the original stays exactly as it was, for the audit
// trail. See payment.service.js for how recordPayment/reversePayment work.

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Gap-free sequential receipt number, handed out by the same Counter
    // pattern used for registrationNo/admissionNumber/employeeId.
    receiptNo: { type: Number, required: true, unique: true },

    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true },

    // The specific FeeDue documents this payment covers (one payment can
    // pay off several months at once).
    dues: [{ type: mongoose.Schema.Types.ObjectId, ref: "FeeDue" }],
    // Denormalized copy of which months those dues were for, so a receipt
    // can be displayed/printed without a separate lookup.
    monthsCovered: [{ type: String }],

    // The total amount collected — the sum of the covered dues' amounts.
    // On a reversal entry, this is the negative of the original amount.
    amount: { type: Number, required: true },

    mode: { type: String, enum: ["cash", "upi", "card", "cheque", "bank"], required: true },

    // Just a name for now — there's no login/user system yet. Once one
    // exists, this should become a reference to whichever staff user
    // actually took the payment, instead of free text.
    collectedBy: { type: String, required: true },

    status: { type: String, enum: ["success", "reversed"], default: "success" },

    // Set ONLY on a reversal entry: points back at the original payment
    // this entry is cancelling out.
    reversalOf: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
    // Set ONLY on the original payment once it has been reversed: points
    // at the reversal entry that cancelled it. We still set this one field
    // on the original (that's just bookkeeping/linkage) — but we never
    // touch its amount, dues, mode, or any other field describing what
    // actually happened, so its financial history stays accurate.
    reversedByPayment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },

    // Only meaningful on a reversal entry — explains why the original
    // payment was reversed. Required when reversing (see payment.validation.js).
    reason: { type: String, default: null },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
