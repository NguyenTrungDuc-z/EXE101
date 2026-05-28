import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "Tổng quan", end: true },
  { to: "/admin/jobs", label: "Yêu cầu" },
  { to: "/admin/employers", label: "Khách hàng" },
  { to: "/admin/candidates", label: "Thợ dịch vụ" },
  { to: "/admin/operations", label: "Vận hành" }
];

export default function AdminLayout() {
  return (
    <div className="app-frame shell-admin">
      <header className="topbar">
        <NavLink to="/admin" end className="brand-mark">
          <span className="brand-icon" aria-hidden="true" />
          <strong>Home<span>Swift</span> Vận hành</strong>
        </NavLink>
        <nav className="nav-stack">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
