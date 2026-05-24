import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MetricTile, Surface, StatusBadge } from "../../components/ui";
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
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>Dịch vụ gia đình tin cậy, đặt lịch tức thì</h1>
          <p>Đặt thợ vệ sinh, kỹ thuật máy lạnh và sửa chữa tại nhà với giá rõ ràng, theo dõi tiến độ trực tiếp.</p>
        </div>
        <form className="hero-search-panel" onSubmit={handleSearchSubmit}>
          <select aria-label="Chọn dịch vụ" defaultValue="">
            <option value="" disabled>Chọn dịch vụ</option>
            {data?.categories.map((category) => (
              <option key={category.code} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập khu vực"
          />
          <button type="submit" className="button primary search-btn">
            Tìm kiếm
          </button>
        </form>
      </section>

      {error ? <p className="feedback error">{error}</p> : null}

      <div className="metric-grid">
        <MetricTile label="Dịch vụ đang mở" value={data?.hero.totalOpenJobs ?? "..."} />
        <MetricTile label="Khách hàng tin cậy" value={data?.hero.totalEmployers ?? "..."} accent="teal" />
        <MetricTile label="Thợ đã xác minh" value={data?.hero.totalCandidates ?? "..."} accent="blue" />
        <MetricTile label="Đơn đang xử lý" value={data?.hero.activeOrders ?? "..."} accent="teal" />
      </div>

      <Surface title="Dịch vụ phổ biến" subtitle="Các lựa chọn nhanh cho nhu cầu chăm sóc nhà cửa thường gặp">
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
                Đặt ngay &rarr;
              </div>
            </article>
          ))}
        </div>
      </Surface>

      <Surface title="Yêu cầu đề xuất" subtitle="Các yêu cầu dịch vụ đang sẵn sàng ghép thợ">
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
                  Xem chi tiết &rarr;
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
