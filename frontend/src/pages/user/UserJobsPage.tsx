import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const categoryParam = searchParams.get("categoryName") ?? "";
  const jobCodeParam = searchParams.get("jobCode") ?? "";

  useEffect(() => {
    platformApi.getUserJobs().then(setJobs).catch((reason: Error) => setFeedback(reason.message));
  }, []);

  // Sync state with URL search params on load or change
  useEffect(() => {
    setSearch(searchParam);
    setCategory(categoryParam);
  }, [searchParam, categoryParam]);

  // Open job detail if jobCode is present in the URL
  useEffect(() => {
    if (jobCodeParam) {
      openJobDetail(jobCodeParam, false);
    } else {
      setSelectedJob(null);
    }
  }, [jobCodeParam]);

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

  const openJobDetail = async (jobCode: string, updateUrl = true) => {
    try {
      const detail = await platformApi.getUserJobDetail(jobCode);
      setSelectedJob(detail);
      if (updateUrl) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("jobCode", jobCode);
        setSearchParams(newParams, { replace: true });
      }
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("categoryName", value);
    } else {
      newParams.delete("categoryName");
    }
    setSearchParams(newParams, { replace: true });
  };

  const applyToJob = async (jobCode: string) => {
    try {
      await platformApi.createUserApplication({
        jobCode,
        candidateCode: DEMO_CANDIDATE_CODE,
        note: "Ung tuyen tu user portal"
      });
      setFeedback("Đã nhận yêu cầu thành công.");
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Dịch vụ"
        title="Khám phá yêu cầu dịch vụ tại nhà"
        description="Tìm theo khu vực, so sánh ngân sách và xác nhận yêu cầu phù hợp."
      />

      <Surface title="Bộ lọc dịch vụ" subtitle="Lọc theo nhóm dịch vụ và khu vực để thu hẹp danh sách">
        <div className="filter-row">
          <input 
            value={search} 
            onChange={(event) => handleSearchChange(event.target.value)} 
            placeholder="Tìm dịch vụ hoặc khu vực" 
          />
          <select 
            value={category} 
            onChange={(event) => handleCategoryChange(event.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </Surface>

      {feedback ? <p className="feedback">{feedback}</p> : null}

      <Surface title="Đơn có thể nhận" subtitle="Danh sách đang kết nối với luồng máy chủ hiện tại">
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
                  Chi tiết
                </button>
                <button className="button primary" onClick={() => applyToJob(job.code)}>
                  Nhận đơn
                </button>
              </div>
            </article>
          ))}
        </div>
      </Surface>

      {selectedJob ? (
        <Surface 
          title={selectedJob.title} 
          subtitle={selectedJob.companyName}
          action={
            <button 
              className="button secondary" 
              onClick={() => {
                setSelectedJob(null);
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("jobCode");
                setSearchParams(newParams, { replace: true });
              }}
            >
              Đóng
            </button>
          }
        >
          <div className="detail-grid">
            <div>
              <span className="detail-label">Ngân sách</span>
              <p>{selectedJob.salaryLabel}</p>
            </div>
            <div>
              <span className="detail-label">Thời gian bắt đầu</span>
              <p>{new Date(selectedJob.startDate).toLocaleString()}</p>
            </div>
            <div>
              <span className="detail-label">Khu vực phục vụ</span>
              <p>{selectedJob.serviceAreas.join(", ")}</p>
            </div>
            <div>
              <span className="detail-label">Lượt đăng ký</span>
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
