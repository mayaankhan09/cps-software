// This is the shared layout for the whole admin portal: a simple navigation
// menu at the top, with whichever screen is currently selected rendered
// below it (that's what <Outlet /> does — it's a placeholder React Router
// fills in with the matching child route).

import { NavLink, Outlet } from "react-router-dom";

// Styles a nav link differently when it's the currently active page —
// nothing fancy, just enough to see where you are.
function navLinkStyle({ isActive }) {
  return { fontWeight: isActive ? "bold" : "normal", marginRight: 16 };
}

export default function AdminLayout() {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto", padding: 16 }}>
      {/* "app-chrome" is hidden by the @media print rule in index.css, so
          printing a receipt doesn't also print the title/nav around it. */}
      <div className="app-chrome">
        <h1>School Management System — Admin</h1>

        <nav style={{ marginBottom: 24, borderBottom: "1px solid #ccc", paddingBottom: 12 }}>
          <NavLink to="/admin/registrations/new" style={navLinkStyle}>
            New Registration
          </NavLink>
          <NavLink to="/admin/registrations" style={navLinkStyle}>
            Pending Registrations
          </NavLink>
          <NavLink to="/admin/students" style={navLinkStyle}>
            Students
          </NavLink>
          <NavLink to="/admin/staff/new" style={navLinkStyle}>
            New Staff
          </NavLink>
          <NavLink to="/admin/staff" style={navLinkStyle}>
            Staff
          </NavLink>
          <NavLink to="/admin/fees/structures/new" style={navLinkStyle}>
            New Fee Structure
          </NavLink>
          <NavLink to="/admin/fees/structures" style={navLinkStyle}>
            Fee Structures
          </NavLink>
          <NavLink to="/admin/fees/generate" style={navLinkStyle}>
            Generate Dues
          </NavLink>
          <NavLink to="/admin/fees/pay" style={navLinkStyle}>
            Pay Fees
          </NavLink>
          <NavLink to="/admin/fees/unpaid" style={navLinkStyle}>
            Unpaid Dues
          </NavLink>
          <NavLink to="/admin/fees/paid" style={navLinkStyle}>
            Paid Dues
          </NavLink>
          <NavLink to="/admin/fees/overdue" style={navLinkStyle}>
            Overdue Dues
          </NavLink>
          <NavLink to="/admin/fees/payments" style={navLinkStyle}>
            Payments
          </NavLink>
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
