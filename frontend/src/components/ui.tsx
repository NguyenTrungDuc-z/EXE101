import type { ReactNode } from "react";

type SectionProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Surface({ title, subtitle, action, children }: SectionProps) {
  return (
    <section className="surface">
      <div className="surface-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MetricTile({
  label,
  value,
  accent = "orange"
}: {
  label: string;
  value: string | number;
  accent?: "orange" | "teal" | "blue";
}) {
  return (
    <article className={`metric-tile metric-${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const labels: Record<string, string> = {
    approved: "Đã duyệt",
    paid: "Đã thanh toán",
    confirmed: "Đã xác nhận",
    verified: "Đã xác minh",
    available: "Sẵn sàng",
    growth: "Tăng trưởng",
    done: "Hoàn tất",
    completed: "Hoàn thành",
    pending: "Chờ xử lý",
    review: "Đang duyệt",
    medium: "Trung bình",
    open: "Đang mở",
    starter: "Cơ bản",
    new: "Mới",
    high: "Cao",
    rejected: "Từ chối",
    failed: "Thất bại",
    locked: "Đã khóa",
    low: "Thấp",
    shortlisted: "Đã chọn",
    in_progress: "Đang xử lý",
    in_service: "Đang phục vụ",
    busy: "Đang bận"
  };
  const key = value.toLowerCase();
  return <span className={`status-badge status-${key}`}>{labels[key] ?? value}</span>;
}

export function PageIntro({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
