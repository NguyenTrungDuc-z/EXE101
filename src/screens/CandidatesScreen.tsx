import { useMemo, useState } from "react";
import data from "../data/db.json";
import ScreenHeader from "../components/ScreenHeader";
import { slugify, statusClass, Status, statusLabel } from "../utils/helpers";

type CandidateRow = (typeof data.applications)[number];

const pageSize = 5;

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export default function CandidatesScreen() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CandidateRow | null>(null);
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCandidates = useMemo(() => {
    return data.applications.filter((item) => {
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      const matchesSearch = normalizedSearch
        ? [item.candidate, item.id, item.jobId, item.phone]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [normalizedSearch, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [currentPage, filteredCandidates]);

  const statusLabelForCandidates = (status: Status) => {
    if (status === "New") return "Mới";
    if (status === "Contacted") return "Đã liên hệ";
    return statusLabel(status);
  };

  const toggleLock = (id: string) => {
    setLockedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const downloadCv = (candidate: string) => {
    const content = `CV ung vien: ${candidate}\nVui long lien he de xem ho so day du.`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CV-${slugify(candidate)}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="screen">
      <ScreenHeader
        eyebrow="Ứng viên"
        title="Danh sách ứng viên"
        subtitle="Theo dõi hồ sơ ứng viên và trạng thái ứng tuyển."
      />

      <div className="filters">
        <input
          placeholder="Tìm ứng viên, mã hồ sơ, vị trí..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setPage(1);
          }}
        />
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Lọc trạng thái</option>
          <option value="New">Mới</option>
          <option value="Contacted">Đã liên hệ</option>
        </select>
        <div />
      </div>

      <div className="card table-card">
        <div className="table">
          <div className="table-row table-head candidates-grid">
            <span>Họ tên</span>
            <span>Email</span>
            <span>Điện thoại</span>
            <span>CV</span>
            <span>Vị trí ứng tuyển</span>
            <span>Trạng thái</span>
            <span>Tài khoản</span>
            <span>Hành động</span>
          </div>
          {pagedCandidates.map((item) => {
            const email = `${slugify(item.candidate)}@example.com`;
            const isLocked = lockedIds.has(item.id);
            return (
              <div key={item.id} className="table-row candidates-grid">
                <span>
                  <strong>{item.candidate}</strong>
                  <small>{item.id}</small>
                </span>
                <span>{email}</span>
                <span>{item.phone}</span>
                <span>
                  <button className="link" onClick={() => downloadCv(item.candidate)}>
                    Tải CV
                  </button>
                </span>
                <span>{item.jobId}</span>
                <span className={statusClass(item.status as Status)}>
                  {statusLabelForCandidates(item.status as Status)}
                </span>
                <span>
                  <span className={`badge ${isLocked ? "badge-rejected" : "badge-approved"}`}>
                    {isLocked ? "Đang khóa" : "Hoạt động"}
                  </span>
                </span>
                <span className="table-actions">
                  <button className="link" onClick={() => setSelected(item)}>
                    Xem hồ sơ
                  </button>
                  <button className="link danger" onClick={() => toggleLock(item.id)}>
                    {isLocked ? "Mở khóa" : "Khóa tài khoản"}
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {data.applications.length > pageSize && (
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

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">{getInitials(selected.candidate)}</div>
                <div>
                  <h3>{selected.candidate}</h3>
                  <p className="muted">{`${slugify(selected.candidate)}@example.com`}</p>
                </div>
              </div>
              <div className="profile-grid">
                <div>
                  <p className="meta-label">Điện thoại</p>
                  <p>{selected.phone}</p>
                </div>
                <div>
                  <p className="meta-label">Vị trí ứng tuyển</p>
                  <p>{selected.jobId}</p>
                </div>
                <div>
                  <p className="meta-label">Trạng thái</p>
                  <p>{statusLabelForCandidates(selected.status as Status)}</p>
                </div>
                <div>
                  <p className="meta-label">Điểm đánh giá</p>
                  <p>{selected.rating}</p>
                </div>
              </div>
              <div className="post-preview__actions">
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>
                  Đóng
                </button>
                <button className="btn btn-solid" onClick={() => downloadCv(selected.candidate)}>
                  Tải CV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
