// This file wires up all the pages (screens) to their URLs. React Router
// reads this list and renders whichever screen matches the current URL.

import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./portals/admin/AdminLayout.jsx";
import RegistrationForm from "./portals/admin/students/RegistrationForm.jsx";
import RegistrationList from "./portals/admin/students/RegistrationList.jsx";
import RegistrationDetail from "./portals/admin/students/RegistrationDetail.jsx";
import StudentList from "./portals/admin/students/StudentList.jsx";
import StudentDetail from "./portals/admin/students/StudentDetail.jsx";

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
      </Route>
    </Routes>
  );
}

export default App;
