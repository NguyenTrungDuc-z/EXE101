import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { Employer } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);

  useEffect(() => {
    platformApi.getAdminEmployers().then(setEmployers);
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Quản trị khách hàng"
        title="Quản lý khách hàng và xác minh KYC"
        description="Màn hình kiểm tra hồ sơ, gói sử dụng và khu vực cung cấp dịch vụ."
      />

      <Surface title="Tài khoản khách hàng" subtitle="Dữ liệu từ hệ thống quản trị">
        <div className="table-like">
          {employers.map((item) => (
            <div key={item.code} className="table-row">
              <span>
                <strong>{viText(item.companyName)}</strong>
                <small>
                  {viText(item.name)} · {viText(item.city)}
                </small>
              </span>
              <span>{item.totalJobs} yêu cầu</span>
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
