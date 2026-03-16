import { useEffect, useMemo, useState } from "react";
import { ChangeEvent } from "react";
import data from "../data/db.json";
import ScreenHeader from "../components/ScreenHeader";
import { Status } from "../utils/helpers";

type JobForm = {
  title: string;
  employer: string;
  category: string;
  location: string;
  pay: string;
  type: string;
  description: string;
  deadline: string;
  images: string[];
};

type Job = {
  id: string;
  title: string;
  category: string;
  location: string;
  pay: string;
  status: Status;
  postedAt: string;
  employer: string;
  slots: number;
  priority: string;
  notes: string;
  images?: string[];
};

type Draft = {
  id: string;
  createdAt: string;
  data: JobForm;
};

const JOBS_KEY = "job-posts";
const DRAFT_KEY = "job-post-drafts";
const LEGACY_DRAFT_KEY = "job-post-draft";

const emptyForm: JobForm = {
  title: "",
  employer: "",
  category: "",
  location: "",
  pay: "",
  type: "Toàn thời gian",
  description: "",
  deadline: "",
  images: []
};

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

const getNextJobId = (existing: Job[]) => {
  const numbers = existing
    .map((job) => job.id.match(/\d+/)?.[0])
    .filter(Boolean)
    .map((value) => Number(value));
  const max = numbers.length > 0 ? Math.max(...numbers) : 2400;
  return `JOB-${max + 1}`;
};

