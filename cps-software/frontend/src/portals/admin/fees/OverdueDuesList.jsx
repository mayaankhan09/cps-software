// Screen: Overdue Dues list — unpaid dues that are already past their due
// date. No filters here, matching GET /api/fee-dues/overdue on the backend
// (it's meant to be a quick "what's actually late right now" view).

import { useQuery } from "@tanstack/react-query";
import { getOverdueDues } from "../../../shared/api.js";
import DuesTable from "./DuesTable.jsx";

export default function OverdueDuesList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fee-dues-overdue"],
    queryFn: getOverdueDues,
  });

  return (
    <div>
      <h2>Overdue Dues</h2>

      {isLoading && <p>Loading...</p>}
      {isError && <p style={{ color: "red" }}>Could not load overdue dues: {error.message}</p>}
      {data && <DuesTable dues={data} />}
    </div>
  );
}
