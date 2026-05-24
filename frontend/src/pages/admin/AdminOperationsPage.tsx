import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { OperationsResponse } from "../../types/platform";

export default function AdminOperationsPage() {
  const [data, setData] = useState<OperationsResponse | null>(null);

  useEffect(() => {
    platformApi.getAdminOperations().then(setData);
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Quản trị vận hành"
        title="Tác vụ vận hành và cảnh báo"
        description="Màn hình tách riêng phiếu vận hành, khiếu nại và các hồ sơ đang chờ duyệt."
      />

      <Surface title="Tác vụ vận hành" subtitle="Dữ liệu từ GET /api/admin/operations">
        <div className="table-like">
          {data?.tasks.map((task) => (
            <div key={task.code} className="table-row">
              <span>
                <strong>{task.title}</strong>
                <small>
                  {task.ownerTeam} · {task.relatedCode}
                </small>
              </span>
              <span>{task.slaHours} giờ SLA</span>
              <div className="stack-inline">
                <StatusBadge value={task.status} />
                <StatusBadge value={task.priority} />
              </div>
            </div>
          ))}
        </div>
      </Surface>

      <div className="card-grid">
        <Surface title="Yêu cầu chờ duyệt" subtitle="Các mục đang đợi kiểm duyệt">
          <div className="list-stack compact">
            {data?.alerts.pendingJobs.map((item) => (
              <article key={item.code} className="mini-card">
                <h3>{item.title}</h3>
                <small>{item.code}</small>
              </article>
            ))}
          </div>
        </Surface>

        <Surface title="Duyệt KYC" subtitle="Tài khoản khách hàng đang chờ kiểm tra">
          <div className="list-stack compact">
            {data?.alerts.reviewEmployers.map((item) => (
              <article key={item.code} className="mini-card">
                <h3>{item.title}</h3>
                <small>{item.code}</small>
              </article>
            ))}
          </div>
        </Surface>
      </div>

      <Surface title="Khiếu nại" subtitle="Phiếu người dùng được tách khỏi tác vụ vận hành nội bộ">
        <div className="table-like">
          {data?.alerts.complaints.map((complaint) => (
            <div key={complaint.code} className="table-row">
              <span>
                <strong>{complaint.type}</strong>
                <small>{complaint.message}</small>
              </span>
              <span>{complaint.targetCode}</span>
              <StatusBadge value={complaint.status} />
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
