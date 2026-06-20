// This file holds all the business logic for payments. This is the most
// money-sensitive file in the project, so it's worth explaining the
// approach up front:
//
// Recording (or reversing) a payment touches MULTIPLE documents at once —
// the Payment itself, several FeeDue documents, and a Counter for the
// receipt number — and ALL of them need to succeed together or not at all.
// If we updated them one at a time and something failed halfway through
// (a crash, a network blip, two people paying the same due at once), we
// could end up with a Payment that exists but didn't actually mark its
// dues as paid, or a receipt number that got "used up" without a payment
// to match it.
//
// To prevent that, both recordPayment() and reversePayment() run inside a
// MongoDB transaction (via a Mongoose session): everything inside either
// succeeds together, or — if anything goes wrong, including another
// request claiming the same due first — NONE of it happens, as if it was
// never attempted. No other module in this project needed this, because no
// other module has this "several documents must change together, or not
// at all" requirement.

import mongoose from "mongoose";
import Payment from "./payment.model.js";
import FeeDue from "../feeDues/feeDue.model.js";
import { getNextSequence } from "../../core/services/counter.service.js";

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

// Records a payment covering one or more of a student's unpaid dues.
// Rejects the whole thing if ANY of the specified dues is already paid —
// this is "full payment only", there's no partial-amount concept here.
export async function recordPayment({ studentId, dueIds, mode, collectedBy }) {
  const session = await mongoose.startSession();
  let payment;

  try {
    await session.withTransaction(async () => {
      // Load exactly the dues that were asked for, AND belong to this
      // student. If any requested id doesn't show up here (wrong student,
      // typo, already deleted — though dues are never deleted — etc.), the
      // lengths won't match and we reject the whole request.
      const dues = await FeeDue.find({ _id: { $in: dueIds }, student: studentId }).session(session);

      if (dues.length !== dueIds.length) {
        throw notFoundError("One or more of the specified dues could not be found for this student.");
      }

      const alreadyPaid = dues.filter((due) => due.status !== "unpaid");
      if (alreadyPaid.length > 0) {
        throw conflictError(
          `These months are already paid and cannot be paid again: ${alreadyPaid
            .map((due) => due.monthLabel)
            .join(", ")}.`
        );
      }

      // Claim every due FIRST, before creating the payment or spending a
      // receipt number. Each update only succeeds if the due is STILL
      // "unpaid" at the exact moment it runs — this is the check-and-set
      // that makes it impossible for the same due to be paid twice, even if
      // two payment requests for it land at the same instant. If even one
      // due can't be claimed (someone else just paid it), we throw, and the
      // transaction rolls back every claim we already made in this loop —
      // nothing is left half-paid.
      for (const due of dues) {
        const result = await FeeDue.updateOne(
          { _id: due._id, status: "unpaid" },
          { $set: { status: "paid" } }, // paidByPayment gets filled in once we know the payment's _id, below
          { session }
        );
        if (result.modifiedCount !== 1) {
          throw conflictError(
            `The due for ${due.monthLabel} was just paid by someone else. Please try again.`
          );
        }
      }

      const amount = dues.reduce((sum, due) => sum + due.amount, 0);
      const monthsCovered = dues.map((due) => due.monthLabel);

      // The receipt number is allocated INSIDE this transaction (note the
      // session is passed through) so that if anything above gets rolled
      // back, this increment rolls back with it — no gaps in the sequence.
      const receiptNo = await getNextSequence("receiptNo", { session });

      payment = new Payment({
        receiptNo,
        student: studentId,
        studentName: dues[0].studentName,
        dues: dueIds,
        monthsCovered,
        amount,
        mode,
        collectedBy,
        status: "success",
      });
      await payment.save({ session });

      // Now that the payment has an _id, point each claimed due at it.
      await FeeDue.updateMany(
        { _id: { $in: dueIds } },
        { $set: { paidByPayment: payment._id } },
        { session }
      );
    });

    return payment;
  } finally {
    await session.endSession();
  }
}

// Reverses a payment: creates a NEW Payment record (status "reversed") that
// cancels the original out, links the two together, and flips the dues the
// original covered back to unpaid so they can be paid again correctly.
// The original payment is never edited or deleted — only its
// reversedByPayment link is set, which is just bookkeeping, not a change to
// what actually happened.
export async function reversePayment(paymentId, reason) {
  const session = await mongoose.startSession();
  let reversal;

  try {
    await session.withTransaction(async () => {
      const original = await Payment.findById(paymentId).session(session);
      if (!original) throw notFoundError("Payment not found.");

      if (original.status === "reversed") {
        throw conflictError("A reversal entry cannot itself be reversed.");
      }
      if (original.reversedByPayment) {
        throw conflictError("This payment has already been reversed.");
      }

      const receiptNo = await getNextSequence("receiptNo", { session });

      reversal = new Payment({
        receiptNo,
        student: original.student,
        studentName: original.studentName,
        dues: original.dues,
        monthsCovered: original.monthsCovered,
        amount: -original.amount, // negative, so it's unmistakable in any list/total
        mode: original.mode,
        collectedBy: original.collectedBy,
        status: "reversed",
        reversalOf: original._id,
        reason,
      });
      await reversal.save({ session });

      original.reversedByPayment = reversal._id;
      await original.save({ session });

      // Flip the covered dues back to unpaid so they show up as owed again.
      await FeeDue.updateMany(
        { _id: { $in: original.dues } },
        { $set: { status: "unpaid", paidByPayment: null } },
        { session }
      );
    });

    return reversal;
  } finally {
    await session.endSession();
  }
}

// Lists payments, optionally filtered by student/mode/status and a
// createdAt date range (from/to, both optional, inclusive).
export async function listPayments({ student, mode, status, from, to }) {
  const query = {};
  if (student) query.student = student;
  if (mode) query.mode = mode;
  if (status) query.status = status;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  return Payment.find(query).sort({ receiptNo: -1 });
}

export async function getPaymentById(id) {
  const payment = await Payment.findById(id);
  if (!payment) throw notFoundError("Payment not found.");
  return payment;
}
