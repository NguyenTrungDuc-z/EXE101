import { ChangeEvent, useEffect, useMemo, useState } from "react";
import data from "../data/db.json";
import ScreenHeader from "../components/ScreenHeader";
import { statusClass, Status, statusLabel } from "../utils/helpers";

type Job = {
  id: string;
  title: string;
  category: string;
  location: string;
  pay: string;
  status: Status;
  postedAt: string;
  employer: string;
  slots?: number;
  priority?: string;
  notes?: string;
  images?: string[];
};

const JOBS_KEY = "job-posts";

const readStoredJobs = () => {
  if (typeof window === "undefined") return [] as Job[];
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (!raw) return [] as Job[];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Job[]) : ([] as Job[]);
  } catch {
    return [] as Job[];
  }
};

export default function JobPostsScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [employerFilter, setEmployerFilter] = useState("");
  const [page, setPage] = useState(1);
  const [extraJobs, setExtraJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState("");
  const pageSize = 5;

  useEffect(() => {
    setExtraJobs(readStoredJobs());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === JOBS_KEY) {
        setExtraJobs(readStoredJobs());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const allJobs = useMemo(() => {
    const seen = new Map<string, Job>();
    [...extraJobs, ...data.jobs].forEach((job) => {
      if (!seen.has(job.id)) {
        seen.set(job.id, { ...(job as Job), images: (job as Job).images ?? [] });
      }
    });
    return Array.from(seen.values());
  }, [extraJobs]);

  const employers = useMemo(
    () => Array.from(new Set(allJobs.map((job) => job.employer))),
    [allJobs]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(allJobs.map((job) => job.status))),
    [allJobs]
  );

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return allJobs.filter((job) => {
      const matchesStatus = statusFilter ? job.status === statusFilter : true;
      const matchesEmployer = employerFilter ? job.employer === employerFilter : true;
      const matchesSearch = normalizedSearch
        ? [job.title, job.id, job.employer, job.location, job.category]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;

      return matchesStatus && matchesEmployer && matchesSearch;
    });
  }, [allJobs, searchTerm, statusFilter, employerFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleEmployerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setEmployerFilter(event.target.value);
    setPage(1);
  };

  return (
    <div className="screen">
      <ScreenHeader
        eyebrow="Bài đăng"
        title="Bảng danh sách bài đăng"
        subtitle="Quản lý bài đăng, duyệt nhanh, lọc theo trạng thái."
      />

      {message && <p className="form-message">{message}</p>}

      <div className="filters">
        <input
          placeholder="Tìm bài đăng"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select value={statusFilter} onChange={handleStatusChange}>
          <option value="">Lọc trạng thái</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status as Status)}
            </option>
          ))}
        </select>
        <select value={employerFilter} onChange={handleEmployerChange}>
          <option value="">Lọc công ty</option>
          {employers.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="card table-card">
        <div className="table">
          <div className="table-row table-head jobs-grid">
            <span>Tiêu đề</span>
            <span>Nhà tuyển dụng</span>
            <span>Khu vực</span>
            <span>Thu nhập</span>
            <span>Trạng thái</span>
            <span>Ngày đăng</span>
            <span>Hành động</span>
          </div>
          {pagedJobs.map((job) => (
            <div key={job.id} className="table-row jobs-grid">
              <span>
                <strong>{job.title}</strong>
                <small>{job.id}</small>
              </span>
              <span>{job.employer}</span>
              <span>{job.location}</span>
              <span>{job.pay}</span>
              <span className={statusClass(job.status as Status)}>{statusLabel(job.status as Status)}</span>
              <span>{job.postedAt}</span>
              <span className="table-actions">
                <button
                  className="link"
                  onClick={() => {
                    setSelectedJob(job);
                    setShowReject(false);
                    setRejectReason("");
                  }}
                >
                  Xem
                </button>
                <button className="link">Duyệt</button>
                <button
                  className="link muted"
                  onClick={() => {
                    setSelectedJob(job);
                    setShowReject(true);
                    setRejectReason("");
                  }}
                >
                  Từ chối
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {filteredJobs.length > pageSize && (
        <div className="table-pagination">
          <button
            className="link"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </button>
          <span>
            Trang {currentPage}/{totalPages}
          </span>
          <button
            className="link"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Sau
          </button>
        </div>
      )}

      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {!showReject ? (
              <div className="post-preview">
                <div className="post-preview__header">
                  <div className="post-preview__title">
                    <h3>{selectedJob.title}</h3>
                    <p>{selectedJob.employer}</p>
                  </div>
                  <span className={`status-pill ${statusClass(selectedJob.status as Status)}`}>
                    {statusLabel(selectedJob.status as Status)}
                  </span>
                </div>
                <div className="post-preview__meta-grid">
                  <div>
                    <p className="meta-label">Danh mục</p>
                    <p>{selectedJob.category}</p>
                  </div>
                  <div>
                    <p className="meta-label">Khu vực</p>
                    <p>{selectedJob.location}</p>
                  </div>
                  <div>
                    <p className="meta-label">Mức thu nhập</p>
                    <p>{selectedJob.pay}</p>
                  </div>
                  <div>
                    <p className="meta-label">Ngày đăng</p>
                    <p>{selectedJob.postedAt}</p>
                  </div>
                </div>
                {selectedJob.notes && (
                  <div className="post-preview__notes">
                    <p className="meta-label">Ghi chú</p>
                    <p>{selectedJob.notes}</p>
                  </div>
                )}
                {selectedJob.images && selectedJob.images.length > 0 && (
                  <div className="post-images">
                    {selectedJob.images.map((src, index) => (
                      <img key={`${src}-${index}`} src={src} alt={`Ảnh ${index + 1}`} />
                    ))}
                  </div>
                )}
                <div className="post-preview__actions">
                  <button className="btn btn-ghost" onClick={() => setSelectedJob(null)}>
                    Đóng
                  </button>
                  <button className="btn btn-solid">Duyệt</button>
                  <button
                    className="btn btn-ghost danger"
                    onClick={() => {
                      setShowReject(true);
                      setRejectReason("");
                    }}
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ) : (
              <div className="post-reject">
                <h3>Phản hồi lý do từ chối</h3>
                <p className="muted">Vui lòng nhập lý do để gửi lại cho nhà tuyển dụng.</p>
                <textarea
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="VD: Thông tin công việc chưa rõ ràng, thiếu mức thu nhập..."
                />
                <div className="post-preview__actions">
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowReject(false);
                      setRejectReason("");
                    }}
                  >
                    Quay lại
                  </button>
                  <button
                    className="btn btn-solid"
                    onClick={() => {
                      if (!rejectReason.trim()) {
                        setMessage("Vui lòng nhập lý do từ chối.");
                        return;
                      }
                      setMessage(`Đã gửi phản hồi từ chối cho ${selectedJob.employer}.`);
                      setSelectedJob(null);
                      setShowReject(false);
                      setRejectReason("");
                    }}
                  >
                    Gửi phản hồi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
