import data from "../data/db.json";
import ScreenHeader from "../components/ScreenHeader";
import { statusClass, Status, statusLabel } from "../utils/helpers";

export default function ReportsScreen() {
  return (
    <div className="screen">
      <ScreenHeader
        eyebrow="Báo cáo"
        title="Báo cáo bài đăng"
        subtitle="Tổng hợp báo cáo và xử lý bài đăng vi phạm."
      />

      <div className="card table-card">
        <div className="table">
          <div className="table-row table-head reports-grid">
            <span>Người báo cáo</span>
            <span>Bài đăng</span>
            <span>Lý do</span>
            <span>Ngày</span>
            <span>Trạng thái</span>
            <span>Hành động</span>
          </div>
          {data.userReports.map((report) => (
            <div key={report.id} className="table-row reports-grid">
              <span>
                <strong>{report.reporter}</strong>
                <small>{report.id}</small>
              </span>
              <span>{report.jobReported}</span>
              <span>{report.reason}</span>
              <span>{report.date}</span>
              <span className={statusClass(report.status as Status)}>{statusLabel(report.status as Status)}</span>
              <span className="table-actions">
                <button className="link">Xem báo cáo</button>
                <button className="link danger">Gỡ bài</button>
                <button className="link muted">Bỏ qua</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
