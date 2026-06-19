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
export async function getNextSequence(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return counter.value;
}
