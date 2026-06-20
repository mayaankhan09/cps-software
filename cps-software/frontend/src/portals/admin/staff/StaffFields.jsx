// The actual input fields for a staff member, grouped into fieldsets. This
// is shared by the "New Staff" form (StaffForm.jsx) and the "Edit Staff"
// mode on the detail screen (StaffDetail.jsx) — same pattern as
// RegistrationFields.jsx in the students screens.
//
// This component does NOT render a <form> or a submit button — whoever uses
// it wraps it in their own <form onSubmit={...}> and adds their own buttons.

import {
  LabeledCheckbox,
  LabeledInput,
  LabeledSelect,
} from "../../../shared/FormFields.jsx";

export default function StaffFields({ formData, onChange, disabled = false }) {
  return (
    <>
      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Personal</legend>
        <LabeledInput
          label="Employee Name *"
          name="employeeName"
          value={formData.employeeName}
          onChange={onChange}
          required
        />
        <LabeledInput
          label="Gender *"
          name="gender"
          value={formData.gender}
          onChange={onChange}
          required
        />
        <LabeledInput
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={onChange}
        />
        <LabeledInput label="Category" name="category" value={formData.category} onChange={onChange} />
        <LabeledInput label="Religion" name="religion" value={formData.religion} onChange={onChange} />
        <LabeledInput
          label="Blood Group"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={onChange}
        />
      </fieldset>

      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Contact</legend>
        <LabeledInput
          label="Email *"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          required
        />
        <LabeledInput
          label="Contact No. 1 *"
          name="contactNo1"
          value={formData.contactNo1}
          onChange={onChange}
          required
        />
        <LabeledInput
          label="Contact No. 2"
          name="contactNo2"
          value={formData.contactNo2}
          onChange={onChange}
        />
        <LabeledInput
          label="WhatsApp No."
          name="whatsappNo"
          value={formData.whatsappNo}
          onChange={onChange}
        />
      </fieldset>

      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Employment</legend>
        <LabeledInput
          label="Department"
          name="department"
          value={formData.department}
          onChange={onChange}
        />
        <LabeledInput
          label="Designation"
          name="designation"
          value={formData.designation}
          onChange={onChange}
        />
        <LabeledSelect
          label="Medium *"
          name="medium"
          options={["Hindi", "English", "Both"]}
          value={formData.medium}
          onChange={onChange}
          required
        />
        <LabeledSelect
          label="Staff Type *"
          name="staffType"
          options={["teaching", "driver", "office", "admin", "other"]}
          value={formData.staffType}
          onChange={onChange}
          required
        />
        <LabeledInput
          label="Joining Date"
          name="joiningDate"
          type="date"
          value={formData.joiningDate}
          onChange={onChange}
        />
        <LabeledCheckbox
          label="Receives system messages/alerts"
          name="checkForMessage"
          checked={formData.checkForMessage}
          onChange={onChange}
        />
      </fieldset>

      <fieldset disabled={disabled} style={{ marginBottom: 16 }}>
        <legend>Salary (confidential — reserved for future payroll)</legend>
        <LabeledInput
          label="Basic"
          name="salary.basic"
          type="number"
          value={formData.salary.basic}
          onChange={onChange}
        />
        <LabeledInput
          label="Allowances"
          name="salary.allowances"
          type="number"
          value={formData.salary.allowances}
          onChange={onChange}
        />
        <LabeledInput
          label="Deductions"
          name="salary.deductions"
          type="number"
          value={formData.salary.deductions}
          onChange={onChange}
        />
      </fieldset>
    </>
  );
}
