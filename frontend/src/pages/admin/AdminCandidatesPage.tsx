import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { Candidate } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    platformApi.getAdminCandidates().then(setCandidates);
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Quản trị thợ"
        title="Chất lượng thợ và trạng thái tài khoản"
        description="Màn hình riêng để kiểm tra xác minh, năng lực phục vụ và số lượt ứng tuyển."
      />

      <Surface title="Tài khoản thợ dịch vụ" subtitle="Dữ liệu từ hệ thống quản trị">
        <div className="table-like">
          {candidates.map((item) => (
            <div key={item.code} className="table-row">
              <span>
                <strong>{viText(item.name)}</strong>
                <small>{viText(item.headline)}</small>
              </span>
              <span>{item.totalApplications} lượt ứng tuyển</span>
              <span>{item.rating.toFixed(1)} điểm đánh giá</span>
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
