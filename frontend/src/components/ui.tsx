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
  return <span className={`status-badge status-${value.toLowerCase()}`}>{value}</span>;
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
