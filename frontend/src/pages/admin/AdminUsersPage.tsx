import React, { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { 
  UserCircle, 
  ShieldCheck, 
  MoreVertical, 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { viText } from "../../utils/vietnameseText";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    setError("");
    platformApi.getAdminUsers()
      .then(setUsers)
      .catch((err: any) => {
        if (err.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError(err.message || "Có lỗi xảy ra khi tải danh sách người dùng.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = (userCode: string, newRole: string) => {
    platformApi.updateUserRole(userCode, newRole).then(() => {
      fetchUsers();
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      {/* Page Header */}
      <div>
        <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#0066FF", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>QUẢN TRỊ HỆ THỐNG</h3>
        <h1 style={{ fontSize: "40px", fontWeight: 850, color: "#1E293B", lineHeight: 1.1, marginBottom: "12px" }}>Phân quyền tài khoản</h1>
        <p style={{ fontSize: "17px", color: "#64748B", maxWidth: "800px", lineHeight: 1.6 }}>
          Quản lý danh sách người dùng, kiểm soát quyền truy cập và thay đổi vai trò (Admin, Thợ, Khách hàng) trong hệ thống.
        </p>
      </div>

      {error && (
        <div style={{ 
          padding: "20px", 
          background: "#FEF2F2", 
          border: "1px solid #FEE2E2", 
          borderRadius: "16px", 
          color: "#991B1B",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "15px",
          fontWeight: 600
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Users Table Container */}
      <div style={{ background: "white", padding: "32px", borderRadius: "32px", border: "1px solid #F1F5F9", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <div style={{ position: "relative", width: "400px" }}>
            <Search size={18} color="#94A3B8" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..." 
              style={{ 
                width: "100%", 
                padding: "12px 16px 12px 48px", 
                background: "#F1F5F9", 
                border: "none", 
                borderRadius: "12px", 
                fontSize: "14px", 
                outline: "none",
                color: "#1E293B"
              }} 
            />
          </div>
          <button style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "10px 20px", 
            background: "white", 
            color: "#64748B", 
            border: "1px solid #E2E8F0", 
            borderRadius: "12px", 
            fontSize: "14px", 
            fontWeight: 700, 
            cursor: "pointer" 
          }}>
            <Filter size={18} />
            Bộ lọc
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #F1F5F9" }}>
                <th style={{ padding: "0 0 20px 0", fontSize: "12px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>NGƯỜI DÙNG</th>
                <th style={{ padding: "0 0 20px 0", fontSize: "12px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>LIÊN HỆ</th>
                <th style={{ padding: "0 0 20px 0", fontSize: "12px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>VAI TRÒ HIỆN TẠI</th>
                <th style={{ padding: "0 0 20px 0", fontSize: "12px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>TRẠNG THÁI</th>
                <th style={{ padding: "0 0 20px 0", fontSize: "12px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right" }}>THAY ĐỔI QUYỀN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: "15px", fontWeight: 600 }}>
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.code} style={{ borderBottom: "1px solid #F8FAFC" }}>
                  <td style={{ padding: "24px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F1F5F9", color: "#0066FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: "#1E293B", marginBottom: "2px" }}>{viText(user.name)}</div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>Mã: {user.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "24px 0" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#1E293B", marginBottom: "2px" }}>{user.email}</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>{user.phone}</div>
                  </td>
                  <td style={{ padding: "24px 0" }}>
                    <span style={{ 
                      padding: "6px 16px", 
                      borderRadius: "8px", 
                      fontSize: "11px", 
                      fontWeight: 800, 
                      background: user.role === 'admin' ? "#F5F3FF" : user.role === 'worker' ? "#F0FDF4" : "#EFF6FF", 
                      color: user.role === 'admin' ? "#7C3AED" : user.role === 'worker' ? "#22C55E" : "#0066FF",
                      textTransform: "uppercase"
                    }}>
                      {user.role === 'admin' ? 'Quản trị viên' : user.role === 'worker' ? 'Thợ dịch vụ' : 'Khách hàng'}
                    </span>
                  </td>
                  <td style={{ padding: "24px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#22C55E", fontSize: "13px", fontWeight: 700 }}>
                      <CheckCircle2 size={16} />
                      Hoạt động
                    </div>
                  </td>
                  <td style={{ padding: "24px 0", textAlign: "right" }}>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleUpdateRole(user.code, e.target.value)}
                      style={{ 
                        padding: "8px 12px", 
                        borderRadius: "10px", 
                        border: "1px solid #E2E8F0", 
                        fontSize: "13px", 
                        fontWeight: 700, 
                        color: "#1E293B",
                        outline: "none",
                        cursor: "pointer",
                        background: "white"
                      }}
                    >
                      <option value="employer">Khách hàng</option>
                      <option value="worker">Thợ dịch vụ</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}