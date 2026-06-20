// Screen: Fee Structures (the "Set Fees" list).
// Shows every fee structure, filterable by academicYear/className. Each row
// links to its detail screen, where it can be edited or
// activated/deactivated (same pattern as the Student/Staff detail screens).

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFeeStructures } from "../../../shared/api.js";
import { LabeledInput } from "../../../shared/FormFields.jsx";

export default function FeeStructureList() {
  const [filters, setFilters] = useState({ academicYear: "", className: "" });

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fee-structures", filters],
    queryFn: () => getFeeStructures({ ...filters, isActive: "all" }),
  });

  return (
    <div>
      <h2>Fee Structures</h2>

      <p>
        <Link to="/admin/fees/structures/new">+ New Fee Structure</Link>
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 200 }}>
          <LabeledInput
            label="Academic Year"
            name="academicYear"
            value={filters.academicYear}
            onChange={handleFilterChange}
          />
        </div>
        <div style={{ width: 200 }}>
          <LabeledInput
            label="Class"
            name="className"
            value={filters.className}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p style={{ color: "red" }}>Could not load fee structures: {error.message}</p>}

      {data && (
        data.length === 0 ? (
          <p>No fee structures match these filters.</p>
        ) : (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Academic Year</th>
                <th>Class</th>
                <th>Board</th>
                <th>Monthly Total</th>
                <th>Due Day</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((feeStructure) => (
                <tr key={feeStructure._id}>
                  <td>{feeStructure.academicYear}</td>
                  <td>{feeStructure.className}</td>
                  <td>{feeStructure.board || "All boards"}</td>
                  <td>{feeStructure.monthlyTotal}</td>
                  <td>{feeStructure.dueDayOfMonth ?? "-"}</td>
                  <td>{feeStructure.isActive ? "active" : "inactive"}</td>
                  <td>
                    <Link to={`/admin/fees/structures/${feeStructure._id}`}>View</Link>
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
