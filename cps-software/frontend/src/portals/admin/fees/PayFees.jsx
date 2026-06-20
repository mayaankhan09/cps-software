// Screen: Pay Fees — the school's actual "collect a payment" flow:
// pick a student -> see what they owe -> tick the months being paid ->
// choose how it was paid -> get a receipt.

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getStudentDues, getStudents, recordPayment } from "../../../shared/api.js";
import { LabeledInput, LabeledSelect } from "../../../shared/FormFields.jsx";
import Receipt from "./Receipt.jsx";

export default function PayFees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedDueIds, setSelectedDueIds] = useState([]);
  const [mode, setMode] = useState("");
  const [collectedBy, setCollectedBy] = useState("");

  const studentsQuery = useQuery({
    queryKey: ["students-for-pay-fees"],
    queryFn: () => getStudents({ status: "active" }),
  });

  const duesQuery = useQuery({
    queryKey: ["student-dues", selectedStudentId],
    queryFn: () => getStudentDues(selectedStudentId),
    enabled: !!selectedStudentId,
  });

  const paymentMutation = useMutation({
    mutationFn: recordPayment,
  });

  const allStudents = studentsQuery.data || [];
  const filteredStudents = allStudents.filter((student) =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedStudent = allStudents.find((student) => student._id === selectedStudentId);
  const dues = duesQuery.data || [];
  const selectedDues = dues.filter((due) => selectedDueIds.includes(due._id));
  const totalAmount = selectedDues.reduce((sum, due) => sum + due.amount, 0);

  function handleSelectStudent(event) {
    setSelectedStudentId(event.target.value);
    setSelectedDueIds([]);
  }

  function toggleDue(dueId) {
    setSelectedDueIds((previous) =>
      previous.includes(dueId) ? previous.filter((id) => id !== dueId) : [...previous, dueId]
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    paymentMutation.mutate({ studentId: selectedStudentId, dueIds: selectedDueIds, mode, collectedBy });
  }

  function handlePayAnother() {
    setSelectedStudentId("");
    setSelectedDueIds([]);
    setMode("");
    setCollectedBy("");
    setSearchTerm("");
    paymentMutation.reset();
  }

  // After a successful payment, show the receipt instead of the form.
  if (paymentMutation.isSuccess) {
    return (
      <div>
        <h2 className="no-print">Payment Recorded</h2>
        <Receipt payment={paymentMutation.data} studentClass={selectedStudent?.class} />
        <p className="no-print">
          <button onClick={handlePayAnother}>Pay Fees for Another Student</button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2>Pay Fees</h2>

      <LabeledInput
        label="Search Student by Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {studentsQuery.isLoading && <p>Loading students...</p>}
      {studentsQuery.isError && (
        <p style={{ color: "red" }}>Could not load students: {studentsQuery.error.message}</p>
      )}

      {studentsQuery.data && (
        // A plain <select>, not the shared LabeledSelect, because here the
        // dropdown VALUE (student id) needs to be different from what's
        // DISPLAYED (name + class) — LabeledSelect only supports options
        // that are their own label.
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ display: "block", fontSize: 13 }}>Select Student</span>
          <select
            value={selectedStudentId}
            onChange={handleSelectStudent}
            style={{ display: "block", width: "100%", padding: 4 }}
          >
            <option value="">-- select --</option>
            {filteredStudents.map((student) => (
              <option key={student._id} value={student._id}>
                {student.studentName} - {student.class} (Admission #{student.admissionNumber})
              </option>
            ))}
          </select>
        </label>
      )}

      {selectedStudentId && (
        <div style={{ marginBottom: 16 }}>
          <h3>Dues for {selectedStudent?.studentName}</h3>

          {duesQuery.isLoading && <p>Loading dues...</p>}
          {duesQuery.isError && (
            <p style={{ color: "red" }}>Could not load dues: {duesQuery.error.message}</p>
          )}
          {duesQuery.data && dues.length === 0 && <p>This student has no fee dues generated yet.</p>}

          {duesQuery.data && dues.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {dues.map((due) => (
                <li key={due._id} style={{ marginBottom: 6 }}>
                  <label>
                    <input
                      type="checkbox"
                      disabled={due.status !== "unpaid"}
                      checked={selectedDueIds.includes(due._id)}
                      onChange={() => toggleDue(due._id)}
                    />{" "}
                    {due.monthLabel} — {due.amount}
                    {due.status !== "unpaid" && " (already paid)"}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedDueIds.length > 0 && (
        <form onSubmit={handleSubmit}>
          <p>
            Paying for: {selectedDues.map((due) => due.monthLabel).join(", ")}
            <br />
            <strong>Total: {totalAmount}</strong>
          </p>

          <LabeledSelect
            label="Payment Mode *"
            options={["cash", "upi", "card", "cheque", "bank"]}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            required
          />
          <LabeledInput
            label="Collected By *"
            value={collectedBy}
            onChange={(e) => setCollectedBy(e.target.value)}
            required
          />

          {paymentMutation.isError && (
            <p style={{ color: "red" }}>Could not record payment: {paymentMutation.error.message}</p>
          )}

          <button type="submit" disabled={paymentMutation.isPending}>
            {paymentMutation.isPending ? "Recording Payment..." : `Pay ${totalAmount}`}
          </button>
        </form>
      )}
    </div>
  );
}
