import { useEffect, useMemo, useState } from "react";
import { DEMO_CANDIDATE_CODE } from "../../config";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { Job, JobDetail } from "../../types/platform";

export default function UserJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    platformApi.getUserJobs().then(setJobs).catch((reason: Error) => setFeedback(reason.message));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.categoryName).filter(Boolean))) as string[],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch = normalized
        ? [job.title, job.location, job.summary, job.companyName ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(normalized)
        : true;
      const matchesCategory = category ? job.categoryName === category : true;
      return matchesSearch && matchesCategory;
    });
  }, [category, jobs, search]);

  const openJobDetail = async (jobCode: string) => {
    const detail = await platformApi.getUserJobDetail(jobCode);
    setSelectedJob(detail);
  };

  const applyToJob = async (jobCode: string) => {
    try {
      await platformApi.createUserApplication({
        jobCode,
        candidateCode: DEMO_CANDIDATE_CODE,
        note: "Ung tuyen tu user portal"
      });
      setFeedback("Applied successfully.");
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Jobs"
        title="Approved jobs for the user side"
        description="Search by location, compare budgets and apply directly through the API."
      />

      <Surface title="Filter jobs" subtitle="Client-side filtering on data returned from API">
        <div className="filter-row">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search jobs" />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </Surface>

      {feedback ? <p className="feedback">{feedback}</p> : null}

      <Surface title="Live opportunities" subtitle="Each card is already wired to backend create-application flow">
        <div className="list-stack">
          {filteredJobs.map((job) => (
            <article key={job.code} className="job-card">
              <div className="job-card-main">
                <div>
                  <div className="stack-inline">
                    <h3>{job.title}</h3>
                    <StatusBadge value={job.urgency} />
                  </div>
                  <p>{job.companyName}</p>
                  <small>
                    {job.categoryName} · {job.location}
                  </small>
                </div>
                <strong>{job.salaryLabel}</strong>
              </div>
              <p>{job.summary}</p>
              <div className="action-row">
                <button className="button secondary" onClick={() => openJobDetail(job.code)}>
                  Details
                </button>
                <button className="button primary" onClick={() => applyToJob(job.code)}>
                  Apply
                </button>
              </div>
            </article>
          ))}
        </div>
      </Surface>

      {selectedJob ? (
        <Surface title={selectedJob.title} subtitle={selectedJob.companyName}>
          <div className="detail-grid">
            <div>
              <span className="detail-label">Budget</span>
              <p>{selectedJob.salaryLabel}</p>
            </div>
            <div>
              <span className="detail-label">Start date</span>
              <p>{new Date(selectedJob.startDate).toLocaleString()}</p>
            </div>
            <div>
              <span className="detail-label">Service areas</span>
              <p>{selectedJob.serviceAreas.join(", ")}</p>
            </div>
            <div>
              <span className="detail-label">Applications</span>
              <p>{selectedJob.applicationsCount}</p>
            </div>
          </div>
          <div className="requirements-list">
            {selectedJob.requirements.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Surface>
      ) : null}
    </div>
  );
}
