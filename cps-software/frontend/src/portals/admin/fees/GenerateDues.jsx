// Screen: Generate Dues.
// Lets an admin manually trigger dues generation for a given academic year
// and month, and shows the resulting summary (how many dues were created
// vs. skipped). This is mainly useful for testing or catching up — the
// backend ALSO runs this automatically on the 5th of every month (see
// backend/src/core/jobs/duesJob.js), so this screen isn't normally needed
// for day-to-day use.

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateDues } from "../../../shared/api.js";
import { LabeledInput } from "../../../shared/FormFields.jsx";

export default function GenerateDues() {
  const [academicYear, setAcademicYear] = useState("");
  const [month, setMonth] = useState("");

  const mutation = useMutation({
    mutationFn: generateDues,
  });

  function handleSubmit(event) {
    event.preventDefault();
    mutation.mutate({ academicYear, month });
  }

  return (
    <div>
      <h2>Generate Dues</h2>
      <p>
        Dues are also generated automatically on the 5th of every month — use this screen to
        generate a month's dues manually (e.g. to test, or to catch up if the server was down).
        Running this more than once for the same month is safe: it will never create duplicate
        dues or double-charge anyone.
      </p>

      {mutation.isError && (
        <p style={{ color: "red" }}>Could not generate dues: {mutation.error.message}</p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 16 }}>
        <div style={{ width: 200 }}>
          <LabeledInput
            label="Academic Year (e.g. 2026-27)"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            required
          />
        </div>
        <div style={{ width: 200 }}>
          <LabeledInput
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Generating..." : "Generate Dues"}
        </button>
      </form>

      {mutation.isSuccess && (
        <div>
          <h3>
            Result for {mutation.data.monthLabel} ({mutation.data.academicYear})
          </h3>
          <ul>
            <li>Active students checked: {mutation.data.studentsProcessed}</li>
            <li>New dues created: {mutation.data.created}</li>
            <li>Skipped (already existed): {mutation.data.skippedAlreadyExists}</li>
            <li>Skipped (no fee structure for their class): {mutation.data.skippedNoFeeStructure}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
