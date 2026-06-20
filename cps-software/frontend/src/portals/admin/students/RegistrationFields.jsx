// The actual input fields for a registration, grouped into fieldsets. This
// is shared by the "New Registration" form (RegistrationForm.jsx) and the
// "Edit Registration" mode on the detail screen (RegistrationDetail.jsx) so
// we don't have to keep two copies of ~35 fields in sync.
//
// This component does NOT render a <form> or a submit button — whoever uses
// it wraps it in their own <form onSubmit={...}> and adds their own buttons.

import { dateToWords } from "../../../shared/dateToWords.js";
import {
  LabeledInput,
  LabeledSelect,
  LabeledTextarea,
  LabeledCheckbox,
} from "../../../shared/FormFields.jsx";

export default function RegistrationFields({ formData, onChange, disabled = false }) {
  const dobInWordsPreview = dateToWords(formData.dateOfBirth);

  return (
    <>
      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Student</legend>
        <LabeledSelect
          label="New or Old Student"
          name="studentNewOld"
          options={["New", "Old"]}
          value={formData.studentNewOld}
          onChange={onChange}
        />
        <LabeledInput label="Class" name="class" value={formData.class} onChange={onChange} />
        <LabeledInput
          label="Student Name *"
          name="studentName"
          value={formData.studentName}
          onChange={onChange}
          required
        />
        <LabeledInput label="Gender" name="gender" value={formData.gender} onChange={onChange} />
        <LabeledInput
          label="Date of Birth *"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={onChange}
          required
        />
        <LabeledInput label="Date of Birth in Words (auto)" value={dobInWordsPreview} disabled />
        <LabeledSelect
          label="Category"
          name="category"
          options={["General", "OBC", "SC", "ST"]}
          value={formData.category}
          onChange={onChange}
        />
        <LabeledInput
          label="SMS Contact No."
          name="smsContactNo"
          value={formData.smsContactNo}
          onChange={onChange}
        />
        <LabeledInput
          label="Aadhaar Number (confidential)"
          name="aadhaarNumber"
          type="password"
          value={formData.aadhaarNumber}
          onChange={onChange}
        />
        <LabeledInput
          label="Sibling's Student ID (optional, if a sibling already studies here)"
          name="siblingOf"
          value={formData.siblingOf}
          onChange={onChange}
        />
      </fieldset>

      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Parent / Guardian</legend>
        <LabeledInput
          label="Father's Name"
          name="fatherName"
          value={formData.fatherName}
          onChange={onChange}
        />
        <LabeledInput
          label="Mother's Name"
          name="motherName"
          value={formData.motherName}
          onChange={onChange}
        />
        <LabeledInput
          label="Father's Contact No. 1 *"
          name="fatherContact1"
          value={formData.fatherContact1}
          onChange={onChange}
          required
        />
        <LabeledInput
          label="Father's Contact No. 2"
          name="fatherContact2"
          value={formData.fatherContact2}
          onChange={onChange}
        />
      </fieldset>

      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Admission Details</legend>
        <LabeledInput
          label="Date of Admission"
          name="dateOfAdmission"
          type="date"
          value={formData.dateOfAdmission}
          onChange={onChange}
        />
        <LabeledInput
          label="Admission Type"
          name="admissionType"
          value={formData.admissionType}
          onChange={onChange}
        />
        <LabeledInput
          label="Admission Scheme (e.g. NON-RTE or RTE)"
          name="admissionScheme"
          value={formData.admissionScheme}
          onChange={onChange}
        />
        <LabeledInput
          label="Fee Category (e.g. CBSE BOARD or CG STATE BOARD)"
          name="feeCategory"
          value={formData.feeCategory}
          onChange={onChange}
        />
        <LabeledInput
          label="Registration Fees"
          name="registrationFees"
          type="number"
          value={formData.registrationFees}
          onChange={onChange}
        />
        <LabeledInput
          label="Payment Mode"
          name="paymentMode"
          value={formData.paymentMode}
          onChange={onChange}
        />
      </fieldset>

      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Address</legend>
        <LabeledTextarea
          label="Address"
          name="studentAddress"
          value={formData.studentAddress}
          onChange={onChange}
        />
        <LabeledInput
          label="Village / City"
          name="villageCity"
          value={formData.villageCity}
          onChange={onChange}
        />
        <LabeledInput label="Block" name="block" value={formData.block} onChange={onChange} />
        <LabeledInput label="District" name="district" value={formData.district} onChange={onChange} />
        <LabeledInput label="State" name="state" value={formData.state} onChange={onChange} />
        <LabeledInput label="Pincode" name="pincode" value={formData.pincode} onChange={onChange} />
        <LabeledInput label="Landmark" name="landmark" value={formData.landmark} onChange={onChange} />
      </fieldset>

      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Services</legend>
        <LabeledCheckbox label="Bus" name="bus" checked={formData.bus} onChange={onChange} />
        <LabeledCheckbox label="Hostel" name="hostel" checked={formData.hostel} onChange={onChange} />
        <LabeledCheckbox label="Library" name="library" checked={formData.library} onChange={onChange} />
      </fieldset>

      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Photos (paste a file path or URL for now)</legend>
        <LabeledInput
          label="Student Photo"
          name="studentPhoto"
          value={formData.studentPhoto}
          onChange={onChange}
        />
        <LabeledInput
          label="Father's Photo"
          name="fatherPhoto"
          value={formData.fatherPhoto}
          onChange={onChange}
        />
        <LabeledInput
          label="Mother's Photo"
          name="motherPhoto"
          value={formData.motherPhoto}
          onChange={onChange}
        />
      </fieldset>

      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Remarks</legend>
        <LabeledInput label="Remark 1" name="remark1" value={formData.remark1} onChange={onChange} />
        <LabeledInput label="Remark 2" name="remark2" value={formData.remark2} onChange={onChange} />
        <LabeledInput label="Remark 3" name="remark3" value={formData.remark3} onChange={onChange} />
        <LabeledInput label="Remark 4" name="remark4" value={formData.remark4} onChange={onChange} />
      </fieldset>
    </>
  );
}
