// Screen 5: Student Detail.
// The full view of one admitted student — this is the one screen allowed to
// show aadhaarNumber. Includes an edit form for the student's editable
// profile fields, and a separate control to change status. There is no
// delete button anywhere — students are only ever marked
// active/inactive/transferred, never removed.

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudent, updateStudent, updateStudentStatus } from "../../../shared/api.js";
import {
  LabeledCheckbox,
  LabeledInput,
  LabeledSelect,
  LabeledTextarea,
} from "../../../shared/FormFields.jsx";

function toDateInputValue(isoDate) {
  return isoDate ? isoDate.slice(0, 10) : "";
}

// Only these fields can actually be changed through PUT /api/students/:id
// (see backend/src/modules/students/student.service.js EDITABLE_FIELDS) —
// admissionNumber, academicYear, rollNumber and status are managed
// elsewhere, so they are shown read-only instead of in this form.
function toFormData(student) {
  return {
    studentNewOld: student.studentNewOld || "",
    class: student.class || "",
    studentName: student.studentName || "",
    dateOfBirth: toDateInputValue(student.dateOfBirth),
    gender: student.gender || "",
    category: student.category || "",
    smsContactNo: student.smsContactNo || "",
    fatherName: student.fatherName || "",
    motherName: student.motherName || "",
    fatherContact1: student.fatherContact1 || "",
    fatherContact2: student.fatherContact2 || "",
    studentAddress: student.studentAddress || "",
    villageCity: student.villageCity || "",
    block: student.block || "",
    district: student.district || "",
    state: student.state || "",
    pincode: student.pincode || "",
    landmark: student.landmark || "",
    studentPhoto: student.studentPhoto || "",
    fatherPhoto: student.fatherPhoto || "",
    motherPhoto: student.motherPhoto || "",
    bus: student.bus || false,
    hostel: student.hostel || false,
    library: student.library || false,
    // The backend includes the real aadhaarNumber on this one screen, so we
    // can safely prefill it here (unlike the registration edit form).
    aadhaarNumber: student.aadhaarNumber || "",
    section: student.section || "",
    siblingOf: student.siblingOf || "",
  };
}