export default function CreatePostScreen() {
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [showDraftDetails, setShowDraftDetails] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  const employers = useMemo(() => data.employers.map((item) => item.name), []);
  const categories = useMemo(() => {
    const set = new Set<string>();
    data.jobs.forEach((job) => set.add(job.category));
    data.user_categories.forEach((cat) => set.add(cat.name));
    return Array.from(set);
  }, []);

  const normalizeDrafts = (items: Draft[]) =>
    items.map((draft) => ({
      ...draft,
      data: {
        ...emptyForm,
        ...draft.data,
        images: Array.isArray(draft.data?.images) ? draft.data.images : []
      }
    }));

  const readDrafts = () => {
    if (typeof window === "undefined") return [] as Draft[];
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return [] as Draft[];
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? (parsed as Draft[]) : ([] as Draft[]);
      return normalizeDrafts(list);
    } catch {
      return [] as Draft[];
    }
  };

  const writeDrafts = (next: Draft[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key === DRAFT_KEY) {
        const updated = readDrafts();
        setDrafts(updated);
        setSelectedDraftId(updated[0]?.id ?? null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = readDrafts();
    if (existing.length > 0) {
      setDrafts(existing);
      setSelectedDraftId(existing[0]?.id ?? null);
      writeDrafts(existing);
      return;
    }

    try {
      const legacyRaw = localStorage.getItem(LEGACY_DRAFT_KEY);
      if (!legacyRaw) return;
      const legacyParsed = JSON.parse(legacyRaw) as Partial<JobForm>;
      const migrated: Draft = {
        id: `DRAFT-${Date.now()}`,
        createdAt: new Date().toISOString(),
        data: { ...emptyForm, ...legacyParsed }
      };
      writeDrafts([migrated]);
      localStorage.removeItem(LEGACY_DRAFT_KEY);
      setDrafts([migrated]);
      setSelectedDraftId(migrated.id);
      setShowDraftDetails(true);
    } catch {
      setForm(emptyForm);
    }
  }, []);

  const updateField = (field: keyof JobForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.readAsDataURL(file);
        })
    );

    const results = await Promise.all(readers);
    setForm((prev) => ({ ...prev, images: [...prev.images, ...results].slice(0, 6) }));
    event.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const handleSaveDraft = () => {
    if (typeof window === "undefined") return;
    if (!form.title && !form.employer && !form.category && !form.location && !form.pay && !form.description) {
      setMessage("Vui lòng nhập thông tin trước khi lưu nháp.");
      return;
    }
    const next: Draft = {
      id: `DRAFT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      data: { ...form }
    };
    const existing = readDrafts();
    const updated = [next, ...existing];
    writeDrafts(updated);
    setDrafts(updated);
    setMessage("Đã lưu nháp.");
    setSelectedDraftId(next.id);
    setShowDraftDetails(true);
    setForm(emptyForm);
  };

  const handleSubmit = () => {
    const requiredFields: Array<keyof JobForm> = [
      "title",
      "employer",
      "category",
      "location",
      "pay"
    ];

    const missing = requiredFields.filter((field) => !form[field].trim());
    if (missing.length > 0) {
      setMessage("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    const storedJobs = readStoredJobs();
    const id = getNextJobId([...storedJobs, ...(data.jobs as Job[])]);
    const postedAt = new Date().toISOString().slice(0, 10);

    const notesParts = [form.description.trim(), form.deadline && `Hạn chót: ${form.deadline}`, `Hình thức: ${form.type}`]
      .filter(Boolean)
      .join(" | ");

    const newJob: Job = {
      id,
      title: form.title.trim(),
      category: form.category.trim(),
      location: form.location.trim(),
      pay: form.pay.trim(),
      status: "Pending",
      postedAt,
      employer: form.employer.trim(),
      slots: 1,
      priority: "Medium",
      notes: notesParts,
      images: form.images
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(JOBS_KEY, JSON.stringify([newJob, ...storedJobs]));
    }

    setForm(emptyForm);
    setMessage("Đã tạo bài đăng mới.");
  };

  const handleClearDraft = () => {
    if (typeof window === "undefined") return;
    if (!selectedDraftId) return;
    const updated = drafts.filter((draft) => draft.id !== selectedDraftId);
    writeDrafts(updated);
    setDrafts(updated);
    setSelectedDraftId(updated[0]?.id ?? null);
    setMessage("Đã xoá nháp.");
  };

  const handleLoadDraft = () => {
    if (!selectedDraftId) return;
    const target = drafts.find((draft) => draft.id === selectedDraftId);
    if (!target) return;
    setForm({ ...emptyForm, ...target.data });
    setMessage("Đã nạp bản nháp vào biểu mẫu.");
  };

  return (
    <div className="screen">
      <ScreenHeader
        eyebrow="Tạo bài đăng"
        title="Biểu mẫu tạo việc"
        subtitle="Nhập đầy đủ thông tin công việc và yêu cầu."
      />

      <div className="card">
        <div className="form-grid">
          <label>
            Tiêu đề việc
            <input
              placeholder="VD: Giao hàng gấp 2h"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </label>
          <label>
            Nhà tuyển dụng
            <select
              value={form.employer}
              onChange={(event) => updateField("employer", event.target.value)}
            >
              <option value="">Chọn nhà tuyển dụng</option>
              {employers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Danh mục
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Khu vực
            <input
              placeholder="Quận 1, TP.HCM"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
            />
          </label>
          <label>
            Mức thu nhập
            <input
              placeholder="200k - 300k/ca"
              value={form.pay}
              onChange={(event) => updateField("pay", event.target.value)}
            />
          </label>
          <label>
            Hình thức
            <select value={form.type} onChange={(event) => updateField("type", event.target.value)}>
              <option>Toàn thời gian</option>
              <option>Bán thời gian</option>
            </select>
          </label>
          <label className="full">
            Mô tả
            <textarea
              placeholder="Mô tả công việc, yêu cầu, kỹ năng..."
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </label>
          <label className="full">
            Hình ảnh đính kèm
            <input type="file" accept="image/*" multiple onChange={handleImageChange} />
          </label>
          {form.images.length > 0 && (
            <div className="form-images">
              {form.images.map((src, index) => (
                <div key={`${src}-${index}`} className="form-image">
                  <img src={src} alt={`Ảnh ${index + 1}`} />
                  <button
                    className="image-remove"
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
          <label>
            Hạn chót
            <input
              type="date"
              min={today}
              value={form.deadline}
              onChange={(event) => updateField("deadline", event.target.value)}
            />
          </label>
        </div>
        {drafts.length > 0 && (
          <div className="draft-preview">
            <div className="draft-header">
              <div>
                <h4>Bản nháp hiện tại</h4>
                <p className="muted">Nháp sẽ tự tải lại khi mở màn tạo bài đăng.</p>
              </div>
              <div className="draft-actions">
                <button className="link" onClick={handleLoadDraft}>
                  Sửa nháp
                </button>
                <button className="link" onClick={() => setShowDraftDetails((prev) => !prev)}>
                  {showDraftDetails ? "Thu gọn" : "Xem chi tiết"}
                </button>
                <button className="link danger" onClick={handleClearDraft}>
                  Xoá nháp
                </button>
              </div>
            </div>
            {showDraftDetails && (
              <div className="draft-preview__content">
                <div className="draft-list">
                  {drafts.map((draft, index) => (
                    <button
                      key={draft.id}
                      className={`draft-item ${draft.id === selectedDraftId ? "active" : ""}`}
                      onClick={() => setSelectedDraftId(draft.id)}
                    >
                      <strong>
                        {draft.data.title || `Bản nháp #${drafts.length - index}`}
                      </strong>
                      <span>
                        {draft.data.employer || "Chưa chọn nhà tuyển dụng"}
                      </span>
                      <span>
                        {draft.data.category || "Chưa chọn danh mục"} ·{" "}
                        {draft.data.location || "Chưa có khu vực"}
                      </span>
                      <span className="draft-time">
                        {new Date(draft.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedDraftId && (() => {
                  const currentDraft = drafts.find((draft) => draft.id === selectedDraftId);
                  if (!currentDraft) return null;
                  const data = currentDraft.data;
                  return (
                    <div className="draft-detail">
                      <div className="draft-grid">
                        <div className="draft-row">
                          <p className="draft-label">Tiêu đề</p>
                          <p className="draft-value">{data.title || "Chưa có tiêu đề"}</p>
                        </div>
                        <div className="draft-row">
                          <p className="draft-label">Nhà tuyển dụng</p>
                          <p className="draft-value">{data.employer || "Chưa có nhà tuyển dụng"}</p>
                        </div>
                        <div className="draft-row">
                          <p className="draft-label">Danh mục</p>
                          <p className="draft-value">{data.category || "Chưa có danh mục"}</p>
                        </div>
                        <div className="draft-row">
                          <p className="draft-label">Khu vực</p>
                          <p className="draft-value">{data.location || "Chưa có khu vực"}</p>
                        </div>
                        <div className="draft-row">
                          <p className="draft-label">Mức thu nhập</p>
                          <p className="draft-value">{data.pay || "Chưa có mức thu nhập"}</p>
                        </div>
                        <div className="draft-row">
                          <p className="draft-label">Hình thức</p>
                          <p className="draft-value">{data.type || "Chưa có hình thức"}</p>
                        </div>
                        <div className="draft-row">
                          <p className="draft-label">Hạn chót</p>
                          <p className="draft-value">
                            {data.deadline ? data.deadline : "Chưa có hạn chót"}
                          </p>
                        </div>
                      </div>
                      <div className="draft-note">
                        <p className="draft-label">Mô tả</p>
                        <p className="draft-value">
                          {data.description ? data.description : "Chưa có mô tả"}
                        </p>
                      </div>
                      {data.images.length > 0 && (
                        <div className="draft-images">
                          {data.images.map((src, index) => (
                            <img key={`${src}-${index}`} src={src} alt={`Ảnh nháp ${index + 1}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
        {message && <p className="form-message">{message}</p>}
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={handleSaveDraft}>
            Lưu nháp
          </button>
          <button className="btn btn-solid" onClick={handleSubmit}>
            Đăng bài
          </button>
        </div>
      </div>
    </div>
  );
}
