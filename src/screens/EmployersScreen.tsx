import data from "../data/db.json";
import ScreenHeader from "../components/ScreenHeader";
import { slugify, statusClass, Status, statusLabel } from "../utils/helpers";

export default function EmployersScreen() {
  return (
    <div className="screen">
      <ScreenHeader
        eyebrow="Nhà tuyển dụng"
        title="Danh sách doanh nghiệp"
        subtitle="Quản lý doanh nghiệp, duyệt và xử lý phản hồi."
      />

      <div className="card table-card">
        <div className="table">
          <div className="table-row table-head employers-grid">
            <span>Tên doanh nghiệp</span>
            <span>Email</span>
            <span>Điện thoại</span>
            <span>Địa chỉ</span>
            <span>Bài đăng</span>
            <span>Trạng thái</span>
            <span>Hành động</span>
          </div>
          {data.employers.map((item) => {
            const email = `${slugify(item.name)}@company.vn`;
            const address = "TP.HCM";
            return (
              <div key={item.id} className="table-row employers-grid">
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.id}</small>
                </span>
                <span>{email}</span>
                <span>{item.phone}</span>
                <span>{address}</span>
                <span>{item.jobs}</span>
                <span className={statusClass(item.kyc as Status)}>{statusLabel(item.kyc as Status)}</span>
                <span className="table-actions">
                  <button className="link">Xem</button>
                  <button className="link">Duyệt</button>
                  <button className="link muted">Từ chối</button>
                  <button className="link danger">Khóa</button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
