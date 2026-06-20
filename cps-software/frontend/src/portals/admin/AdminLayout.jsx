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
      </nav>

      <Outlet />
    </div>
  );
}
