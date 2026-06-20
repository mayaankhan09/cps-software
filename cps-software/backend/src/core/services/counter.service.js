// This file hands out the "next number" for a named sequence (like
// registrationNo or admissionNumber) in a way that is safe even if two
// requests arrive at the exact same instant.
//
// We do this with ONE atomic database update ($inc) instead of the unsafe
// pattern of "read the current number, add one in our code, save it back" —
// that unsafe pattern can let two requests both read the same number before
// either one saves, producing duplicate numbers.

import Counter from "./counter.model.js";

// Returns the next number for the given sequence name, creating the counter
// (starting at 1) the first time it is used.
//
// Optionally takes a Mongoose transaction session. This matters for receipt
// numbers (see payment.service.js): if a payment is created inside a
// transaction and that transaction later gets rolled back, we want the
// counter increment to roll back too — otherwise that number would be
// "burned" and never used, leaving a gap in an otherwise gap-free sequence.
export async function getNextSequence(sequenceName, { session } = {}) {
  const counter = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { value: 1 } },
    { new: true, upsert: true, session }
  );

  return counter.value;
}
