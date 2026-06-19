// This file defines the "Counter" collection in MongoDB.
// We use a Counter to hand out gap-free, sequential numbers (like registration
// numbers or admission numbers) one at a time, even if many requests come in
// at the same moment. Each counter is identified by a "name" (e.g. "registrationNo")
// and just remembers the last number it gave out.

import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  // The name of the sequence, e.g. "registrationNo" or "admissionNumber".
  name: { type: String, required: true, unique: true },
  // The last number that was handed out for this sequence.
  value: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
