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
        eyebrow="Admin operations"
        title="Operational tasks and alerts"
        description="This screen separates explicit ops tickets from raw complaints and pending reviews."
      />

      <Surface title="Operation tasks" subtitle="Result from GET /api/admin/operations">
        <div className="table-like">
          {data?.tasks.map((task) => (
            <div key={task.code} className="table-row">
              <span>
                <strong>{task.title}</strong>
                <small>
                  {task.ownerTeam} · {task.relatedCode}
                </small>
              </span>
              <span>{task.slaHours}h SLA</span>
              <div className="stack-inline">
                <StatusBadge value={task.status} />
                <StatusBadge value={task.priority} />
              </div>
            </div>
          ))}
        </div>
      </Surface>

      <div className="card-grid">
        <Surface title="Pending jobs" subtitle="Items waiting for moderation">
          <div className="list-stack compact">
            {data?.alerts.pendingJobs.map((item) => (
              <article key={item.code} className="mini-card">
                <h3>{item.title}</h3>
                <small>{item.code}</small>
              </article>
            ))}
          </div>
        </Surface>

        <Surface title="KYC review" subtitle="Employer accounts waiting for checks">
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

      <Surface title="Complaints" subtitle="User-facing tickets separated from internal ops tasks">
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
