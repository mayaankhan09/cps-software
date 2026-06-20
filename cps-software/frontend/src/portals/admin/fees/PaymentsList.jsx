// Screen: Payments / Receipts list.
// Reversed payments are shown clearly marked (status column + a strikethrough
// on the amount) — but they're never hidden or removed, since the original
// payment is always preserved.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPayments } from "../../../shared/api.js";
import { LabeledSelect } from "../../../shared/FormFields.jsx";

export default function PaymentsList() {
  const [filters, setFilters] = useState({ mode: "", status: "" });

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["payments", filters],
    queryFn: () => getPayments(filters),
  });

  return (
    <div>
      <h2>Payments / Receipts</h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 200 }}>
          <LabeledSelect
            label="Mode"
            name="mode"
            options={["cash", "upi", "card", "cheque", "bank"]}
            value={filters.mode}
            onChange={handleFilterChange}
          />
        </div>
        <div style={{ width: 200 }}>
          <LabeledSelect
            label="Status"
            name="status"
            options={["success", "reversed"]}
            value={filters.status}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p style={{ color: "red" }}>Could not load payments: {error.message}</p>}

      {data && (
        data.length === 0 ? (
          <p>No payments match these filters.</p>
        ) : (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Receipt No.</th>
                <th>Student</th>
                <th>Months Covered</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.receiptNo}</td>
                  <td>{payment.studentName}</td>
                  <td>{payment.monthsCovered.join(", ")}</td>
                  <td style={payment.status === "reversed" ? { textDecoration: "line-through" } : undefined}>
                    {payment.amount}
                  </td>
                  <td>{payment.mode}</td>
                  <td>{payment.status}</td>
                  <td>
                    <Link to={`/admin/fees/payments/${payment._id}`}>View Receipt</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
