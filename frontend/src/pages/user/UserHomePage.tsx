import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MetricTile, PageIntro, Surface, StatusBadge } from "../../components/ui";
import { platformApi } from "../../api/platformApi";
import type { UserHome } from "../../types/platform";

export default function UserHomePage() {
  const [data, setData] = useState<UserHome | null>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    platformApi
      .getUserHome()
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/user/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="User portal"
        title="Marketplace view for jobs and delivery"
        description="This side is for browsing live jobs, tracking applications and creating new requests."
      />

      {error ? <p className="feedback error">{error}</p> : null}

      <Surface title="Quick Job Search" subtitle="Search across all live opportunities instantly">
        <form className="hero-search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Enter keywords (e.g. Delivery, Cleaner, Shipper...)" 
              className="search-input"
            />
          </div>
          <button type="submit" className="button primary search-btn">Search Jobs</button>
        </form>
      </Surface>

      <div className="metric-grid">
        <MetricTile label="Open jobs" value={data?.hero.totalOpenJobs ?? "..."} />
        <MetricTile label="Employers" value={data?.hero.totalEmployers ?? "..."} accent="teal" />
        <MetricTile label="Candidates" value={data?.hero.totalCandidates ?? "..."} accent="blue" />
        <MetricTile label="Active orders" value={data?.hero.activeOrders ?? "..."} accent="teal" />
      </div>

      <Surface title="Top categories" subtitle="Service lines currently active on the marketplace">
        <div className="card-grid">
          {data?.categories.map((category) => (
            <article 
              key={category.code} 
              className="mini-card interactive"
              onClick={() => navigate(`/user/jobs?categoryName=${encodeURIComponent(category.name)}`)}
            >
              <div className="mini-card-head">
                <h3>{category.name}</h3>
                <StatusBadge value={String(category.openJobs ?? 0)} />
              </div>
              <p>{category.averageBudgetLabel}</p>
              <small>{category.serviceType}</small>
              <div className="card-action-indicator">
                Browse jobs &rarr;
              </div>
            </article>
          ))}
        </div>
      </Surface>

      <Surface title="Featured jobs" subtitle="Latest approved jobs visible to end users">
        <div className="list-stack">
          {data?.featuredJobs.map((job) => (
            <article 
              key={job.code} 
              className="list-card interactive"
              onClick={() => navigate(`/user/jobs?jobCode=${job.code}`)}
            >
              <div>
                <h3>{job.title}</h3>
                <p>{job.location}</p>
                <div className="card-action-indicator">
                  View details &rarr;
                </div>
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
