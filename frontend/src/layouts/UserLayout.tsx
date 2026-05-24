import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Dịch vụ", end: true },
  { to: "/user/jobs", label: "Khám phá" },
  { to: "/user/workspace", label: "Lịch sử" },
  { to: "/user/post-job", label: "Đặt ngay" }
];

export default function UserLayout() {
  return (
    <div className="app-frame shell-user">
      <header className="topbar">
        <NavLink to="/" end className="brand-mark">
          <span className="brand-icon">NN</span>
          <strong>Nhà<span>Nhanh</span></strong>
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
