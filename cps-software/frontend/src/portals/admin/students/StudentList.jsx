// Screen 4: Student List (admitted students).
// Lets you filter by class/section/status. Aadhaar is never requested here,
// so it never appears on screen.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../../../shared/api.js";
import { LabeledInput, LabeledSelect } from "../../../shared/FormFields.jsx";

export default function StudentList() {
  const [filters, setFilters] = useState({ class: "", section: "", status: "active" });

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["students", filters],
    queryFn: () => getStudents(filters),
  });

  return (
    <div>
      <h2>Students</h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 150 }}>
          <LabeledInput label="Class" name="class" value={filters.class} onChange={handleFilterChange} />
        </div>
        <div style={{ width: 150 }}>
          <LabeledInput
            label="Section"
            name="section"
            value={filters.section}
            onChange={handleFilterChange}
          />
        </div>
        <div style={{ width: 200 }}>
          <LabeledSelect
            label="Status"
            name="status"
            options={["active", "inactive", "transferred", "all"]}
            value={filters.status}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p style={{ color: "red" }}>Could not load students: {error.message}</p>}

      {data && (
        data.length === 0 ? (
          <p>No students match these filters.</p>
        ) : (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Admission No.</th>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Roll No.</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((student) => (
                <tr key={student._id}>
                  <td>{student.admissionNumber}</td>
                  <td>{student.studentName}</td>
                  <td>{student.class}</td>
                  <td>{student.section || "-"}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.status}</td>
                  <td>
                    <Link to={`/admin/students/${student._id}`}>View</Link>
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
