// Screen 2: Pending Registrations.
// Shows the queue of registrations waiting for Management to approve or
// reject. Aadhaar is never requested here, so it's never on screen.

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRegistrations } from "../../../shared/api.js";

export default function RegistrationList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["registrations", { status: "pending" }],
    queryFn: () => getRegistrations({ status: "pending" }),
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p style={{ color: "red" }}>Could not load registrations: {error.message}</p>;

  return (
    <div>
      <h2>Pending Registrations</h2>

      {data.length === 0 ? (
        <p>There are no pending registrations right now.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Reg. No.</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Father's Name</th>
              <th>Contact No.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((registration) => (
              <tr key={registration._id}>
                <td>{registration.registrationNo}</td>
                <td>{registration.studentName}</td>
                <td>{registration.class}</td>
                <td>{registration.fatherName}</td>
                <td>{registration.fatherContact1}</td>
                <td>
                  <Link to={`/admin/registrations/${registration._id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
