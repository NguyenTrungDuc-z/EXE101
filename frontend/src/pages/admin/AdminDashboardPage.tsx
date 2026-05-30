import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { MetricTile, PageIntro, Surface, StatusBadge } from "../../components/ui";
import type { AdminOverview } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

const dashboardLabels: Record<string, string> = {
  "Nguoi dung": "Người dùng",
  "Nha tuyen dung": "Khách hàng",
  "Ung vien": "Thợ dịch vụ",
  "Bai dang": "Yêu cầu",
  "Doanh thu da thanh toan": "Doanh thu đã thanh toán"
};

const queueLabels: Record<string, string> = {
  "Pending jobs": "Yêu cầu chờ duyệt",
  "KYC review": "Duyệt KYC",
  "Open complaints": "Khiếu nại đang mở",
  "Active orders": "Đơn đang xử lý"
};

const slaLabels: Record<string, string> = {
  "same day": "trong ngày"
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);

  useEffect(() => {
    platformApi.getAdminOverview().then(setData);
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Quản trị"
        title="Bảng điều phối vận hành"
        description="Tách rõ tổng quan, hàng chờ xử lý và hoạt động mới nhất trên nền tảng."
      />

      <div className="metric-grid">
        {data?.cards.map((card, index) => (
          <MetricTile
            key={card.label}
            label={dashboardLabels[card.label] ?? card.label}
            value={card.value}
            accent={index % 3 === 1 ? "teal" : index % 3 === 2 ? "blue" : "orange"}
          />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        <Surface title="Hàng chờ" subtitle="Các đầu việc vận hành đội quản trị cần xử lý">
          <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {data?.queues.map((queue) => (
              <article key={queue.label} className="mini-card">
                <h3>{queueLabels[queue.label] ?? queue.label}</h3>
                <strong>{queue.value}</strong>
                <small>Cam kết xử lý {slaLabels[queue.sla] ?? queue.sla}</small>
              </article>
            ))}
          </div>
        </Surface>

        <Surface title="Yêu cầu mới" subtitle="Các yêu cầu mới nhất đi vào nền tảng">
          <div className="table-like">
            {data?.recentJobs.map((job) => (
              <div key={job.code} className="table-row">
                <span>
                  <strong>{viText(job.title)}</strong>
                  <small>{viText(job.location)}</small>
                </span>
                <span>{viText(job.salaryLabel)}</span>
                <StatusBadge value={job.status} />
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}
