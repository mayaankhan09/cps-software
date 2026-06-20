// Screen 1: New Registration.
// A form covering everything about a student's application. Submitting it
// calls POST /api/registrations. The backend assigns the registrationNo and
// the real dobInWords — the actual input fields live in RegistrationFields.jsx
// (shared with the edit form on the detail screen).

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createRegistration } from "../../../shared/api.js";
import RegistrationFields from "./RegistrationFields.jsx";

// Every field starts blank/false. Checkboxes need real booleans, everything
// else is fine as an empty string until the user types something.
const EMPTY_FORM = {
  studentNewOld: "",
  class: "",
  studentName: "",
  gender: "",
  dateOfBirth: "",
  category: "",
  smsContactNo: "",
  fatherName: "",
  motherName: "",
  fatherContact1: "",
  fatherContact2: "",
  dateOfAdmission: "",
  admissionType: "",
  admissionScheme: "",
  feeCategory: "",
  registrationFees: "",
  paymentMode: "",
  aadhaarNumber: "",
  studentAddress: "",
  villageCity: "",
  block: "",
  district: "",
  state: "",
  pincode: "",
  landmark: "",
  bus: false,
  hostel: false,
  library: false,
  studentPhoto: "",
  fatherPhoto: "",
  motherPhoto: "",
  remark1: "",
  remark2: "",
  remark3: "",
  remark4: "",
  siblingOf: "",
};

export default function RegistrationForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const mutation = useMutation({
    mutationFn: createRegistration,
  });

  // One handler for every field: text/number/date inputs use "value",
  // checkboxes use "checked" instead.
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    mutation.mutate(formData);
  }

  function handleCreateAnother() {
    setFormData(EMPTY_FORM);
    mutation.reset();
  }

  // Once a registration has been created successfully, show a confirmation
  // instead of the form (with a button to start a fresh one).
  if (mutation.isSuccess) {
    const created = mutation.data;
    return (
      <div>
        <h2>Registration Created</h2>
        <p>
          <strong>{created.studentName}</strong> was registered successfully with{" "}
          <strong>Registration No. {created.registrationNo}</strong>.
        </p>
        <p>It is now in the pending list, waiting for Management to approve or reject it.</p>
        <button onClick={handleCreateAnother}>Create Another Registration</button>
      </div>
    );
  }

  return (
    <div>
      <h2>New Registration</h2>

      {mutation.isError && (
        <p style={{ color: "red" }}>Could not save: {mutation.error.message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <RegistrationFields formData={formData} onChange={handleChange} />

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Submit Registration"}
        </button>
      </form>
    </div>
  );
}
