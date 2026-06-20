// Screen: Payment Detail / Receipt.
// Shows the printable receipt for one payment (see Receipt.jsx), plus a
// "Reverse This Payment" control when it's still reversible. Reversing
// never edits or deletes the original — it creates a new linked payment
// record, exactly like the backend's payment.service.js describes.

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPayment, getStudent, reversePayment } from "../../../shared/api.js";
import { LabeledTextarea } from "../../../shared/FormFields.jsx";
import Receipt from "./Receipt.jsx";

export default function PaymentDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const {
    data: payment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPayment(id),
  });

  // The payment itself doesn't store the student's class, so we fetch the
  // student separately just to show it on the receipt.
  const studentQuery = useQuery({
    queryKey: ["student-for-receipt", payment?.student],
    queryFn: () => getStudent(payment.student),
    enabled: !!payment,
  });

  const reverseMutation = useMutation({
    mutationFn: () => reversePayment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p style={{ color: "red" }}>Could not load payment: {error.message}</p>;

  // Matches the backend's own rule: a reversal entry can't be reversed, and
  // a payment that's already been reversed can't be reversed again.
  const canReverse = payment.status === "success" && !payment.reversedByPayment;

  function handleReverseSubmit(event) {
    event.preventDefault();
    reverseMutation.mutate();
  }

  return (
    <div>
      <p className="no-print">
        <Link to="/admin/fees/payments">&larr; Back to Payments</Link>
      </p>

      <Receipt payment={payment} studentClass={studentQuery.data?.class} />

      {payment.reversedByPayment && (
        <p className="no-print">
          This payment has been reversed —{" "}
          <Link to={`/admin/fees/payments/${payment.reversedByPayment}`}>view the reversal receipt</Link>.
        </p>
      )}

      {canReverse && (
        <fieldset className="no-print" style={{ marginTop: 16 }}>
          <legend>Reverse This Payment</legend>
          {reverseMutation.isError && (
            <p style={{ color: "red" }}>Could not reverse: {reverseMutation.error.message}</p>
          )}
          <form onSubmit={handleReverseSubmit}>
            <LabeledTextarea
              label="Reason *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <button type="submit" disabled={reverseMutation.isPending}>
              {reverseMutation.isPending ? "Reversing..." : "Reverse Payment"}
            </button>
          </form>
        </fieldset>
      )}
    </div>
  );
}
