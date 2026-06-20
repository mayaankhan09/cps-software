// This file wires up all the pages (screens) to their URLs. React Router
// reads this list and renders whichever screen matches the current URL.

import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./portals/admin/AdminLayout.jsx";
import RegistrationForm from "./portals/admin/students/RegistrationForm.jsx";
import RegistrationList from "./portals/admin/students/RegistrationList.jsx";
import RegistrationDetail from "./portals/admin/students/RegistrationDetail.jsx";
import StudentList from "./portals/admin/students/StudentList.jsx";
import StudentDetail from "./portals/admin/students/StudentDetail.jsx";
import StaffForm from "./portals/admin/staff/StaffForm.jsx";
import StaffList from "./portals/admin/staff/StaffList.jsx";
import StaffDetail from "./portals/admin/staff/StaffDetail.jsx";

function App() {
  return (
    <Routes>
      {/* Visiting the site root just takes you to the registrations list. */}
      <Route path="/" element={<Navigate to="/admin/registrations" replace />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="registrations/new" element={<RegistrationForm />} />
        <Route path="registrations" element={<RegistrationList />} />
        <Route path="registrations/:id" element={<RegistrationDetail />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="staff/new" element={<StaffForm />} />
        <Route path="staff" element={<StaffList />} />
        <Route path="staff/:id" element={<StaffDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
