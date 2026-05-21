import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { Job } from "../../types/platform";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    platformApi.getAdminJobs().then(setJobs);
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin jobs"
        title="Moderation queue and live inventory"
        description="Admin sees more statuses than user side, including pending and rejected jobs."
      />

      <Surface title="Job inventory" subtitle="Result from GET /api/admin/jobs">
        <div className="table-like">
          {jobs.map((job) => (
            <div key={job.code} className="table-row">
              <span>
                <strong>{job.title}</strong>
                <small>
                  {job.companyName} · {job.categoryName}
                </small>
              </span>
              <span>{job.applicantsCount} applicants</span>
              <div className="stack-inline">
                <StatusBadge value={job.status} />
                <StatusBadge value={job.urgency} />
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
