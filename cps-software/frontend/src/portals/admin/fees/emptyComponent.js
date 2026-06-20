// A tiny helper used by FeeStructureForm.jsx and FeeStructureDetail.jsx.
// Kept in its own file (rather than inside FeeStructureFields.jsx) because
// a file that exports a React component can only export components —
// mixing in a plain function breaks React's fast-refresh during development.

// A fresh, empty fee component row — used both for the form's starting
// state and whenever "Add Component" is clicked.
export function emptyComponent() {
  return { name: "", amount: "", frequency: "monthly" };
}
