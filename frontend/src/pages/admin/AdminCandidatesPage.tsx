import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { Candidate } from "../../types/platform";

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    platformApi.getAdminCandidates().then(setCandidates);
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin candidates"
        title="Candidate quality and account status"
        description="Separate admin view for worker verification, capacity and application volume."
      />

      <Surface title="Candidate accounts" subtitle="Result from GET /api/admin/candidates">
        <div className="table-like">
          {candidates.map((item) => (
            <div key={item.code} className="table-row">
              <span>
                <strong>{item.name}</strong>
                <small>{item.headline}</small>
              </span>
              <span>{item.totalApplications} applications</span>
              <span>{item.rating.toFixed(1)} rating</span>
              <div className="stack-inline">
                <StatusBadge value={item.availability} />
                <StatusBadge value={item.verified ? "verified" : "pending"} />
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
