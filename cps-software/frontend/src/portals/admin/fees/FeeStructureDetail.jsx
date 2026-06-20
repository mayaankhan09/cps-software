// Screen: Fee Structure Detail.
// View one fee structure, edit it (PUT — monthlyTotal gets recalculated by
// the backend if components changed), and activate/deactivate it. There is
// no delete — a deactivated structure is kept since past dues may
// reference it.

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFeeStructure,
  setFeeStructureStatus,
  updateFeeStructure,
} from "../../../shared/api.js";
import { LabeledSelect } from "../../../shared/FormFields.jsx";
import FeeStructureFields from "./FeeStructureFields.jsx";

function toFormData(feeStructure) {
  return {
    academicYear: feeStructure.academicYear || "",
    className: feeStructure.className || "",
    board: feeStructure.board || "",
    dueDayOfMonth: feeStructure.dueDayOfMonth ?? "",
    components: feeStructure.components.map((component) => ({
      name: component.name || "",
      amount: String(component.amount ?? ""),
      frequency: component.frequency || "",
    })),
  };
}

export default function FeeStructureDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [statusChoice, setStatusChoice] = useState("");

  const {
    data: feeStructure,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["fee-structure", id],
    queryFn: () => getFeeStructure(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateFeeStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structure", id] });
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      setIsEditing(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (isActive) => setFeeStructureStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structure", id] });
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p style={{ color: "red" }}>Could not load fee structure: {error.message}</p>;
  if (!feeStructure) return <p>Fee structure not found.</p>;

  function startEditing() {
    setFormData(toFormData(feeStructure));
    setIsEditing(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  function handleComponentsChange(components) {
    setFormData((previous) => ({ ...previous, components }));
  }

  function handleSaveEdit(event) {
    event.preventDefault();
    updateMutation.mutate({
      ...formData,
      board: formData.board || null,
      dueDayOfMonth: formData.dueDayOfMonth === "" ? undefined : Number(formData.dueDayOfMonth),
      components: formData.components.map((component) => ({
        ...component,
        amount: Number(component.amount),
      })),
    });
  }

  function handleStatusSubmit(event) {
    event.preventDefault();
    if (statusChoice) statusMutation.mutate(statusChoice === "active");
  }

  return (
    <div>
      <p>
        <Link to="/admin/fees/structures">&larr; Back to Fee Structures</Link>
      </p>
      <h2>
        {feeStructure.className} ({feeStructure.academicYear})
      </h2>
      <p>
        Board: <strong>{feeStructure.board || "All boards"}</strong> &middot; Monthly Total:{" "}
        <strong>{feeStructure.monthlyTotal}</strong> &middot; Status:{" "}
        <strong>{feeStructure.isActive ? "active" : "inactive"}</strong>
      </p>

      <fieldset style={{ marginBottom: 16 }}>
        <legend>Change Status</legend>
        {statusMutation.isError && (
          <p style={{ color: "red" }}>Could not update status: {statusMutation.error.message}</p>
        )}
        <form onSubmit={handleStatusSubmit} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ width: 200 }}>
            <LabeledSelect
              label="New Status"
              options={["active", "inactive"]}
              value={statusChoice}
              onChange={(e) => setStatusChoice(e.target.value)}
            />
          </div>
          <button type="submit" disabled={!statusChoice || statusMutation.isPending}>
            {statusMutation.isPending ? "Updating..." : "Update Status"}
          </button>
        </form>
      </fieldset>

      {!isEditing && (
        <button onClick={startEditing} style={{ marginBottom: 16 }}>
          Edit Fee Structure
        </button>
      )}

      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          {updateMutation.isError && (
            <p style={{ color: "red" }}>Could not save: {updateMutation.error.message}</p>
          )}
          <FeeStructureFields
            formData={formData}
            onChange={handleChange}
            onComponentsChange={handleComponentsChange}
          />
          <button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>{" "}
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <h3>Components</h3>
          <ul>
            {feeStructure.components.map((component, index) => (
              <li key={index}>
                {component.name}: {component.amount} ({component.frequency})
              </li>
            ))}
          </ul>
          <p>Due day of month: {feeStructure.dueDayOfMonth ?? "Not set"}</p>
        </div>
      )}
    </div>
  );
}
