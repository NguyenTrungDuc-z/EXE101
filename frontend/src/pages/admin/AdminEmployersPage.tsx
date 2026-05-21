import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { Employer } from "../../types/platform";

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);

  useEffect(() => {
    platformApi.getAdminEmployers().then(setEmployers);
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Admin employers"
        title="Employer and KYC management"
        description="Separate screen for company validation, package level and service coverage."
      />

      <Surface title="Employer accounts" subtitle="Result from GET /api/admin/employers">
        <div className="table-like">
          {employers.map((item) => (
            <div key={item.code} className="table-row">
              <span>
                <strong>{item.companyName}</strong>
                <small>
                  {item.name} · {item.city}
                </small>
              </span>
              <span>{item.totalJobs} jobs</span>
              <span>{item.walletBalance.toLocaleString()} VND</span>
              <div className="stack-inline">
                <StatusBadge value={item.kycStatus} />
                <StatusBadge value={item.packageName} />
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
