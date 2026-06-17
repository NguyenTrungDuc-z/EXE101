import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  UserCircle, 
  BarChart3, 
  Settings, 
  Search, 
  Bell, 
  Zap,
  ShieldCheck
} from "lucide-react";

interface AdminLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  section: string;
  badge?: string | number;
}

const links: AdminLink[] = [
  { to: "/admin", label: "Bảng điều khiển", icon: <LayoutDashboard size={20} />, end: true, section: "CHÍNH" },
  { to: "/admin/jobs", label: "Đơn hàng", icon: <ShoppingBag size={20} />, section: "CHÍNH" },
  { to: "/admin/users", label: "Phân quyền tài khoản", icon: <ShieldCheck size={20} />, section: "CHÍNH" },
  { to: "/admin/candidates", label: "Thợ dịch vụ", icon: <Users size={20} />, section: "ĐỐI TÁC & KHÁCH" },
  { to: "/admin/employers", label: "Khách hàng", icon: <UserCircle size={20} />, section: "ĐỐI TÁC & KHÁCH" },
  { to: "/admin/reports", label: "Báo cáo doanh thu", icon: <BarChart3 size={20} />, section: "PHÂN TÍCH" },
  { to: "/admin/settings", label: "Cài đặt hệ thống", icon: <Settings size={20} />, section: "PHÂN TÍCH" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const sections = ["CHÍNH", "ĐỐI TÁC & KHÁCH", "PHÂN TÍCH"];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: "280px", 
        background: "white", 
        borderRight: "1px solid #E2E8F0", 
        display: "flex", 
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        zIndex: 100
      }}>
        <div style={{ padding: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            background: "#0066FF", 
            borderRadius: "12px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "white",
            boxShadow: "0 8px 16px rgba(0, 102, 255, 0.2)"
          }}>
            <Zap size={24} fill="currentColor" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#1E293B", lineHeight: 1 }}>ViecNhanh</span>
            
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 16px", overflowY: "auto" }}>
          {sections.map(section => (
            <div key={section} style={{ marginBottom: "24px" }}>
              <h3 style={{ 
                padding: "0 16px", 
                fontSize: "11px", 
                fontWeight: 700, 
                color: "#94A3B8", 
                textTransform: "uppercase", 
                letterSpacing: "0.1em",
                marginBottom: "12px"
              }}>
                {section}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {links.filter(l => l.section === section).map((link) => (
                  <NavLink 
                    key={link.to} 
                    to={link.to} 
                    end={link.end} 
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      background: isActive ? "#0066FF" : "transparent",
                      color: isActive ? "white" : "#64748B",
                      boxShadow: isActive ? "0 4px 12px rgba(0, 102, 255, 0.15)" : "none",
                      fontWeight: 600,
                      fontSize: "15px"
                    })}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {link.icon}
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span style={{ 
                        fontSize: "11px", 
                        fontWeight: 700, 
                        padding: "2px 8px", 
                        borderRadius: "999px",
                        background: location.pathname === link.to ? "rgba(255,255,255,0.2)" : "#EFF6FF",
                        color: location.pathname === link.to ? "white" : "#0066FF"
                      }}>
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ padding: "24px" }}>
          <div style={{ 
            background: "#F1F5F9", 
            borderRadius: "20px", 
            padding: "20px", 
            position: "relative", 
            overflow: "hidden" 
          }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ 
                  width: "24px", 
                  height: "24px", 
                  background: "white", 
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}>
                  <Zap size={12} color="#0066FF" fill="currentColor" />
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B" }}>Gói Pro Hạn Lâu</span>
              </div>
              <button style={{ 
                width: "100%", 
                padding: "10px", 
                background: "#0066FF", 
                color: "white", 
                border: "none", 
                borderRadius: "12px", 
                fontSize: "13px", 
                fontWeight: 700, 
                cursor: "pointer",
                boxShadow: "0 4px 8px rgba(0, 102, 255, 0.2)"
              }}>
                Nâng cấp
              </button>
            </div>
            <div style={{ 
              position: "absolute", 
              right: "-20px", 
              bottom: "-20px", 
              width: "80px", 
              height: "80px", 
              background: "rgba(0, 102, 255, 0.05)", 
              borderRadius: "50%" 
            }} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: "280px", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{ 
          height: "80px", 
          background: "rgba(255, 255, 255, 0.8)", 
          backdropFilter: "blur(12px)", 
          borderBottom: "1px solid #E2E8F0", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "0 40px",
          position: "sticky",
          top: 0,
          zIndex: 90
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            background: "#F1F5F9", 
            borderRadius: "16px", 
            padding: "0 16px", 
            width: "500px",
            height: "48px"
          }}>
            <Search size={20} color="#94A3B8" style={{ marginRight: "12px" }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm dịch vụ, khách hàng hoặc thợ..." 
              style={{ 
                background: "transparent", 
                border: "none", 
                outline: "none", 
                width: "100%", 
                fontSize: "15px",
                color: "#1E293B"
              }} 
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button style={{ 
              background: "transparent", 
              border: "none", 
              color: "#64748B", 
              cursor: "pointer",
              position: "relative",
              padding: "8px"
            }}>
              <Bell size={22} />
              <span style={{ 
                position: "absolute", 
                top: "8px", 
                right: "8px", 
                width: "8px", 
                height: "8px", 
                background: "#EF4444", 
                borderRadius: "50%", 
                border: "2px solid white" 
              }} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", borderLeft: "1px solid #E2E8F0", paddingLeft: "24px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B" }}>Admin User</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>Quản trị viên</div>
              </div>
              <div style={{ position: "relative" }}>
                <img 
                  src="https://i.pravatar.cc/150?u=admin" 
                  alt="Admin" 
                  style={{ width: "44px", height: "44px", borderRadius: "16px", objectFit: "cover", border: "2px solid white", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }} 
                />
                <div style={{ 
                  position: "absolute", 
                  bottom: "-2px", 
                  right: "-2px", 
                  width: "14px", 
                  height: "14px", 
                  background: "#22C55E", 
                  borderRadius: "50%", 
                  border: "2px solid white" 
                }} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "40px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}