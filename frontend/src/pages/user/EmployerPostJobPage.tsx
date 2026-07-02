import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { platformApi } from "../../api/platformApi";
import { DEMO_CANDIDATE_CODE } from "../../config";
import type { Category, CheckoutInfo, Job, JobDetail, Order, UserProfile } from "../../types/platform";


const AUTH_STORAGE_KEY = "homeswift_user";
const BANK_INFO = {
  bankBin: "970436",
  bankName: "VCB",
  accountNumber: "0123456789",
  accountName: "ViecNhanh"
};

const PROVINCES_API = "https://provinces.open-api.vn/api";

type ProvinceOption = {
  code: number;
  name: string;
};

type DistrictOption = {
  code: number;
  name: string;
};

type WardOption = {
  code: number;
  name: string;
};

const timeSlots = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00"
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);
}

function parseBudget(label?: string) {
  if (!label) return 0;
  const cleaned = label.replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export default function EmployerPostJobPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobCode = searchParams.get("jobCode") || "";
  const queryVariantCode = searchParams.get("variantCode") || "";
  const queryUnitPrice = parseBudget(searchParams.get("unitPrice") || "");

  const [categories, setCategories] = useState<Category[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [selectedCategoryCode, setSelectedCategoryCode] = useState("");
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [selectedVariantCode, setSelectedVariantCode] = useState("");

  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [addressLine, setAddressLine] = useState("");

  const [startDateStr, setStartDateStr] = useState("");
  const [startTimeSlot, setStartTimeSlot] = useState(timeSlots[0]);
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "bank_transfer">("wallet");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed.role !== "employer") {
      navigate("/");
      return;
    }
    platformApi.getProfile().then(setProfile).catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    platformApi.getUserHome().then((data) => {
      setCategories(data.categories || []);
      setJobs(data.featuredJobs || []);
    }).catch((r: Error) => setFeedback(r.message));
  }, []);

  useEffect(() => {
    fetch(`${PROVINCES_API}/p/`).then((r) => r.json()).then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict("");
      setSelectedWard("");
      return;
    }
    fetch(`${PROVINCES_API}/p/${selectedProvince}?depth=2`)
      .then((r) => r.json())
      .then((data) => setDistricts(data.districts || []))
      .catch(() => {});
    setSelectedDistrict("");
    setSelectedWard("");
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }
    fetch(`${PROVINCES_API}/d/${selectedDistrict}?depth=2`)
      .then((r) => r.json())
      .then((data) => setWards(data.wards || []))
      .catch(() => {});
    setSelectedWard("");
  }, [selectedDistrict]);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.code === selectedCategoryCode) || null;
  }, [categories, selectedCategoryCode]);

  useEffect(() => {
    if (jobCode) {
      platformApi.getUserJobDetail(jobCode).then((detail) => {
        setJobDetail(detail);
        setSelectedCategoryCode(detail.categoryCode);
        setSelectedVariantCode(queryVariantCode || detail.serviceVariants[0]?.code || "");
        const loc = detail.location || "";
        const segments = loc.split(",").map((s) => s.trim());
        if (segments.length >= 4) {
          setAddressLine(segments.slice(0, segments.length - 3).join(", "));
        } else {
          setAddressLine(loc);
        }
      }).catch((reason: Error) => setFeedback(reason.message));
    } else if (categories.length > 0 && !selectedCategoryCode) {
      setSelectedCategoryCode(categories[0].code);
    }
  }, [jobCode, categories, queryVariantCode]);

  useEffect(() => {
    if (jobCode || !selectedCategoryCode || !jobs.length) return;

    const matchedJob = jobs.find((job) => job.categoryCode === selectedCategoryCode);
    if (!matchedJob) {
      setJobDetail(null);
      setSelectedVariantCode("");
      return;
    }

    platformApi.getUserJobDetail(matchedJob.code).then((detail) => {
      setJobDetail(detail);
      const fallbackVariants = selectedCategory?.serviceVariants ?? [];
      setSelectedVariantCode(
        queryVariantCode || detail.serviceVariants[0]?.code || fallbackVariants[0]?.code || ""
      );
    }).catch((reason: Error) => setFeedback(reason.message));
  }, [jobCode, jobs, selectedCategoryCode, queryVariantCode, selectedCategory]);

  const serviceVariants = useMemo(() => {
    if (jobDetail?.serviceVariants && jobDetail.serviceVariants.length > 0) {
      return jobDetail.serviceVariants;
    }
    return selectedCategory?.serviceVariants ?? [];
  }, [jobDetail, selectedCategory]);

  const selectedVariant = useMemo(() => {
    return serviceVariants.find((item) => item.code === selectedVariantCode) || serviceVariants[0] || null;
  }, [serviceVariants, selectedVariantCode]);

  const unitPrice = useMemo(() => {
    return selectedVariant?.price ?? (jobDetail ? (queryUnitPrice || jobDetail.budgetMin || parseBudget(selectedCategory?.averageBudgetLabel)) : 0);
  }, [selectedVariant, jobDetail, queryUnitPrice, selectedCategory]);

  const subtotal = unitPrice;
  const serviceFee = Math.round(subtotal * 0.05);
  const tax = Math.round(subtotal * 0.02);
  const total = subtotal + serviceFee + tax;

  const fullLocation = useMemo(() => {
    const pLabel = provinces.find((p) => String(p.code) === selectedProvince)?.name || "";
    const dLabel = districts.find((d) => String(d.code) === selectedDistrict)?.name || "";
    const wLabel = wards.find((w) => String(w.code) === selectedWard)?.name || "";
    return [addressLine, wLabel, dLabel, pLabel].filter(Boolean).join(", ");
  }, [addressLine, selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards]);

  const previewQrUrl = useMemo(() => {
    const memoText = `DAT_LICH_${selectedCategoryCode}_${selectedVariantCode || "DEFAULT"}`.toUpperCase();
    return `https://api.vietqr.io/image/${BANK_INFO.bankBin}-${BANK_INFO.accountNumber}-qr_only.png?amount=${total}&addInfo=${encodeURIComponent(memoText)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
  }, [selectedCategoryCode, selectedVariantCode, total]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback("");
    if (!profile) return;
    if (!fullLocation) {
      setFeedback("Vui lòng nhập địa chỉ cụ thể");
      return;
    }
    if (!startDateStr) {
      setFeedback("Vui lòng chọn ngày thực hiện");
      return;
    }

    try {
      let finalJobCode = jobCode;
      if (!finalJobCode) {
        const createdJob = await platformApi.createUserJob({
          title: `Đặt lịch ${selectedCategory?.name || "Dịch vụ"}`,
          categoryCode: selectedCategoryCode,
          location: fullLocation,
          salaryLabel: formatCurrency(unitPrice),
          budgetMin: unitPrice,
          budgetMax: unitPrice,
          employmentType: "one_time",
          urgency: "normal",
          summary: note || `Yêu cầu dịch vụ đặt nhanh cho gói ${selectedVariant?.name || "mặc định"}`,
          requirements: [{ text: "Gói dịch vụ đã chọn", value: selectedVariant?.name || "Mặc định" }],
          serviceVariants: serviceVariants,
          startDate: `${startDateStr}T${startTimeSlot.split(" ")[0]}:00`
        });
        finalJobCode = createdJob.code;
      }

      const checkoutPayload: CheckoutInfo = {
        jobCode: finalJobCode,
        candidateCode: DEMO_CANDIDATE_CODE,
        paymentMethod,
        subtotal,
        serviceFee,
        tax,
        total
      };

      const order: Order = await platformApi.createOrderCheckout(checkoutPayload);
      navigate(`/employer/orders?highlight=${order.code}`);
    } catch (err: any) {
      setFeedback(err.message || "Không thể hoàn tất đặt lịch");
    }
  };

  return (
    <section className="booking-container">
      <header className="booking-header">
        <h1>Đặt lịch dịch vụ nhanh</h1>
        <p>Chọn giải pháp phù hợp nhất cho không gian sống của bạn</p>
      </header>

      <form className="booking-layout" onSubmit={handleSubmit}>
        <main className="booking-main-content">
          <fieldset className="booking-card">
            <legend>Loại dịch vụ &amp; Gói cấu hình</legend>
            <div className="form-group">
              <label>Danh mục dịch vụ</label>
              <select
                value={selectedCategoryCode}
                onChange={(e) => {
                  setSelectedCategoryCode(e.target.value);
                  setJobDetail(null);
                  setSelectedVariantCode("");
                }}
                disabled={Boolean(jobCode)}
              >
                {categories.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {serviceVariants.length > 0 ? (
              <div className="form-group">
                <label>Các gói dịch vụ có sẵn</label>
                <div className="variants-grid">
                  {serviceVariants.map((item) => (
                    <label
                      key={item.code}
                      className={`variant-card ${selectedVariantCode === item.code ? "active" : ""}`}
                    >
                      <input
                        type="radio"
                        name="service_variant"
                        value={item.code}
                        checked={selectedVariantCode === item.code}
                        onChange={(e) => setSelectedVariantCode(e.target.value)}
                      />
                      <div className="variant-info">
                        <span className="v-name">{item.name}</span>
                        <span className="v-price">
                          {item.pricingType === "range" ? "Từ " : ""}
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </fieldset>

          <fieldset className="booking-card">
            <legend>Địa chỉ làm việc</legend>
            <div className="address-selectors">
              <div className="form-group">
                <label>Tỉnh / Thành phố</label>
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}>
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quận / Huyện</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedProvince}
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Phường / Xã</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  disabled={!selectedDistrict}
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Số nhà, ngõ hẻm, tên đường cụ thể</label>
              <input
                type="text"
                placeholder="Ví dụ: Số 123 Ngõ 45 Đường Cầu Giấy"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
              />
            </div>
          </fieldset>

          <fieldset className="booking-card">
            <legend>Thời gian &amp; Ghi chú</legend>
            <div className="datetime-row">
              <div className="form-group">
                <label>Ngày thực hiện</label>
                <input type="date" value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Khung giờ làm việc</label>
                <select value={startTimeSlot} onChange={(e) => setStartTimeSlot(e.target.value)}>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Ghi chú hoặc yêu cầu đặc biệt khác</label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú cho thợ (Ví dụ: nhà có nuôi chó dữ, cần mang thêm cây lau nhà...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </fieldset>
        </main>

        <aside className="booking-sidebar">
          <div className="booking-summary-panel">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-item">
              <span>Gói dịch vụ</span>
              <strong>{selectedVariant?.name || "Mặc định"}</strong>
            </div>
            <div className="summary-item">
              <span>Đơn giá gói</span>
              <span>{formatCurrency(unitPrice)}</span>
            </div>
            <hr />
            <div className="summary-item">
              <span>Tạm tính</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-item">
              <span>Phí nền tảng (5%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <div className="summary-item">
              <span>Thuế tích hợp (2%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <hr />
            <div className="summary-item total-row">
              <span>Tổng cộng thanh toán</span>
              <span className="price-tag">{formatCurrency(total)}</span>
            </div>
          </div>

          <aside className="payment-method-panel">
            <h3>Phương thức thanh toán</h3>
            <fieldset className="payment-options">
              <label className={`payment-option-card ${paymentMethod === "wallet" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="wallet"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                />
                <div>
                  <span>Ví điện tử cá nhân</span>
                  <small>Số dư khả dụng: {profile ? formatCurrency(profile.walletBalance) : "--"}</small>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === "bank_transfer" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={() => setPaymentMethod("bank_transfer")}
                />
                <div>
                  <span>Chuyển khoản Ngân hàng (VietQR)</span>
                  <small>Quét mã chuyển khoản nhanh tự động nhận diện đơn</small>
                </div>
              </label>
            </fieldset>

            {paymentMethod === "bank_transfer" ? (
              <article className="payment-qr-preview">
                <img src={previewQrUrl} alt="QR chuyển khoản ngân hàng" crossOrigin="anonymous" />
                <div>
                  <span>Số tiền chuyển khoản</span>
                  <strong>{formatCurrency(total)}</strong>
                  <p>{BANK_INFO.bankName} · {BANK_INFO.accountNumber} · {BANK_INFO.accountName}</p>
                </div>
              </article>
            ) : null}

            <button className="button primary booking-submit" type="submit">
              Tiếp tục thanh toán
            </button>
            {feedback ? <p className="booking-feedback">{feedback}</p> : null}
          </aside>
        </aside>
      </form>

      <footer className="home-footer booking-footer">
        <div>
          <h3>Liên hệ</h3>
          <p>0833 256 780</p>
          <p>ViecNhanh.com</p>
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
    </section>
  );
}