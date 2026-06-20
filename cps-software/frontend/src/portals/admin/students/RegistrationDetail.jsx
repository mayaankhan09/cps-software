// Screen 3: Registration Detail.
// Shows one registration, with buttons to Approve / Reject, and an Edit
// mode that's only usable while the registration is still "pending" (the
// backend itself enforces this too — this is just matching the UI to it).

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveRegistration,
  getRegistration,
  rejectRegistration,
  updateRegistration,
} from "../../../shared/api.js";
import RegistrationFields from "./RegistrationFields.jsx";

function toDateInputValue(isoDate) {
  return isoDate ? isoDate.slice(0, 10) : "";
}

// Turns the registration record from the backend into the shape the edit
// form expects (mainly: full ISO date strings -> "YYYY-MM-DD").
function toFormData(registration) {
  return {
    studentNewOld: registration.studentNewOld || "",
    class: registration.class || "",
    studentName: registration.studentName || "",
    gender: registration.gender || "",
    dateOfBirth: toDateInputValue(registration.dateOfBirth),
    category: registration.category || "",
    smsContactNo: registration.smsContactNo || "",
    fatherName: registration.fatherName || "",
    motherName: registration.motherName || "",
    fatherContact1: registration.fatherContact1 || "",
    fatherContact2: registration.fatherContact2 || "",
    dateOfAdmission: toDateInputValue(registration.dateOfAdmission),
    admissionType: registration.admissionType || "",
    admissionScheme: registration.admissionScheme || "",
    feeCategory: registration.feeCategory || "",
    registrationFees: registration.registrationFees ?? "",
    paymentMode: registration.paymentMode || "",
    // The backend never sends aadhaarNumber back (it's hidden by default),
    // so we can't show the existing value here. We leave it blank and only
    // send it along on save if the user actually types a new one — see the
    // note in handleSaveEdit below.
    aadhaarNumber: "",
    studentAddress: registration.studentAddress || "",
    villageCity: registration.villageCity || "",
    block: registration.block || "",
    district: registration.district || "",
    state: registration.state || "",
    pincode: registration.pincode || "",
    landmark: registration.landmark || "",
    bus: registration.bus || false,
    hostel: registration.hostel || false,
    library: registration.library || false,
    studentPhoto: registration.studentPhoto || "",
    fatherPhoto: registration.fatherPhoto || "",
    motherPhoto: registration.motherPhoto || "",
    remark1: registration.remark1 || "",
    remark2: registration.remark2 || "",
    remark3: registration.remark3 || "",
    remark4: registration.remark4 || "",
    siblingOf: registration.siblingOf || "",
  };
}

export default function RegistrationDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  const {
    data: registration,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["registration", id],
    queryFn: () => getRegistration(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateRegistration(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration", id] });
      setIsEditing(false);
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => approveRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration", id] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration", id] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p style={{ color: "red" }}>Could not load registration: {error.message}</p>;

  function startEditing() {
    setFormData(toFormData(registration));
    setIsEditing(true);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSaveEdit(event) {
    event.preventDefault();
    // api.js's updateRegistration strips blank fields before sending, which
    // is what keeps a blank Aadhaar Number here from wiping out the real
    // (hidden) value already saved on the backend.
    updateMutation.mutate(formData);
  }

  const isPending = registration.status === "pending";

  // Right after a successful approval, show the new admission/roll number
  // front and center rather than just quietly refreshing the page.
  if (approveMutation.isSuccess) {
    const { student } = approveMutation.data;
    return (
      <div>
        <h2>Registration Approved</h2>
        <p>
          <strong>{student.studentName}</strong> is now an admitted student.
        </p>
        <ul>
          <li>
            Admission Number: <strong>{student.admissionNumber}</strong>
          </li>
          <li>
            Roll Number: <strong>{student.rollNumber}</strong>
          </li>
          <li>
            Academic Year: <strong>{student.academicYear}</strong>
          </li>
        </ul>
        <Link to="/admin/students">Go to Student List</Link>
      </div>
    );
  }

  return (
    <div>
      <p>
        <Link to="/admin/registrations">&larr; Back to Pending Registrations</Link>
      </p>
      <h2>Registration #{registration.registrationNo}</h2>
      <p>
        Status: <strong>{registration.status}</strong>
      </p>

      {approveMutation.isError && (
        <p style={{ color: "red" }}>Could not approve: {approveMutation.error.message}</p>
      )}
      {rejectMutation.isError && (
        <p style={{ color: "red" }}>Could not reject: {rejectMutation.error.message}</p>
      )}

      {!isEditing && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => approveMutation.mutate()}
            disabled={!isPending || approveMutation.isPending}
          >
            {approveMutation.isPending ? "Approving..." : "Approve"}
          </button>{" "}
          <button
            onClick={() => rejectMutation.mutate()}
            disabled={!isPending || rejectMutation.isPending}
          >
            {rejectMutation.isPending ? "Rejecting..." : "Reject"}
          </button>{" "}
          <button
            onClick={startEditing}
            disabled={!isPending}
            title={!isPending ? "Only a pending registration can be edited" : undefined}
          >
            Edit
          </button>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          <p style={{ fontStyle: "italic" }}>
            Note: leave Aadhaar Number blank to keep the existing value unchanged.
          </p>
          {updateMutation.isError && (
            <p style={{ color: "red" }}>Could not save: {updateMutation.error.message}</p>
          )}
          <RegistrationFields formData={formData} onChange={handleChange} />
          <button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>{" "}
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <RegistrationSummary registration={registration} />
      )}
    </div>
  );
}

// A plain read-only summary of the registration's key details.
function RegistrationSummary({ registration }) {
  const services = [
    registration.bus && "Bus",
    registration.hostel && "Hostel",
    registration.library && "Library",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <dl>
      <dt>Student Name</dt>
      <dd>{registration.studentName}</dd>
      <dt>Class</dt>
      <dd>{registration.class}</dd>
      <dt>Gender</dt>
      <dd>{registration.gender}</dd>
      <dt>Date of Birth</dt>
      <dd>{toDateInputValue(registration.dateOfBirth)}</dd>
      <dt>Date of Birth (in words)</dt>
      <dd>{registration.dobInWords}</dd>
      <dt>Category</dt>
      <dd>{registration.category}</dd>
      <dt>Father's Name</dt>
      <dd>{registration.fatherName}</dd>
      <dt>Father's Contact</dt>
      <dd>{registration.fatherContact1}</dd>
      <dt>Mother's Name</dt>
      <dd>{registration.motherName}</dd>
      <dt>Address</dt>
      <dd>
        {[registration.studentAddress, registration.villageCity, registration.district, registration.state, registration.pincode]
          .filter(Boolean)
          .join(", ")}
      </dd>
      <dt>Services</dt>
      <dd>{services || "None"}</dd>
    </dl>
  );
}
