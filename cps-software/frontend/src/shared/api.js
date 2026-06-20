// This file is the ONE place that knows how to talk to the backend.
// Every screen imports functions from here instead of calling fetch()
// directly — that way, if the backend's address ever changes (e.g. when we
// deploy), we only have to update it in this one spot.

// The backend server's address during local development.
const API_BASE_URL = "http://localhost:5000";

// A small helper that does the actual fetch() call, turns the response into
// JSON, and throws a normal JavaScript Error (with the backend's own error
// message) if anything went wrong. Every function below uses this, so none
// of them have to repeat this logic.
async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // The backend always replies with JSON, even for errors, so we can safely
  // try to parse it. If parsing fails for some reason, data just stays null.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Our backend sends errors as either { error: "..." } (one message) or
    // { errors: ["...", "..."] } (a list, usually from validation).
    const message =
      data?.errors?.join(" ") || data?.error || `Request failed (status ${response.status}).`;
    throw new Error(message);
  }

  return data;
}

// Turns an object like { status: "active", class: "5" } into a query string
// like "?status=active&class=5", skipping any values that are empty.
function toQueryString(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  );
  const query = new URLSearchParams(cleaned).toString();
  return query ? `?${query}` : "";
}

// Removes keys whose value is an empty string before sending a form to the
// backend. Our forms start every optional field as "" until the user fills
// it in — but the backend treats "field not sent" differently from
// "field sent as blank" (e.g. an enum field sent as "" fails validation
// instead of just being skipped, and a blank aadhaarNumber would overwrite
// an existing one). Booleans/numbers/other values are left alone.
function omitBlankFields(data) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== ""));
}

// --- Registrations ---

export function getRegistrations(filters = {}) {
  return request(`/api/registrations${toQueryString(filters)}`);
}

export function getRegistration(id) {
  return request(`/api/registrations/${id}`);
}

export function createRegistration(data) {
  return request("/api/registrations", { method: "POST", body: JSON.stringify(omitBlankFields(data)) });
}

export function updateRegistration(id, data) {
  return request(`/api/registrations/${id}`, {
    method: "PUT",
    body: JSON.stringify(omitBlankFields(data)),
  });
}

export function approveRegistration(id) {
  return request(`/api/registrations/${id}/approve`, { method: "PATCH" });
}

export function rejectRegistration(id) {
  return request(`/api/registrations/${id}/reject`, { method: "PATCH" });
}

// --- Students ---

export function getStudents(filters = {}) {
  return request(`/api/students${toQueryString(filters)}`);
}

export function getStudent(id) {
  return request(`/api/students/${id}`);
}

export function updateStudent(id, data) {
  return request(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(omitBlankFields(data)) });
}

export function updateStudentStatus(id, status) {
  return request(`/api/students/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// --- Staff ---

export function getStaff(filters = {}) {
  return request(`/api/staff${toQueryString(filters)}`);
}

export function getStaffById(id) {
  return request(`/api/staff/${id}`);
}

export function createStaff(data) {
  return request("/api/staff", { method: "POST", body: JSON.stringify(omitBlankFields(data)) });
}

export function updateStaff(id, data) {
  return request(`/api/staff/${id}`, { method: "PUT", body: JSON.stringify(omitBlankFields(data)) });
}

export function updateStaffStatus(id, status) {
  return request(`/api/staff/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
