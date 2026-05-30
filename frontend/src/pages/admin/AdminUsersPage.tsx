import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import { viText } from "../../utils/vietnameseText";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  const fetchUsers = () => {
    setError("");
    platformApi.getAdminUsers()
      .then(setUsers)
      .catch((err: any) => {
        // Xử lý các mã lỗi cụ thể
        if (err.status === 401) {
          setError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại bằng tài khoản Admin.");
        } else if (err.status === 403) {
          setError("Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản Admin.");
        } else if (err.status === 404) {
          setError("Không tìm thấy API endpoint. Vui lòng kiểm tra cấu hình Backend.");
        } else if (err.status === 500) {
          setError("Lỗi server. Vui lòng kiểm tra kết nối MongoDB hoặc xem log Backend.");
        } else {
          setError(err.message || "Có lỗi xảy ra khi tải danh sách người dùng.");
        }
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = (userCode: string, newRole: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn đổi vai trò sang ${newRole}?`)) {
      platformApi.updateUserRole(userCode, newRole).then(() => {
        fetchUsers();
      });
    }
  };

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Quản trị người dùng"
        title="Quản lý tài khoản và phân quyền"
        description="Màn hình quản lý tất cả người dùng trong hệ thống, cho phép thay đổi vai trò (Admin, Thợ, Người dùng)."
      />

      {error && (
        <div style={{
          padding: "16px",
          marginBottom: "16px",
          backgroundColor: "#fee2e2",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          color: "#991b1b"
        }}>
          <strong>⚠️ Lỗi:</strong> {error}
        </div>
      )}

      <Surface title="Danh sách người dùng" subtitle="Dữ liệu từ hệ thống quản trị">
        <div className="table-like">
          {users.length === 0 && !error && (
            <div style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>
              Đang tải dữ liệu...
            </div>
          )}
          {users.map((item) => (
            <div key={item.code} className="table-row">
              <span>
                <strong>{viText(item.name)}</strong>
                <small>
                  {item.phone} · {viText(item.city)}
                </small>
              </span>
              <span>{item.email}</span>
              <div className="stack-inline">
                <StatusBadge value={item.role} />
                <StatusBadge value={item.status} />
              </div>
              <div className="stack-inline">
                <select 
                  value={item.role} 
                  onChange={(e) => handleUpdateRole(item.code, e.target.value)}
                  className="select-sm"
                >
                  <option value="employer">Người dùng</option>
                  <option value="candidate">Thợ</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}