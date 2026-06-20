// A handful of small, plain form-field components shared by every screen
// that needs a form (the registration form, the student edit form, etc).
// They exist so we don't have to repeat the same "<label> + <input>"
// markup dozens of times — there is no styling magic here, just structure.

export function LabeledInput({ label, ...inputProps }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <span style={{ display: "block", fontSize: 13 }}>{label}</span>
      <input {...inputProps} style={{ display: "block", width: "100%", padding: 4 }} />
    </label>
  );
}

export function LabeledTextarea({ label, ...textareaProps }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <span style={{ display: "block", fontSize: 13 }}>{label}</span>
      <textarea {...textareaProps} style={{ display: "block", width: "100%", padding: 4 }} />
    </label>
  );
}

// `options` is an array of plain strings, e.g. ["New", "Old"].
export function LabeledSelect({ label, options, ...selectProps }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <span style={{ display: "block", fontSize: 13 }}>{label}</span>
      <select {...selectProps} style={{ display: "block", width: "100%", padding: 4 }}>
        <option value="">-- select --</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LabeledCheckbox({ label, ...inputProps }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <input type="checkbox" {...inputProps} /> {label}
    </label>
  );
}
