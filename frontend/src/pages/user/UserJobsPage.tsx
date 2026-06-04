import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight, CalendarCheck, ChevronDown, ChevronLeft, ChevronRight, Clock,
  DollarSign, HelpCircle, MapPin, Minus, Phone, Plus, Quote,
  Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, Tag, Users
} from "lucide-react";
import { platformApi } from "../../api/platformApi";
import type { Job, JobDetail, Order, UserProfile } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

export default function UserJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
  const [selectedVariantCode, setSelectedVariantCode] = useState("");
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

    const userCode = localStorage.getItem("userCode");
    if (userCode) {
      platformApi.getUserProfile(userCode).then(setUserProfile).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (userProfile?.role === "candidate") {
      platformApi.getPendingOrders()
        .then(setPendingOrders)
        .catch((err) => setFeedback(err.message));
    }
  }, [userProfile]);

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
  const activeFilterCount = selectedCategories.length + (fourStarOnly ? 1 : 0) + (Number(minBudgetInput) > 0 || maxBudgetInput !== "5000000" ? 1 : 0);

  useEffect(() => {
    setPage(1);
  }, [fourStarOnly, maxBudgetInput, minBudgetInput, search, selectedCategories]);

  async function openJobDetail(jobCode: string, updateUrl = true) {
    try {
      const detail = await platformApi.getUserJobDetail(jobCode);
      setSelectedJob(detail);
      setQuantity(1);
      setSelectedVariantCode(detail.serviceVariants[0]?.code ?? "");
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
    const selectedVariant = selectedJob.serviceVariants.find((item) => item.code === selectedVariantCode) ?? selectedJob.serviceVariants[0];
    const isRangePrice = selectedVariant?.pricingType === "range";
    const rangeTotalMin = (selectedVariant?.priceMin ?? selectedJob.budgetMin) * quantity;
    const rangeTotalMax = (selectedVariant?.priceMax ?? selectedJob.budgetMax) * quantity;
    const unitPrice = isRangePrice ? (selectedVariant?.priceMin ?? selectedJob.budgetMin) : (selectedVariant?.price ?? selectedJob.budgetMin);
    const estimatedTotal = unitPrice * quantity;
    const bookingParams = new URLSearchParams({
      jobCode: selectedJob.code,
      quantity: String(quantity),
      variantCode: selectedVariant?.code ?? "",
      machineType: selectedVariant?.name ?? "",
      unitPrice: String(unitPrice),
      pricingType: selectedVariant?.pricingType ?? "fixed",
      priceMin: String(selectedVariant?.priceMin ?? unitPrice),
      priceMax: String(selectedVariant?.priceMax ?? unitPrice)
    });

    return (
      <div className="service-detail-page">
        <section className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8, 20, 34, 0.68), rgba(8, 20, 34, 0.24)), url(${selectedJob.coverImage})` }}>
          <div>
            <span className="detail-kicker">{viText(selectedJob.categoryName)}</span>
            <h1>{viText(selectedJob.title)}</h1>
            <p>
              <Star size={18} fill="#f4c430" stroke="#f4c430" style={{ verticalAlign: "middle", marginRight: 4 }} />
              {selectedJob.ratingLabel} <span>|</span> {selectedJob.bookingCountLabel}
            </p>
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
                variants={selectedJob.serviceVariants}
                selectedVariantCode={selectedVariantCode}
                onVariantChange={setSelectedVariantCode}
                total={estimatedTotal}
                rangeTotalMin={rangeTotalMin}
                rangeTotalMax={rangeTotalMax}
                isRangePrice={isRangePrice}
                onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
                onIncrease={() => setQuantity((current) => current + 1)}
                onSubmit={() => navigate(`/booking?${bookingParams.toString()}`)}
              />
            </section>

            <section className="detail-section">
              <h2>
                <Sparkles size={22} style={{ verticalAlign: "middle", marginRight: 8, color: "#1977d2" }} />
                Quy trình thực hiện chuyên nghiệp
              </h2>
              <div className="process-grid">
                {selectedJob.processSteps.map((step, index) => (
                  <article key={step}>
                    <span className="process-icon">{index + 1}</span>
                    <h3>{step}</h3>
                  </article>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h2>
                <ShieldCheck size={22} style={{ verticalAlign: "middle", marginRight: 8, color: "#1977d2" }} />
                Cam kết chất lượng
              </h2>
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
              variants={selectedJob.serviceVariants}
              selectedVariantCode={selectedVariantCode}
              onVariantChange={setSelectedVariantCode}
              total={estimatedTotal}
              rangeTotalMin={rangeTotalMin}
              rangeTotalMax={rangeTotalMax}
              isRangePrice={isRangePrice}
              onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
              onIncrease={() => setQuantity((current) => current + 1)}
              onSubmit={() => navigate(`/booking?${bookingParams.toString()}`)}
            />
          </aside>
        </section>

        <section className="detail-reviews">
          <h2>
            <Quote size={22} style={{ verticalAlign: "middle", marginRight: 8, color: "#1977d2" }} />
            Đánh giá khách hàng
          </h2>
          <div className="detail-review-carousel">
            <button className="carousel-arrow" type="button" aria-label="Trước">
              <ChevronLeft size={20} />
            </button>
            {selectedJob.reviews.slice(0, 2).map((review) => (
              <article key={review.author} className="detail-review-card">
                <img src={review.image} alt={review.author} />
                <div>
                  <div className="stars">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={16} fill="#f4c430" stroke="#f4c430" />
                    ))}
                  </div>
                  <p>"{review.comment}"</p>
                </div>
              </article>
            ))}
            <button className="carousel-arrow" type="button" aria-label="Sau">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="carousel-dots" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
            <span />
          </div>
        </section>

        <section className="detail-faq">
          <h2>
            <HelpCircle size={22} style={{ verticalAlign: "middle", marginRight: 8, color: "#1977d2" }} />
            Câu hỏi thường gặp (FAQ)
          </h2>
          {selectedJob.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}
                <ChevronDown size={18} className="faq-chevron" />
              </summary>
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
        <span className="eyebrow">Tìm dịch vụ phù hợp</span>
        <h1>Dịch vụ tại nhà được chọn lọc theo nhu cầu của bạn.</h1>
        <p>So sánh giá, đánh giá và lịch phục vụ để đặt dịch vụ nhanh hơn.</p>
        <form
          className="services-search"
          onSubmit={(event) => {
            event.preventDefault();
            updateParams({});
          }}
        >
          <div className="services-search-field">
            <Tag size={18} className="field-icon" />
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
          </div>
          <div className="services-search-field">
            <MapPin size={18} className="field-icon" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nhập từ khóa hoặc địa chỉ..."
            />
          </div>
          <button className="button primary search-btn" type="submit">
            <Search size={18} />
            Tìm kiếm
          </button>
        </form>
        <div className="services-hero-stats" aria-label="Tổng quan tìm kiếm">
          <span><strong>{jobs.length}</strong> dịch vụ</span>
          <span><strong>{categories.length}</strong> nhóm ngành</span>
          <span><strong>{activeFilterCount}</strong> bộ lọc đang dùng</span>
        </div>
      </section>

      {feedback ? <p className="feedback">{feedback}</p> : null}

      <section className="services-results">
        <aside className="services-filter">
          <div className="services-filter-head">
            <h2>
              <SlidersHorizontal size={20} />
              Bộ lọc
            </h2>
            <span>{activeFilterCount} đang chọn</span>
          </div>

          <div className="filter-block">
            <h3>
              <DollarSign size={16} />
              Khoảng giá
            </h3>
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
            <h3>
              <Star size={16} />
              Đánh giá
            </h3>
            <label>
              <input type="checkbox" checked={fourStarOnly} onChange={(event) => setFourStarOnly(event.target.checked)} />
              <span className="filter-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="#f4c430" stroke="#f4c430" />
                ))}
              </span>
              <small>(5)</small>
            </label>
            <label>
              <input type="checkbox" />
              <span className="filter-stars">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Star key={i} size={14} fill="#f4c430" stroke="#f4c430" />
                ))}
                <Star size={14} fill="none" stroke="#d0d8e2" />
              </span>
              <small>(3)</small>
            </label>
            <label>
              <input type="checkbox" />
              <span className="filter-stars">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star key={i} size={14} fill="#f4c430" stroke="#f4c430" />
                ))}
                {Array.from({ length: 2 }).map((_, i) => (
                  <Star key={i} size={14} fill="none" stroke="#d0d8e2" />
                ))}
              </span>
              <small>(2)</small>
            </label>
          </div>

          <div className="filter-block">
            <h3>
              <Tag size={16} />
              Loại dịch vụ
            </h3>
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
            <h3>
              <Clock size={16} />
              Thời gian phục vụ
            </h3>
            <label><input type="checkbox" defaultChecked /> 8:00 - 12:00</label>
            <label><input type="checkbox" defaultChecked /> 12:00 - 18:00</label>
            <label><input type="checkbox" defaultChecked /> 18:00 - 21:00</label>
          </div>
        </aside>

        <div className="services-content">
          {userProfile?.role === "candidate" && (
            <div className="pending-orders-section">
              <div className="services-section-head">
                <h2>Công việc đang chờ thợ</h2>
                <span className="services-count-badge">{pendingOrders.length} đơn</span>
              </div>
              <div className="service-product-grid">
                {pendingOrders.map((order) => (
                  <article key={order.code} className="service-product-card">
                    <div className="product-image-wrapper">
                      <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800" alt="Công việc" />
                    </div>
                    <div className="service-product-body">
                      <span className="product-chip">Đơn đang mở</span>
                      <h3>{order.jobTitle || "Dịch vụ tận nơi"}</h3>
                      <div className="product-meta">
                        <span className="product-rating">
                          <Clock size={14} />
                          {new Date(order.scheduledAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <strong className="product-price">
                        {order.totalAmount.toLocaleString()}đ
                      </strong>
                      <p className="location-text">
                        <MapPin size={14} /> {order.address}
                      </p>
                      <button
                        className="button primary product-cta"
                        type="button"
                        onClick={() => navigate(`/orders/${order.code}`)}
                      >
                        Xem chi tiết & Nhận việc
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {pendingOrders.length === 0 && (
                <div className="empty-state">
                  <Search size={48} strokeWidth={1.2} />
                  <p>Hiện chưa có công việc mới nào.</p>
                </div>
              )}
              <hr className="section-divider" />
            </div>
          )}

          <div className="services-result-head">
            <div>
              <span className="eyebrow">{userProfile?.role === "candidate" ? "Kho dịch vụ" : "Kết quả phù hợp"}</span>
              <h1>{userProfile?.role === "candidate" ? "Tất cả dịch vụ hệ thống" : "Dịch vụ liên quan"}</h1>
              <p>{displayJobs.length} kết quả cho <strong>{resultLabel}</strong></p>
            </div>
            <div className="services-active-chips">
              {selectedCategories.map((item) => <span key={item}>{viText(item)}</span>)}
              {fourStarOnly ? <span>4 sao trở lên</span> : null}
            </div>
          </div>

          <div className="service-product-grid">
            {primaryJobs.map((job) => <ServiceProductCard key={job.code} job={job} onOpen={openJobDetail} />)}
          </div>

          {!primaryJobs.length && userProfile?.role !== "candidate" ? (
            <div className="empty-state">
              <Search size={48} strokeWidth={1.2} />
              <p>Không có dịch vụ phù hợp với bộ lọc hiện tại.</p>
            </div>
          ) : null}

          <div className="services-section-head">
            <h2>
              <Sparkles size={20} />
              Gợi ý cho bạn
            </h2>
            <div className="services-mini-arrows">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                <ChevronLeft size={16} />
              </button>
              <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="service-product-grid">
            {recommendedJobs.map((job) => <ServiceProductCard key={job.code} job={job} onOpen={openJobDetail} compact />)}
          </div>

          {totalPages > 1 && (
            <div className="services-pagination" aria-label="Phân trang dịch vụ">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                <ChevronLeft size={16} />
              </button>
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
              <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}

function ServiceProductCard({ job, onOpen, compact = false }: { job: Job; onOpen: (jobCode: string) => void; compact?: boolean }) {
  return (
    <article className={`service-product-card ${compact ? "compact" : ""}`} onClick={() => onOpen(job.code)}>
      <div className="product-image-wrapper">
        <img src={job.coverImage} alt={viText(job.title)} />
        <span className="product-image-badge">{viText(job.categoryName ?? "Dịch vụ")}</span>
      </div>
      <div className="service-product-body">
        <h3>{viText(job.title)}</h3>
        <div className="product-meta">
          <span className="product-rating">
            <Star size={14} fill="#f4c430" stroke="#f4c430" />
            {job.ratingLabel ?? "5.0"}
          </span>
          <span className="product-bookings">
            <Users size={13} />
            {job.bookingCountLabel ?? `${job.applicantsCount}+ đặt`}
          </span>
        </div>
        {job.budgetMin > 0 && (
          <strong className="product-price">
            {job.budgetMin.toLocaleString()}đ
          </strong>
        )}
        <button className="button primary product-cta" type="button" onClick={(event) => { event.stopPropagation(); onOpen(job.code); }}>
          Xem chi tiết
          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

function BookingCard({
  quantity,
  unitLabel,
  variants,
  selectedVariantCode,
  onVariantChange,
  total,
  rangeTotalMin,
  rangeTotalMax,
  isRangePrice,
  onDecrease,
  onIncrease,
  onSubmit
}: {
  quantity: number;
  unitLabel: string;
  variants: JobDetail["serviceVariants"];
  selectedVariantCode: string;
  onVariantChange: (value: string) => void;
  total: number;
  rangeTotalMin: number;
  rangeTotalMax: number;
  isRangePrice: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onSubmit: () => void;
}) {
  return (
    <article className="booking-card">
      <h2>
        <CalendarCheck size={22} style={{ verticalAlign: "middle", marginRight: 8, color: "#1977d2" }} />
        Đặt lịch
      </h2>
      <div className="booking-quantity">
        <span>Số lượng {unitLabel}</span>
        <div>
          <button type="button" onClick={onDecrease} aria-label="Giảm">
            <Minus size={18} />
          </button>
          <strong>{quantity}</strong>
          <button type="button" onClick={onIncrease} aria-label="Tăng">
            <Plus size={18} />
          </button>
        </div>
      </div>
      <div className="booking-machine-type">
        <label>Loại {unitLabel}</label>
        <select value={selectedVariantCode} onChange={(event) => onVariantChange(event.target.value)}>
          {variants.map((variant) => (
            <option key={variant.code} value={variant.code}>
              {variant.name} - {variant.pricingType === "range"
                ? `${(variant.priceMin ?? 0).toLocaleString()}đ - ${(variant.priceMax ?? 0).toLocaleString()}đ`
                : `${(variant.price ?? 0).toLocaleString()}đ`}
            </option>
          ))}
        </select>
      </div>
      <p>
        {isRangePrice ? "Giá tham khảo: " : "Tổng tiền tạm tính: "}
        <strong>
          {isRangePrice
            ? `${rangeTotalMin.toLocaleString()} - ${rangeTotalMax.toLocaleString()} VND`
            : `${total.toLocaleString()} VND`}
        </strong>
      </p>
      {isRangePrice ? <small>Loại này cần thợ đến khảo sát để chốt giá chính xác.</small> : null}
      <button className="button primary" type="button" onClick={onSubmit}>
        <CalendarCheck size={18} style={{ marginRight: 6 }} />
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
      <h2>
        <Sparkles size={22} style={{ verticalAlign: "middle", marginRight: 8, color: "#1977d2" }} />
        Dịch vụ gợi ý cho bạn
      </h2>
      <div className="suggested-row">
        {jobs.map((job) => (
          <article key={job.code} className="suggested-card" onClick={() => onOpen(job.code)}>
            <img src={job.coverImage} alt={viText(job.title)} />
            <div>
              <h3>{viText(job.title)}</h3>
              <strong>{job.displayPriceLabel ?? viText(job.salaryLabel)}</strong>
              <p>
                <Star size={13} fill="#f4c430" stroke="#f4c430" style={{ verticalAlign: "middle", marginRight: 3 }} />
                {job.ratingLabel ?? "5"} sao
              </p>
              <p>
                <Users size={13} style={{ verticalAlign: "middle", marginRight: 3 }} />
                {job.bookingCountLabel ?? `${job.applicantsCount}+ đã đặt`}
              </p>
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
        <p>
          <Phone size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
          0833 256 780
        </p>
        <p>ViecNhanh.com</p>
      </div>
      <div>
        <h3>Mạng xã hội</h3>
        <div className="social-row">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">ig</a>
          <a href="#" aria-label="YouTube">yt</a>
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
