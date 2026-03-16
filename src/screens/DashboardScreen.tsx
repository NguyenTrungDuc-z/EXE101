import data from "../data/db.json";
import ScreenHeader from "../components/ScreenHeader";
import {
  IconBriefcase,
  IconCandidate,
  IconCoins,
  IconDocument,
  IconUsers
} from "../components/icons";

export default function DashboardScreen() {
  const { jobs, applications, complaints, users, employers, payments, categories } = data;
  const formatNumber = (value: number) => value.toLocaleString("en-US");
  const toDate = (value: string) => {
    if (!value) return null;
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const withTime = normalized.length === 10 ? `${normalized}T00:00:00` : normalized;
    const parsed = new Date(withTime);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const baseDate = (() => {
    const dates = [
      ...jobs.map((job) => toDate(job.postedAt)),
      ...applications.map((app) => toDate(app.appliedAt))
    ].filter(Boolean) as Date[];
    if (!dates.length) return new Date();
    return new Date(Math.max(...dates.map((item) => item.getTime())));
  })();

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const parseMoney = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");
    return cleaned ? Number(cleaned) : 0;
  };

  const uniqueCandidates = new Set(applications.map((app) => app.candidate));
  const jobsById = new Map(jobs.map((job) => [job.id, job]));
  const applicationsByJob = new Map<string, Date[]>();

  applications.forEach((app) => {
    const date = toDate(app.appliedAt);
    if (!date) return;
    const list = applicationsByJob.get(app.jobId) ?? [];
    list.push(date);
    applicationsByJob.set(app.jobId, list);
  });

  const fillDurations = Array.from(applicationsByJob.entries())
    .map(([jobId, dates]) => {
      const job = jobsById.get(jobId);
      const postedAt = job ? toDate(job.postedAt) : null;
      if (!postedAt || dates.length === 0) return null;
      const firstApplied = new Date(Math.min(...dates.map((date) => date.getTime())));
      const hours = (firstApplied.getTime() - postedAt.getTime()) / (1000 * 60 * 60);
      return Number.isFinite(hours) && hours >= 0 ? hours : null;
    })
    .filter((value): value is number => value !== null);

  const avgFillHours =
    fillDurations.length > 0 ? fillDurations.reduce((acc, item) => acc + item, 0) / fillDurations.length : 0;

  const derivedStats = {
    totalUsers: users.length,
    totalEmployers: employers.length,
    totalJobs: jobs.length,
    totalCandidates: uniqueCandidates.size,
    totalRevenue: payments.reduce((sum, item) => sum + parseMoney(item.price), 0),
    jobsToday: jobs.filter((job) => {
      const date = toDate(job.postedAt);
      return date ? isSameDay(date, baseDate) : false;
    }).length,
    activeJobs: jobs.filter((job) => job.status === "Approved").length,
    pendingApprovals: jobs.filter((job) => job.status === "Pending").length,
    verifiedEmployers: employers.filter((employer) => employer.kyc === "Verified").length,
    hotCategories: categories.length,
    avgFillHours
  };

  const months = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: date.toLocaleString("en-US", { month: "short" }),
      month: date.getMonth(),
      year: date.getFullYear()
    };
  });

  const groupByMonth = (items: Date[]) =>
    months.map((month) =>
      items.filter((date) => date.getMonth() === month.month && date.getFullYear() === month.year).length
    );

  const jobCounts = groupByMonth(jobs.map((job) => toDate(job.postedAt)).filter(Boolean) as Date[]);
  const applicationCounts = groupByMonth(
    applications.map((app) => toDate(app.appliedAt)).filter(Boolean) as Date[]
  );
  const maxJobCount = Math.max(1, ...jobCounts);
  const maxApplicationCount = Math.max(1, ...applicationCounts);

  const kpiCards = [
    { label: "Số lượng người dùng", value: formatNumber(derivedStats.totalUsers), icon: <IconUsers /> },
    {
      label: "Số lượng Nhà tuyển dụng",
      value: formatNumber(derivedStats.totalEmployers),
      icon: <IconBriefcase />
    },
    { label: "Tổng số Bài đăng", value: formatNumber(derivedStats.totalJobs), icon: <IconDocument /> },
    {
      label: "Tổng số Ứng viên",
      value: formatNumber(derivedStats.totalCandidates),
      icon: <IconCandidate />
    },
    {
      label: "Tổng doanh thu",
      value: derivedStats.totalRevenue.toLocaleString("vi-VN") + "đ",
      icon: <IconCoins />
    }
  ];

  const quickJobs = [...jobs]
    .sort((a, b) => {
      const dateA = toDate(a.postedAt)?.getTime() ?? 0;
      const dateB = toDate(b.postedAt)?.getTime() ?? 0;
      return dateB - dateA;
    })
    .slice(0, 3)
    .map((job) => `${job.title} - ${job.location}`);

  const topEmployees = (() => {
    const counter = new Map<string, number>();
    applications.forEach((app) => {
      counter.set(app.candidate, (counter.get(app.candidate) ?? 0) + 1);
    });
    return Array.from(counter.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([candidate, count]) => `${candidate} - ${count} hồ sơ`);
  })();

  const complaintList = complaints
    .slice(0, 2)
    .map((item) => `${item.id} - ${item.type} - ${item.message}`);

  return (
    <div className="screen">
      <ScreenHeader
        eyebrow="Bảng điều hành"
        title="Tổng quan hệ thống"
        subtitle="Theo dõi hiệu suất vận hành và biến động theo thời gian."
      />

      <section className="kpi-grid">
        {kpiCards.map((card) => (
          <article key={card.label} className="kpi-card">
            <div className="kpi-icon">{card.icon}</div>
            <div>
              <p className="card-label">{card.label}</p>
              <h2>{card.value}</h2>
            </div>
          </article>
        ))}
      </section>

      <section className="grid two">
        <article className="card">
          <div className="section-head">
            <div>
              <h3>Biểu đồ đăng bài theo tháng</h3>
              <p className="muted">Số bài đăng mới theo tháng</p>
            </div>
          </div>
          <div className="chart-bars">
            {months.map((month, index) => (
              <div key={month.key} className="chart-bar">
                <span
                  style={{ height: `${(jobCounts[index] / maxJobCount) * 100}%` }}
                  title={`${jobCounts[index]} bài đăng`}
                />
                <small>{month.label}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <h3>Biểu đồ ứng tuyển theo tháng</h3>
              <p className="muted">Lượng hồ sơ nộp vào hệ thống</p>
            </div>
          </div>
          <div className="chart-bars alt">
            {months.map((month, index) => (
              <div key={month.key} className="chart-bar">
                <span
                  style={{ height: `${(applicationCounts[index] / maxApplicationCount) * 100}%` }}
                  title={`${applicationCounts[index]} ứng tuyển`}
                />
                <small>{month.label}</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid three">
        <article className="card">
          <h3>Việc mới đăng</h3>
          <ul className="quick-list">
            {quickJobs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Ứng viên năng động</h3>
          <ul className="quick-list">
            {topEmployees.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Khiếu nại gần đây</h3>
          <ul className="quick-list">
            {complaintList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
