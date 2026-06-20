// A plain table for displaying a list of FeeDues. Shared by the Unpaid,
// Paid, and Overdue screens so the column layout only has to be written
// once. Pass showReceiptLink={true} (used by the Paid list) to add a column
// linking to the payment that covered each due.

import { Link } from "react-router-dom";

export default function DuesTable({ dues, showReceiptLink = false }) {
  if (dues.length === 0) {
    return <p>No dues to show here.</p>;
  }

  return (
    <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Student</th>
          <th>Class</th>
          <th>Month</th>
          <th>Amount</th>
          <th>Due Date</th>
          <th>Status</th>
          {showReceiptLink && <th></th>}
        </tr>
      </thead>
      <tbody>
        {dues.map((due) => (
          <tr key={due._id}>
            <td>{due.studentName}</td>
            <td>{due.className}</td>
            <td>{due.monthLabel}</td>
            <td>{due.amount}</td>
            <td>{due.dueDate?.slice(0, 10)}</td>
            <td>{due.status}</td>
            {showReceiptLink && (
              <td>
                {due.paidByPayment && (
                  <Link to={`/admin/fees/payments/${due.paidByPayment}`}>View Receipt</Link>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
