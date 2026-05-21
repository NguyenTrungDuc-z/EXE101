import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/jobs", label: "Jobs" },
  { to: "/admin/employers", label: "Employers" },
  { to: "/admin/candidates", label: "Candidates" },
  { to: "/admin/operations", label: "Operations" }
];

export default function AdminLayout() {
  return (
    <div className="shell shell-admin">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-kicker">Admin workspace</span>
          <h2>ViecNhanh Ops</h2>
          <p>Control tower for moderation, KYC and operational queues.</p>
        </div>
        <nav className="nav-stack">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
