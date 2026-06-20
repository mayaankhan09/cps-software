// Screen: New Fee Structure.
// Sets the monthly fee for a class (and optionally a specific board).
// Submitting it calls POST /api/fee-structures, which auto-calculates
// monthlyTotal from the components you give it.

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createFeeStructure } from "../../../shared/api.js";
import FeeStructureFields from "./FeeStructureFields.jsx";
import { emptyComponent } from "./emptyComponent.js";

const EMPTY_FORM = {
  academicYear: "",
  className: "",
  board: "",
  dueDayOfMonth: "",
  components: [emptyComponent()],
};

export default function FeeStructureForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const mutation = useMutation({
    mutationFn: createFeeStructure,
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  function handleComponentsChange(components) {
    setFormData((previous) => ({ ...previous, components }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    mutation.mutate({
      ...formData,
      board: formData.board || null,
      dueDayOfMonth: formData.dueDayOfMonth === "" ? undefined : Number(formData.dueDayOfMonth),
      components: formData.components.map((component) => ({
        ...component,
        amount: Number(component.amount),
      })),
    });
  }

  function handleCreateAnother() {
    setFormData(EMPTY_FORM);
    mutation.reset();
  }

  if (mutation.isSuccess) {
    const created = mutation.data;
    return (
      <div>
        <h2>Fee Structure Created</h2>
        <p>
          <strong>{created.className}</strong> ({created.academicYear}) now has a monthly total of{" "}
          <strong>{created.monthlyTotal}</strong>.
        </p>
        <button onClick={handleCreateAnother}>Add Another Fee Structure</button>
      </div>
    );
  }

  return (
    <div>
      <h2>New Fee Structure</h2>

      {mutation.isError && (
        <p style={{ color: "red" }}>Could not save: {mutation.error.message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <FeeStructureFields
          formData={formData}
          onChange={handleChange}
          onComponentsChange={handleComponentsChange}
        />

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
