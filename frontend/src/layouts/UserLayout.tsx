import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ServiceIcons } from "../assets/service-icons";

const AUTH_STORAGE_KEY = "homeswift_user";

const links = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/user/jobs", label: "Dịch vụ" },
  { to: "/help", label: "Trợ giúp" },
  { to: "/about", label: "Về chúng tôi" },
  { to: "/partner", label: "Trở thành đối tác" },
  { to: "/login", label: "Đăng nhập", authOnly: false },
  { to: "/booking", label: "Đặt lịch ngay" }
];

type StoredUser = {
  name: string;
  avatar: string;
};

function readStoredUser() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export default function UserLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(() => readStoredUser());

  useEffect(() => {
    const syncUser = () => setUser(readStoredUser());
    window.addEventListener("storage", syncUser);
    window.addEventListener("homeswift-auth", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("homeswift-auth", syncUser);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event("homeswift-auth"));
    setUser(null);
    navigate("/");
  };

  return (
    <div className="app-frame shell-user">
      <header className="topbar">
        <NavLink to="/" end className="brand-mark">
          <ServiceIcons.home size={28} className="brand-icon-svg" />
          <strong>Viec<span>Nhanh</span></strong>
        </NavLink>
        <nav className="nav-stack">
          {links.map((link, index) => {
            if (user && link.to === "/login") {
              return null;
            }

            return (
              <NavLink key={`${link.to}-${index}`} to={link.to} end={link.end} className="nav-link">
                {link.label}
              </NavLink>
            );
          })}
          {user ? (
            <div className="profile-actions">
              <button className="notification-button" type="button" aria-label="Thông báo">
                <span />
              </button>
              <NavLink to="/user/workspace" className="profile-avatar-link" aria-label="Mở hồ sơ cá nhân">
                <img src={user.avatar} alt={user.name} />
              </NavLink>
              <button className="button secondary header-logout-button" type="button" onClick={logout}>
                Đăng xuất
              </button>
            </div>
          ) : null}
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
