import data from "../data/db.json";
import ScreenHeader from "../components/ScreenHeader";
import { statusClass, Status, statusLabel } from "../utils/helpers";

export default function ComplaintsScreen() {
  return (
    <div className="screen">
      <ScreenHeader
        eyebrow="Khiếu nại"
        title="Danh sách khiếu nại"
        subtitle="Theo dõi khiếu nại và xử lý hỗ trợ."
      />

      <div className="card table-card">
        <div className="table">
          <div className="table-row table-head complaints-grid">
            <span>Người dùng</span>
            <span>Loại</span>
            <span>Nội dung</span>
            <span>Ngày</span>
            <span>Trạng thái</span>
            <span>Hành động</span>
          </div>
          {data.complaints.map((complaint) => (
            <div key={complaint.id} className="table-row complaints-grid">
              <span>
                <strong>{complaint.user}</strong>
                <small>{complaint.id}</small>
              </span>
              <span>{complaint.type}</span>
              <span>{complaint.message}</span>
              <span>{complaint.date}</span>
              <span className={statusClass(complaint.status as Status)}>{statusLabel(complaint.status as Status)}</span>
              <span className="table-actions">
                <button className="link">Xem</button>
                <button className="link">Xử lý</button>
                <button className="link muted">Từ chối</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