export default function StudentDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [statusChoice, setStatusChoice] = useState("");

  const {
    data: student,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["student", id],
    queryFn: () => getStudent(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", id] });
      setIsEditing(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => updateStudentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", id] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p style={{ color: "red" }}>Could not load student: {error.message}</p>;

  function startEditing() {
    setFormData(toFormData(student));
    setIsEditing(true);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSaveEdit(event) {
    event.preventDefault();
    updateMutation.mutate(formData);
  }

  function handleStatusSubmit(event) {
    event.preventDefault();
    if (statusChoice) statusMutation.mutate(statusChoice);
  }

  return (
    <div>
      <p>
        <Link to="/admin/students">&larr; Back to Students</Link>
      </p>
      <h2>{student.studentName}</h2>
      <p>
        Admission No. <strong>{student.admissionNumber}</strong> &middot; Class{" "}
        <strong>{student.class}</strong> {student.section ? `(Section ${student.section})` : ""} &middot;
        Roll No. <strong>{student.rollNumber}</strong> &middot; Academic Year{" "}
        <strong>{student.academicYear}</strong> &middot; Status <strong>{student.status}</strong>
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
              options={["active", "inactive", "transferred"]}
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
          Edit Student
        </button>
      )}

      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          {updateMutation.isError && (
            <p style={{ color: "red" }}>Could not save: {updateMutation.error.message}</p>
          )}

          <fieldset style={{ marginBottom: 16 }}>
            <legend>Personal</legend>
            <LabeledSelect
              label="New or Old Student"
              name="studentNewOld"
              options={["New", "Old"]}
              value={formData.studentNewOld}
              onChange={handleChange}
            />
            <LabeledInput label="Class" name="class" value={formData.class} onChange={handleChange} />
            <LabeledInput label="Section" name="section" value={formData.section} onChange={handleChange} />
            <LabeledInput
              label="Student Name *"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
            />
            <LabeledInput label="Gender" name="gender" value={formData.gender} onChange={handleChange} />
            <LabeledInput
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            <LabeledSelect
              label="Category"
              name="category"
              options={["General", "OBC", "SC", "ST"]}
              value={formData.category}
              onChange={handleChange}
            />
            <LabeledInput
              label="SMS Contact No."
              name="smsContactNo"
              value={formData.smsContactNo}
              onChange={handleChange}
            />
            <LabeledInput
              label="Aadhaar Number (confidential)"
              name="aadhaarNumber"
              type="password"
              value={formData.aadhaarNumber}
              onChange={handleChange}
            />
            <LabeledInput
              label="Sibling's Student ID (optional)"
              name="siblingOf"
              value={formData.siblingOf}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset style={{ marginBottom: 16 }}>
            <legend>Parent / Guardian</legend>
            <LabeledInput
              label="Father's Name"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
            />
            <LabeledInput
              label="Mother's Name"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
            />
            <LabeledInput
              label="Father's Contact No. 1 *"
              name="fatherContact1"
              value={formData.fatherContact1}
              onChange={handleChange}
              required
            />
            <LabeledInput
              label="Father's Contact No. 2"
              name="fatherContact2"
              value={formData.fatherContact2}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset style={{ marginBottom: 16 }}>
            <legend>Address</legend>
            <LabeledTextarea
              label="Address"
              name="studentAddress"
              value={formData.studentAddress}
              onChange={handleChange}
            />
            <LabeledInput
              label="Village / City"
              name="villageCity"
              value={formData.villageCity}
              onChange={handleChange}
            />
            <LabeledInput label="Block" name="block" value={formData.block} onChange={handleChange} />
            <LabeledInput
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
            />
            <LabeledInput label="State" name="state" value={formData.state} onChange={handleChange} />
            <LabeledInput
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
            />
            <LabeledInput
              label="Landmark"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset style={{ marginBottom: 16 }}>
            <legend>Services</legend>
            <LabeledCheckbox label="Bus" name="bus" checked={formData.bus} onChange={handleChange} />
            <LabeledCheckbox
              label="Hostel"
              name="hostel"
              checked={formData.hostel}
              onChange={handleChange}
            />
            <LabeledCheckbox
              label="Library"
              name="library"
              checked={formData.library}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset style={{ marginBottom: 16 }}>
            <legend>Photos (paste a file path or URL for now)</legend>
            <LabeledInput
              label="Student Photo"
              name="studentPhoto"
              value={formData.studentPhoto}
              onChange={handleChange}
            />
            <LabeledInput
              label="Father's Photo"
              name="fatherPhoto"
              value={formData.fatherPhoto}
              onChange={handleChange}
            />
            <LabeledInput
              label="Mother's Photo"
              name="motherPhoto"
              value={formData.motherPhoto}
              onChange={handleChange}
            />
          </fieldset>

          <button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>{" "}
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <StudentSummary student={student} />
      )}
    </div>
  );
}

// A plain read-only summary, including the fields that this form can't edit
// (admission/academic info is managed elsewhere — see the comment on
// toFormData above).
function StudentSummary({ student }) {
  const services = [student.bus && "Bus", student.hostel && "Hostel", student.library && "Library"]
    .filter(Boolean)
    .join(", ");

  return (
    <dl>
      <dt>Date of Birth</dt>
      <dd>
        {toDateInputValue(student.dateOfBirth)} ({student.dobInWords})
      </dd>
      <dt>Gender</dt>
      <dd>{student.gender}</dd>
      <dt>Category</dt>
      <dd>{student.category}</dd>
      <dt>Aadhaar Number</dt>
      <dd>{student.aadhaarNumber || "Not on file"}</dd>
      <dt>Father's Name / Contact</dt>
      <dd>
        {student.fatherName} / {student.fatherContact1}
      </dd>
      <dt>Mother's Name</dt>
      <dd>{student.motherName}</dd>
      <dt>Address</dt>
      <dd>
        {[student.studentAddress, student.villageCity, student.district, student.state, student.pincode]
          .filter(Boolean)
          .join(", ")}
      </dd>
      <dt>Services</dt>
      <dd>{services || "None"}</dd>
      <dt>Date of Admission</dt>
      <dd>{toDateInputValue(student.dateOfAdmission)}</dd>
      <dt>Admission Type / Scheme</dt>
      <dd>
        {student.admissionType} / {student.admissionScheme}
      </dd>
      <dt>Fee Category</dt>
      <dd>{student.feeCategory}</dd>
    </dl>
  );
}
