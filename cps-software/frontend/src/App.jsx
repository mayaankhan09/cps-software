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
import FeeStructureForm from "./portals/admin/fees/FeeStructureForm.jsx";
import FeeStructureList from "./portals/admin/fees/FeeStructureList.jsx";
import FeeStructureDetail from "./portals/admin/fees/FeeStructureDetail.jsx";
import GenerateDues from "./portals/admin/fees/GenerateDues.jsx";
import PayFees from "./portals/admin/fees/PayFees.jsx";
import UnpaidDuesList from "./portals/admin/fees/UnpaidDuesList.jsx";
import PaidDuesList from "./portals/admin/fees/PaidDuesList.jsx";
import OverdueDuesList from "./portals/admin/fees/OverdueDuesList.jsx";
import PaymentsList from "./portals/admin/fees/PaymentsList.jsx";
import PaymentDetail from "./portals/admin/fees/PaymentDetail.jsx";

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
        <Route path="fees/structures/new" element={<FeeStructureForm />} />
        <Route path="fees/structures" element={<FeeStructureList />} />
        <Route path="fees/structures/:id" element={<FeeStructureDetail />} />
        <Route path="fees/generate" element={<GenerateDues />} />
        <Route path="fees/pay" element={<PayFees />} />
        <Route path="fees/unpaid" element={<UnpaidDuesList />} />
        <Route path="fees/paid" element={<PaidDuesList />} />
        <Route path="fees/overdue" element={<OverdueDuesList />} />
        <Route path="fees/payments" element={<PaymentsList />} />
        <Route path="fees/payments/:id" element={<PaymentDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
