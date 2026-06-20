// The actual input fields for a fee structure: academicYear/className/board/
// dueDayOfMonth, plus a dynamic list of fee components (today there's
// usually just one, "Tuition", but the school can add more rows later —
// transport, library, exam fees, etc.). Shared by the create form
// (FeeStructureForm.jsx) and the edit mode on the detail screen
// (FeeStructureDetail.jsx) — same pattern as RegistrationFields.jsx.
//
// This component does NOT render a <form> or a submit button — whoever uses
// it wraps it in their own <form onSubmit={...}> and adds their own buttons.

import { LabeledInput, LabeledSelect } from "../../../shared/FormFields.jsx";
import { emptyComponent } from "./emptyComponent.js";

// Live preview only — mirrors what the backend itself calculates and
// stores as monthlyTotal (the sum of "monthly"-frequency components).
function calculateMonthlyTotalPreview(components) {
  return components
    .filter((component) => component.frequency === "monthly")
    .reduce((sum, component) => sum + (Number(component.amount) || 0), 0);
}

export default function FeeStructureFields({ formData, onChange, onComponentsChange, disabled = false }) {
  function handleComponentFieldChange(index, field, value) {
    const updated = formData.components.map((component, i) =>
      i === index ? { ...component, [field]: value } : component
    );
    onComponentsChange(updated);
  }

  function addComponent() {
    onComponentsChange([...formData.components, emptyComponent()]);
  }

  function removeComponent(index) {
    onComponentsChange(formData.components.filter((_, i) => i !== index));
  }

  return (
    <>
      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Fee Structure</legend>
        <LabeledInput
          label="Academic Year * (e.g. 2026-27)"
          name="academicYear"
          value={formData.academicYear}
          onChange={onChange}
          required
        />
        <LabeledInput
          label="Class * (e.g. Class 10)"
          name="className"
          value={formData.className}
          onChange={onChange}
          required
        />
        <LabeledSelect
          label="Board (leave blank to apply to all boards for this class)"
          name="board"
          options={["CBSE", "CG_STATE"]}
          value={formData.board}
          onChange={onChange}
        />
        <LabeledInput
          label="Due Day of Month (e.g. 10 = due by the 10th)"
          name="dueDayOfMonth"
          type="number"
          min="1"
          max="31"
          value={formData.dueDayOfMonth}
          onChange={onChange}
        />
      </fieldset>

      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Fee Components (at least one required)</legend>
        {formData.components.map((component, index) => (
          <div
            key={index}
            style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 10 }}
          >
            <div style={{ flex: 2 }}>
              <LabeledInput
                label="Name"
                value={component.name}
                onChange={(e) => handleComponentFieldChange(index, "name", e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <LabeledInput
                label="Amount"
                type="number"
                min="0"
                value={component.amount}
                onChange={(e) => handleComponentFieldChange(index, "amount", e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <LabeledInput
                label="Frequency"
                placeholder="e.g. monthly"
                value={component.frequency}
                onChange={(e) => handleComponentFieldChange(index, "frequency", e.target.value)}
                required
              />
            </div>
            {!disabled && formData.components.length > 1 && (
              <button type="button" onClick={() => removeComponent(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        {!disabled && (
          <button type="button" onClick={addComponent}>
            Add Component
          </button>
        )}

        <p style={{ marginTop: 12 }}>
          Monthly Total (auto, "monthly" frequency components only):{" "}
          <strong>{calculateMonthlyTotalPreview(formData.components)}</strong>
        </p>
      </fieldset>
    </>
  );
}
