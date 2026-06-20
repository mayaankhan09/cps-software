// Screen: Staff Detail.
// The full view of one staff member — this is the one screen allowed to
// show salary. Includes an edit form for the staff member's profile fields,
// and a separate control to change status. There is no delete button
// anywhere — staff are only ever marked active/resigned, never removed.

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStaffById, updateStaff, updateStaffStatus } from "../../../shared/api.js";
import { LabeledSelect } from "../../../shared/FormFields.jsx";
import StaffFields from "./StaffFields.jsx";
import { cleanSalary } from "./cleanSalary.js";

function toDateInputValue(isoDate) {
  return isoDate ? isoDate.slice(0, 10) : "";
}

// Turns the staff record from the backend into the shape the edit form
// expects (dates as "YYYY-MM-DD", salary numbers as strings for the inputs).
function toFormData(staff) {
  return {
    employeeName: staff.employeeName || "",
    gender: staff.gender || "",
    dateOfBirth: toDateInputValue(staff.dateOfBirth),
    email: staff.email || "",
    contactNo1: staff.contactNo1 || "",
    contactNo2: staff.contactNo2 || "",
    whatsappNo: staff.whatsappNo || "",
    category: staff.category || "",
    religion: staff.religion || "",
    bloodGroup: staff.bloodGroup || "",
    department: staff.department || "",
    designation: staff.designation || "",
    medium: staff.medium || "",
    staffType: staff.staffType || "",
    joiningDate: toDateInputValue(staff.joiningDate),
    salary: {
      basic: staff.salary?.basic ?? "",
      allowances: staff.salary?.allowances ?? "",
      deductions: staff.salary?.deductions ?? "",
    },
    checkForMessage: staff.checkForMessage || false,
  };
}

export default function StaffDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [statusChoice, setStatusChoice] = useState("");

  const {
    data: staff,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["staff-member", id],
    queryFn: () => getStaffById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-member", id] });
      setIsEditing(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => updateStaffStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-member", id] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p style={{ color: "red" }}>Could not load staff member: {error.message}</p>;

  function startEditing() {
    setFormData(toFormData(staff));
    setIsEditing(true);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    if (name.startsWith("salary.")) {
      const key = name.split(".")[1];
      setFormData((previous) => ({ ...previous, salary: { ...previous.salary, [key]: value } }));
      return;
    }
    setFormData((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSaveEdit(event) {
    event.preventDefault();
    updateMutation.mutate({ ...formData, salary: cleanSalary(formData.salary) });
  }

  function handleStatusSubmit(event) {
    event.preventDefault();
    if (statusChoice) statusMutation.mutate(statusChoice);
  }

  return (
    <div>
      <p>
        <Link to="/admin/staff">&larr; Back to Staff</Link>
      </p>
      <h2>{staff.employeeName}</h2>
      <p>
        Employee ID <strong>{staff.employeeId}</strong> &middot; {staff.staffType} &middot; Status{" "}
        <strong>{staff.status}</strong>
      </p>

      {/* Status change is independent of edit mode — it always has its own control. */}
      <fieldset style={{ marginBottom: 16 }}>
        <legend>Change Status</legend>
        {statusMutation.isError && (
          <p style={{ color: "red" }}>Could not update status: {statusMutation.error.message}</p>
        )}
        <form onSubmit={handleStatusSubmit} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ width: 200 }}>
            <LabeledSelect
              label="New Status"
              options={["active", "resigned"]}
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
          Edit Staff Member
        </button>
      )}

      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          {updateMutation.isError && (
            <p style={{ color: "red" }}>Could not save: {updateMutation.error.message}</p>
          )}
          <StaffFields formData={formData} onChange={handleChange} />
          <button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>{" "}
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <StaffSummary staff={staff} />
      )}
    </div>
  );
}

// A plain read-only summary, including salary — this screen is allowed to
// show it (unlike the staff list).
function StaffSummary({ staff }) {
  return (
    <dl>
      <dt>Email</dt>
      <dd>{staff.email}</dd>
      <dt>Contact No.</dt>
      <dd>
        {staff.contactNo1}
        {staff.contactNo2 ? ` / ${staff.contactNo2}` : ""}
      </dd>
      <dt>WhatsApp No.</dt>
      <dd>{staff.whatsappNo || "-"}</dd>
      <dt>Date of Birth</dt>
      <dd>{toDateInputValue(staff.dateOfBirth) || "-"}</dd>
      <dt>Category / Religion / Blood Group</dt>
      <dd>{[staff.category, staff.religion, staff.bloodGroup].filter(Boolean).join(" / ") || "-"}</dd>
      <dt>Department / Designation</dt>
      <dd>{[staff.department, staff.designation].filter(Boolean).join(" / ") || "-"}</dd>
      <dt>Medium</dt>
      <dd>{staff.medium}</dd>
      <dt>Joining Date</dt>
      <dd>{toDateInputValue(staff.joiningDate) || "-"}</dd>
      <dt>Receives Messages/Alerts</dt>
      <dd>{staff.checkForMessage ? "Yes" : "No"}</dd>
      <dt>Salary (Basic / Allowances / Deductions)</dt>
      <dd>
        {staff.salary
          ? `${staff.salary.basic ?? "-"} / ${staff.salary.allowances ?? "-"} / ${staff.salary.deductions ?? "-"}`
          : "Not on file"}
      </dd>
    </dl>
  );
}
