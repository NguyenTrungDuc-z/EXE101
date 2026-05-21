import { useEffect, useState } from "react";
import { MetricTile, PageIntro, Surface, StatusBadge } from "../../components/ui";
import { platformApi } from "../../api/platformApi";
import type { UserHome } from "../../types/platform";

export default function UserHomePage() {
  const [data, setData] = useState<UserHome | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    platformApi
      .getUserHome()
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="User portal"
        title="Marketplace view for jobs and delivery"
        description="This side is for browsing live jobs, tracking applications and creating new requests."
      />

      {error ? <p className="feedback error">{error}</p> : null}

      <div className="metric-grid">
        <MetricTile label="Open jobs" value={data?.hero.totalOpenJobs ?? "..."} />
        <MetricTile label="Employers" value={data?.hero.totalEmployers ?? "..."} accent="teal" />
        <MetricTile label="Candidates" value={data?.hero.totalCandidates ?? "..."} accent="blue" />
        <MetricTile label="Active orders" value={data?.hero.activeOrders ?? "..."} accent="teal" />
      </div>

      <Surface title="Top categories" subtitle="Service lines currently active on the marketplace">
        <div className="card-grid">
          {data?.categories.map((category) => (
            <article key={category.code} className="mini-card">
              <div className="mini-card-head">
                <h3>{category.name}</h3>
                <StatusBadge value={String(category.openJobs ?? 0)} />
              </div>
              <p>{category.averageBudgetLabel}</p>
              <small>{category.serviceType}</small>
            </article>
          ))}
        </div>
      </Surface>

      <Surface title="Featured jobs" subtitle="Latest approved jobs visible to end users">
        <div className="list-stack">
          {data?.featuredJobs.map((job) => (
            <article key={job.code} className="list-card">
              <div>
                <h3>{job.title}</h3>
                <p>{job.location}</p>
              </div>
              <div className="list-meta">
                <strong>{job.salaryLabel}</strong>
                <StatusBadge value={job.status} />
              </div>
            </article>
          ))}
        </div>
      </Surface>
    </div>
  );
}
