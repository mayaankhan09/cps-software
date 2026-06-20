// Screen: New Staff Member.
// A form covering a staff member's personal/contact/employment/salary info.
// Submitting it calls POST /api/staff. The backend assigns the employeeId.

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createStaff } from "../../../shared/api.js";
import StaffFields from "./StaffFields.jsx";
import { cleanSalary } from "./cleanSalary.js";

// Every field starts blank/false. Checkboxes need real booleans, salary is
// its own little object so its three fields can be edited independently.
const EMPTY_FORM = {
  employeeName: "",
  gender: "",
  dateOfBirth: "",
  email: "",
  contactNo1: "",
  contactNo2: "",
  whatsappNo: "",
  category: "",
  religion: "",
  bloodGroup: "",
  department: "",
  designation: "",
  medium: "",
  staffType: "",
  joiningDate: "",
  salary: { basic: "", allowances: "", deductions: "" },
  checkForMessage: false,
};

export default function StaffForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const mutation = useMutation({
    mutationFn: createStaff,
  });

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    // Salary inputs are named "salary.basic" etc. so we can tell them apart
    // from the top-level fields and update the nested object correctly.
    if (name.startsWith("salary.")) {
      const key = name.split(".")[1];
      setFormData((previous) => ({ ...previous, salary: { ...previous.salary, [key]: value } }));
      return;
    }

    setFormData((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    mutation.mutate({ ...formData, salary: cleanSalary(formData.salary) });
  }

  function handleCreateAnother() {
    setFormData(EMPTY_FORM);
    mutation.reset();
  }

  // Once a staff member has been created successfully, show a confirmation
  // instead of the form (with a button to add another).
  if (mutation.isSuccess) {
    const created = mutation.data;
    return (
      <div>
        <h2>Staff Member Created</h2>
        <p>
          <strong>{created.employeeName}</strong> was added successfully with{" "}
          <strong>Employee ID {created.employeeId}</strong>.
        </p>
        <button onClick={handleCreateAnother}>Add Another Staff Member</button>
      </div>
    );
  }

  return (
    <div>
      <h2>New Staff Member</h2>

      {mutation.isError && (
        <p style={{ color: "red" }}>Could not save: {mutation.error.message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <StaffFields formData={formData} onChange={handleChange} />

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
