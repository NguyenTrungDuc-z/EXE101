import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/jobs", label: "Yêu cầu" },
  { to: "/admin/employers", label: "Khách hàng" },
  { to: "/admin/candidates", label: "Thợ dịch vụ" },
  { to: "/admin/operations", label: "Vận hành" },
  { to: "/admin/users", label: "Quản lý tài khoản" }
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("homeswift_user");
    if (!raw) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(raw);
      if (user.role !== "admin") {
        navigate("/");
        return;
      }
      setIsAuthorized(true);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  if (!isAuthorized) return null;

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
          <NavLink to="/" className="nav-link" style={{ marginLeft: "16px", background: "#f3f4f6", padding: "6px 12px", borderRadius: "6px" }}>
            ← Về trang chủ User
          </NavLink>
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
