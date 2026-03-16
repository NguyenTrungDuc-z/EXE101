import { useMemo } from "react";
import data from "../data/db.json";
import ScreenHeader from "../components/ScreenHeader";
import { statusClass, Status, statusLabel } from "../utils/helpers";

export default function OrdersScreen() {
  const jobMap = useMemo(() => new Map(data.jobs.map((job) => [job.id, job])), []);

  return (
    <div className="screen">
      <ScreenHeader
        eyebrow="Đơn đặt việc"
        title="Danh sách đơn ứng tuyển"
        subtitle="Theo dõi đơn đặt việc và quy trình duyệt nhanh."
      />

      <div className="card table-card">
        <div className="table">
          <div className="table-row table-head orders-grid">
            <span>Ứng viên</span>
            <span>Vị trí</span>
            <span>Nhà tuyển dụng</span>
            <span>Ngày ứng tuyển</span>
            <span>Trạng thái</span>
            <span>Quản lý</span>
          </div>
          {data.applications.map((item) => {
            const job = jobMap.get(item.jobId);
            return (
              <div key={item.id} className="table-row orders-grid">
                <span>
                  <strong>{item.candidate}</strong>
                  <small>{item.id}</small>
                </span>
                <span>{job?.title ?? item.jobId}</span>
                <span>{job?.employer ?? "-"}</span>
                <span>{item.appliedAt.split(" ")[0]}</span>
                <span className={statusClass(item.status as Status)}>{statusLabel(item.status as Status)}</span>
                <span className="table-actions">
                  <button className="link">Xem chi tiết</button>
                  <button className="link">Nhắc NTD</button>
                  <button className="link muted">Báo tranh chấp</button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
