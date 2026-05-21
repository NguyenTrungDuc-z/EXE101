import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { MetricTile, PageIntro, Surface, StatusBadge } from "../../components/ui";
import type { AdminOverview } from "../../types/platform";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);

  useEffect(() => {
    platformApi.getAdminOverview().then(setData);
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin"
        title="Operations dashboard"
        description="Clear split for admin: overview, queues and recent marketplace activity."
      />

      <div className="metric-grid">
        {data?.cards.map((card, index) => (
          <MetricTile
            key={card.label}
            label={card.label}
            value={card.value}
            accent={index % 3 === 1 ? "teal" : index % 3 === 2 ? "blue" : "orange"}
          />
        ))}
      </div>

      <Surface title="Queues" subtitle="Operational backlog that the admin team must process">
        <div className="card-grid">
          {data?.queues.map((queue) => (
            <article key={queue.label} className="mini-card">
              <h3>{queue.label}</h3>
              <strong>{queue.value}</strong>
              <small>SLA {queue.sla}</small>
            </article>
          ))}
        </div>
      </Surface>

      <Surface title="Recent jobs" subtitle="Newest jobs entering the platform">
        <div className="table-like">
          {data?.recentJobs.map((job) => (
            <div key={job.code} className="table-row">
              <span>
                <strong>{job.title}</strong>
                <small>{job.location}</small>
              </span>
              <span>{job.salaryLabel}</span>
              <StatusBadge value={job.status} />
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
