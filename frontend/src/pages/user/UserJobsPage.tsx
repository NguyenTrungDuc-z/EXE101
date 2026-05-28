import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { platformApi } from "../../api/platformApi";
import type { Job, JobDetail } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

export default function UserJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minBudgetInput, setMinBudgetInput] = useState("0");
  const [maxBudgetInput, setMaxBudgetInput] = useState("5000000");
  const [fourStarOnly, setFourStarOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const categoryParam = searchParams.get("categoryName") ?? "";
  const jobCodeParam = searchParams.get("jobCode") ?? "";

  useEffect(() => {
    setSearch(searchParam);
    setCategory(categoryParam);
    setSelectedCategories(categoryParam ? [categoryParam] : []);
  }, [searchParam, categoryParam]);

  const minBudget = Number(minBudgetInput || 0);
  const maxBudget = Number(maxBudgetInput || Number.MAX_SAFE_INTEGER);

  useEffect(() => {
    platformApi
      .getUserHome()
      .then((home) => setCategories(home.categories.map((item) => item.name)))
      .catch((reason: Error) => setFeedback(reason.message));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("q", search.trim());
    }
    if (selectedCategories.length) {
      params.set("categoryName", selectedCategories.join(","));
    }
    if (minBudgetInput) {
      params.set("minBudget", String(minBudget));
    }
    if (maxBudgetInput) {
      params.set("maxBudget", String(maxBudget));
    }
    if (fourStarOnly) {
      params.set("minRating", "4");
    }

    platformApi
      .getUserJobs(params.toString() ? `?${params.toString()}` : "")
      .then((items) => {
        setJobs(items);
        setMaxBudgetInput((current) => current === "5000000" && items.length ? String(Math.max(...items.map((job) => job.budgetMax), 5000000)) : current);
      })
      .catch((reason: Error) => setFeedback(reason.message));
  }, [fourStarOnly, maxBudget, maxBudgetInput, minBudget, minBudgetInput, search, selectedCategories]);


  useEffect(() => {
    if (jobCodeParam) {
      openJobDetail(jobCodeParam, false);
    } else {
      setSelectedJob(null);
      setQuantity(1);
    }
  }, [jobCodeParam]);

  const filteredJobs = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch = normalized
        ? [job.title, viText(job.title), job.location, job.summary, job.companyName ?? "", job.categoryName ?? "", viText(job.categoryName)]
            .join(" ")
            .toLowerCase()
            .includes(normalized)
        : true;
      const matchesCategory = selectedCategories.length ? selectedCategories.includes(job.categoryName ?? "") : true;
      const matchesPrice = job.budgetMin >= minBudget && job.budgetMin <= maxBudget;
      const matchesRating = fourStarOnly ? Number(job.ratingLabel ?? 0) >= 4 : true;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }, [fourStarOnly, jobs, maxBudget, minBudget, search, selectedCategories]);

  const displayJobs = filteredJobs;
  const suggestedJobs = jobs.filter((job) => job.code !== selectedJob?.code).slice(0, 4);
  const resultLabel = selectedCategories.length ? selectedCategories.map(viText).join(", ") : search ? search : "tất cả dịch vụ";
  const totalPages = Math.max(1, Math.ceil(displayJobs.length / 10));
  const pageJobs = displayJobs.slice((page - 1) * 10, page * 10);
  const primaryJobs = pageJobs.slice(0, 3);
  const recommendedJobs = (pageJobs.length > 3 ? pageJobs.slice(3, 6) : jobs.filter((job) => !primaryJobs.some((item) => item.code === job.code))).slice(0, 3);

  useEffect(() => {
    setPage(1);
  }, [fourStarOnly, maxBudgetInput, minBudgetInput, search, selectedCategories]);

  async function openJobDetail(jobCode: string, updateUrl = true) {
    try {
      const detail = await platformApi.getUserJobDetail(jobCode);
      setSelectedJob(detail);
      setQuantity(1);
      if (updateUrl) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("jobCode", jobCode);
        setSearchParams(newParams, { replace: true });
      }
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  }

  const updateParams = (next: { search?: string; category?: string }) => {
    const newParams = new URLSearchParams(searchParams);
    const nextSearch = next.search ?? search;
    const nextCategory = next.category ?? category;

    if (nextSearch.trim()) {
      newParams.set("search", nextSearch.trim());
    } else {
      newParams.delete("search");
    }

    if (nextCategory) {
      newParams.set("categoryName", nextCategory);
    } else {
      newParams.delete("categoryName");
    }

    newParams.delete("jobCode");
    setSearchParams(newParams, { replace: true });
  };

  const toggleCategory = (item: string) => {
    setSelectedCategories((current) => {
      const next = current.includes(item) ? current.filter((value) => value !== item) : [...current, item];
      setCategory(next[0] ?? "");
      return next;
    });
  };

  if (selectedJob) {
    const estimatedTotal = selectedJob.budgetMin * quantity;

    return (
      <div className="service-detail-page">
        <section className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8, 20, 34, 0.62), rgba(8, 20, 34, 0.22)), url(${selectedJob.coverImage})` }}>
          <div>
            <h1>{viText(selectedJob.title)}</h1>
            <p>{selectedJob.ratingLabel} ★★★★★ <span>|</span> {selectedJob.bookingCountLabel}</p>
          </div>
        </section>

        {feedback ? <p className="feedback">{feedback}</p> : null}

        <section className="detail-main">
          <div className="detail-left">
            <section className="detail-section detail-two-column">
              <div>
                <h2>Tại sao cần {viText(selectedJob.categoryName).toLowerCase()}</h2>
                <ul className="check-list">
                  {selectedJob.benefits.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <BookingCard
                quantity={quantity}
                unitLabel={selectedJob.unitLabel}
                total={estimatedTotal}
                onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
                onIncrease={() => setQuantity((current) => current + 1)}
                onSubmit={() => navigate(`/booking?jobCode=${selectedJob.code}&quantity=${quantity}`)}
              />
            </section>

            <section className="detail-section">
              <h2>Quy trình thực hiện chuyên nghiệp</h2>
              <div className="process-grid">
                {selectedJob.processSteps.map((step, index) => (
                  <article key={step}>
                    <span className="process-icon">{index + 1}</span>
                    <h3>{index + 1}. {step}</h3>
                  </article>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h2>Cam kết chất lượng</h2>
              <ul className="check-list">
                {selectedJob.qualityCommitments.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="detail-right">
            <section className="detail-section">
              <h2>Tại sao cần {viText(selectedJob.categoryName).toLowerCase()}</h2>
              <ul className="check-list">
                {selectedJob.reasons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <BookingCard
              quantity={quantity}
              unitLabel={selectedJob.unitLabel}
              total={estimatedTotal}
              onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
              onIncrease={() => setQuantity((current) => current + 1)}
              onSubmit={() => navigate(`/booking?jobCode=${selectedJob.code}&quantity=${quantity}`)}
            />
          </aside>
        </section>

        <section className="detail-reviews">
          <h2>Đánh giá khách hàng</h2>
          <div className="detail-review-carousel">
            <button className="carousel-arrow" type="button" aria-label="Trước">‹</button>
            {selectedJob.reviews.slice(0, 2).map((review) => (
              <article key={review.author} className="detail-review-card">
                <img src={review.image} alt={review.author} />
                <div>
                  <div className="stars">{"★".repeat(review.rating)}</div>
                  <p>“{review.comment}”</p>
                </div>
              </article>
            ))}
            <button className="carousel-arrow" type="button" aria-label="Sau">›</button>
          </div>
          <div className="carousel-dots" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
            <span />
          </div>
        </section>

        <section className="detail-faq">
          <h2>Câu hỏi thường gặp (FAQ)</h2>
          {selectedJob.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </section>

        <SuggestedServices jobs={suggestedJobs} onOpen={openJobDetail} />
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="services-page">
      <section className="services-hero">
        <h1>Kết quả tìm kiếm đồng bộ</h1>
        <form
          className="services-search"
          onSubmit={(event) => {
            event.preventDefault();
            updateParams({});
          }}
        >
          <select
            aria-label="Chọn dịch vụ"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setSelectedCategories(event.target.value ? [event.target.value] : []);
              updateParams({ category: event.target.value });
            }}
          >
            <option value="">Chọn dịch vụ</option>
            {categories.map((item) => (
              <option key={item} value={item}>{viText(item)}</option>
            ))}
          </select>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Địa chỉ của bạn"
          />
          <button className="button primary search-btn" type="submit">
            Tìm kiếm ngay
          </button>
        </form>
      </section>

      {feedback ? <p className="feedback">{feedback}</p> : null}

      <section className="services-results">
        <aside className="services-filter">
          <h2>Bộ lọc</h2>
          <div className="filter-block">
            <h3>Khoảng giá</h3>
            <div className="range-line">
              <span />
            </div>
            <div className="price-input-grid">
              <label>
                Từ
                <input
                  type="number"
                  min="0"
                  value={minBudgetInput}
                  onChange={(event) => setMinBudgetInput(event.target.value)}
                />
              </label>
              <label>
                Đến
                <input
                  type="number"
                  min="0"
                  value={maxBudgetInput}
                  onChange={(event) => setMaxBudgetInput(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="filter-block">
            <h3>Đánh giá</h3>
            <label>
              <input type="checkbox" checked={fourStarOnly} onChange={(event) => setFourStarOnly(event.target.checked)} />
              ★★★★★ (5)
            </label>
            <label>
              <input type="checkbox" />
              ★★★★☆ (3)
            </label>
            <label>
              <input type="checkbox" />
              ★★★☆☆ (2)
            </label>
          </div>

          <div className="filter-block">
            <h3>Loại dịch vụ liên quan</h3>
            {categories.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(item)}
                  onChange={() => toggleCategory(item)}
                />
                {viText(item)}
              </label>
            ))}
          </div>

          <div className="filter-block">
            <h3>Thời gian phục vụ</h3>
            <label><input type="checkbox" defaultChecked /> 8:00 - 12:00</label>
            <label><input type="checkbox" defaultChecked /> 12:00 - 18:00</label>
            <label><input type="checkbox" defaultChecked /> Thời gian phục vụ</label>
          </div>
        </aside>

        <div className="services-content">
          <div className="services-result-head">
            <h1>Dịch vụ liên quan</h1>
            <p>{displayJobs.length} kết quả cho {resultLabel}</p>
          </div>
          <div className="service-product-grid">
            {primaryJobs.map((job) => <ServiceProductCard key={job.code} job={job} onOpen={openJobDetail} />)}
          </div>

          {!primaryJobs.length ? <p className="feedback">Không có dịch vụ phù hợp với bộ lọc hiện tại.</p> : null}

          <div className="services-section-head">
            <h2>Dịch vụ gợi ý cho bạn</h2>
            <div className="services-mini-arrows">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button>
              <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>›</button>
            </div>
          </div>

          <div className="service-product-grid">
            {recommendedJobs.map((job) => <ServiceProductCard key={job.code} job={job} onOpen={openJobDetail} compact />)}
          </div>

          <div className="services-pagination" aria-label="Phân trang dịch vụ">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button>
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index + 1}
                type="button"
                className={page === index + 1 ? "active" : ""}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>›</button>
          </div>

          <SuggestedServices jobs={suggestedJobs.slice(0, 0)} onOpen={openJobDetail} />
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}

function ServiceProductCard({ job, onOpen, compact = false }: { job: Job; onOpen: (jobCode: string) => void; compact?: boolean }) {
  return (
    <article className={`service-product-card ${compact ? "compact" : ""}`}>
      <img src={job.coverImage} alt={viText(job.title)} />
      <div className="service-product-body">
        <h3>{viText(job.title)}</h3>
        <div className="product-meta">
          <span>★★★★★</span>
          <small>Xem chi tiết</small>
        </div>
        <button className="button primary" type="button" onClick={() => onOpen(job.code)}>Xem chi tiết</button>
      </div>
    </article>
  );
}

function BookingCard({
  quantity,
  unitLabel,
  total,
  onDecrease,
  onIncrease,
  onSubmit
}: {
  quantity: number;
  unitLabel: string;
  total: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onSubmit: () => void;
}) {
  return (
    <article className="booking-card">
      <h2>Thẻ đặt lịch</h2>
      <div className="booking-quantity">
        <span>Số lượng {unitLabel}</span>
        <div>
          <button type="button" onClick={onDecrease}>−</button>
          <strong>{quantity}</strong>
          <button type="button" onClick={onIncrease}>+</button>
        </div>
      </div>
      <p>Tổng tiền tạm tính: <strong>{total.toLocaleString()} VND</strong></p>
      <button className="button primary" type="button" onClick={onSubmit}>
        Đặt lịch ngay
      </button>
    </article>
  );
}

function SuggestedServices({ jobs, onOpen }: { jobs: Job[]; onOpen: (jobCode: string) => void }) {
  if (!jobs.length) {
    return null;
  }

  return (
    <section className="suggested-services">
      <h2>Dịch vụ gợi ý cho bạn</h2>
      <div className="suggested-row">
        {jobs.map((job) => (
          <article key={job.code} className="suggested-card" onClick={() => onOpen(job.code)}>
            <img src={job.coverImage} alt={viText(job.title)} />
            <div>
              <h3>{viText(job.title)}</h3>
              <strong>{job.displayPriceLabel ?? viText(job.salaryLabel)}</strong>
              <p>⭐ {job.ratingLabel ?? "5"} sao</p>
              <p>{job.bookingCountLabel ?? `${job.applicantsCount}+ đã đặt`}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomeFooter() {
  return (
    <footer className="home-footer services-footer">
      <div>
        <h3>Liên hệ</h3>
        <p>0833 256 780</p>
        <p>homeswift.com</p>
      </div>
      <div>
        <h3>Mạng xã hội</h3>
        <div className="social-row">
          <span>f</span>
          <span>ig</span>
          <span>yt</span>
        </div>
      </div>
      <div>
        <h3>Tải ứng dụng iOS</h3>
        <span className="store-badge">App Store</span>
      </div>
      <div>
        <h3>Tải ứng dụng Android</h3>
        <span className="store-badge">Google Play</span>
      </div>
    </footer>
  );
}
