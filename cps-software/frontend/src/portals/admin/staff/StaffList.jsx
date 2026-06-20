// Screen: Staff List.
// Lets you filter by staffType/department/status. Salary is never requested
// here, so it never appears on screen.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStaff } from "../../../shared/api.js";
import { LabeledInput, LabeledSelect } from "../../../shared/FormFields.jsx";

export default function StaffList() {
  const [filters, setFilters] = useState({ staffType: "", department: "", status: "active" });

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["staff", filters],
    queryFn: () => getStaff(filters),
  });

  return (
    <div>
      <h2>Staff</h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 200 }}>
          <LabeledSelect
            label="Staff Type"
            name="staffType"
            options={["teaching", "driver", "office", "admin", "other"]}
            value={filters.staffType}
            onChange={handleFilterChange}
          />
        </div>
        <div style={{ width: 200 }}>
          <LabeledInput
            label="Department"
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
          />
        </div>
        <div style={{ width: 200 }}>
          <LabeledSelect
            label="Status"
            name="status"
            options={["active", "resigned", "all"]}
            value={filters.status}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p style={{ color: "red" }}>Could not load staff: {error.message}</p>}

      {data && (
        data.length === 0 ? (
          <p>No staff match these filters.</p>
        ) : (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Staff Type</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((staff) => (
                <tr key={staff._id}>
                  <td>{staff.employeeId}</td>
                  <td>{staff.employeeName}</td>
                  <td>{staff.staffType}</td>
                  <td>{staff.department || "-"}</td>
                  <td>{staff.designation || "-"}</td>
                  <td>{staff.status}</td>
                  <td>
                    <Link to={`/admin/staff/${staff._id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
