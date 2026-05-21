import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/user/jobs", label: "Jobs" },
  { to: "/user/workspace", label: "My workspace" },
  { to: "/user/post-job", label: "Post a job" }
];

export default function UserLayout() {
  return (
    <div className="shell shell-user">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-kicker">User workspace</span>
          <h2>ViecNhanh</h2>
          <p>Fast jobs marketplace for employers, workers and service operations.</p>
        </div>
        <nav className="nav-stack">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>Current demo roles</strong>
          <p>User side is wired for one employer and one candidate until auth is added.</p>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
