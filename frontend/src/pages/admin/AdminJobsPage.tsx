import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { Job } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    platformApi.getAdminJobs().then(setJobs);
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Quản trị yêu cầu"
        title="Hàng chờ kiểm duyệt và danh sách đang mở"
        description="Quản trị viên theo dõi đầy đủ trạng thái, gồm chờ duyệt và bị từ chối."
      />

      <Surface title="Danh sách yêu cầu" subtitle="Dữ liệu từ hệ thống quản trị">
        <div className="table-like">
          {jobs.map((job) => (
            <div key={job.code} className="table-row">
              <span>
                <strong>{viText(job.title)}</strong>
                <small>
                  {viText(job.companyName)} · {viText(job.categoryName)}
                </small>
              </span>
              <span>{job.applicantsCount} lượt nhận</span>
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
