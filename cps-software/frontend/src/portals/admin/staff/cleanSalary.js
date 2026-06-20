// A small helper shared by StaffForm.jsx and StaffDetail.jsx. Kept in its
// own file (rather than inside StaffFields.jsx) because a file that exports
// a React component can only export components — mixing in a plain
// function breaks React's fast-refresh during development.

// Cleans up the salary sub-object before it's sent to the backend: blank
// fields are dropped, and if every field was left blank the whole thing
// becomes undefined (so JSON.stringify leaves "salary" out of the request
// entirely, instead of sending an empty object).
export function cleanSalary(salary) {
  const cleaned = Object.fromEntries(Object.entries(salary).filter(([, value]) => value !== ""));
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}
