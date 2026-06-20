// A clean, printable receipt for one payment. Used right after recording a
// payment (PayFees.jsx) and when viewing one later (PaymentDetail.jsx).
//
// The "Print" button has the "no-print" class, same as the nav bar in
// AdminLayout.jsx — see the @media print rule in index.css, which hides
// anything marked "no-print" (and the nav) so only the receipt itself ends
// up on paper when you actually print.

export default function Receipt({ payment, studentClass }) {
  const isReversal = payment.status === "reversed";

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        {/* Placeholder until the school supplies its real header/logo. */}
        <h2 style={{ margin: 0 }}>[School Name]</h2>
        <p>[School Address]</p>
        <h3>{isReversal ? "Payment Reversal Receipt" : "Fee Payment Receipt"}</h3>
      </div>

      <table style={{ width: "100%", marginBottom: 16 }}>
        <tbody>
          <tr>
            <td>
              <strong>Receipt No.</strong>
            </td>
            <td>{payment.receiptNo}</td>
            <td>
              <strong>Date</strong>
            </td>
            <td>{new Date(payment.createdAt).toLocaleString()}</td>
          </tr>
          <tr>
            <td>
              <strong>Student</strong>
            </td>
            <td>{payment.studentName}</td>
            <td>
              <strong>Class</strong>
            </td>
            <td>{studentClass || "-"}</td>
          </tr>
        </tbody>
      </table>

      <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr>
            <th>Months Covered</th>
          </tr>
        </thead>
        <tbody>
          {payment.monthsCovered.map((month) => (
            <tr key={month}>
              <td>{month}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        <strong>Amount:</strong> {payment.amount}
      </p>
      <p>
        <strong>Payment Mode:</strong> {payment.mode}
      </p>
      <p>
        <strong>Collected By:</strong> {payment.collectedBy}
      </p>

      {isReversal && (
        <p style={{ color: "red" }}>
          <strong>This is a reversal.</strong> It cancels out the original payment. Reason:{" "}
          {payment.reason}
        </p>
      )}

      <button className="no-print" onClick={() => window.print()} style={{ marginTop: 16 }}>
        Print
      </button>
    </div>
  );
}
