// Screen: Unpaid Dues list.

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUnpaidDues } from "../../../shared/api.js";
import { LabeledInput } from "../../../shared/FormFields.jsx";
import DuesTable from "./DuesTable.jsx";

export default function UnpaidDuesList() {
  const [filters, setFilters] = useState({ className: "", month: "" });

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fee-dues-unpaid", filters],
    queryFn: () => getUnpaidDues(filters),
  });

  return (
    <div>
      <h2>Unpaid Dues</h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 200 }}>
          <LabeledInput label="Class" name="className" value={filters.className} onChange={handleFilterChange} />
        </div>
        <div style={{ width: 200 }}>
          <LabeledInput label="Month" name="month" type="month" value={filters.month} onChange={handleFilterChange} />
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p style={{ color: "red" }}>Could not load unpaid dues: {error.message}</p>}
      {data && <DuesTable dues={data} />}
    </div>
  );
}
