import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { platformApi } from "../../api/platformApi";
import { DEMO_CANDIDATE_CODE } from "../../config";
import type { Category, CheckoutInfo, Job, JobDetail, Order, UserProfile } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

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

function readStoredUserCode() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return DEMO_CANDIDATE_CODE;
  }

  try {
    return JSON.parse(raw)?.code ?? DEMO_CANDIDATE_CODE;
  } catch {
    return DEMO_CANDIDATE_CODE;
  }
}

function parseBudget(label?: string) {
  const firstNumber = label?.match(/\d+/)?.[0];
  return firstNumber ? Number(firstNumber) * 1000 : 150000;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function buildBankQrUrl(amount: number, transferContent: string) {
  const qrParams = new URLSearchParams({
    amount: String(amount),
    addInfo: transferContent,
    accountName: BANK_INFO.accountName
  });

  return `https://img.vietqr.io/image/${BANK_INFO.bankBin}-${BANK_INFO.accountNumber}-compact2.png?${qrParams.toString()}`;
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildServiceDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return {
      value: toDateValue(date),
      day: date.getDate(),
      label: date.toLocaleDateString("vi-VN", { weekday: "short" }),
      fullLabel: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    };
  });
}

function getSlotStart(slot: string) {
  const [hour = "0", minute = "0"] = slot.split(" - ")[0].split(":");
  return { hour: Number(hour), minute: Number(minute) };
}

function isPastSlot(dateValue: string, slot: string) {
  const now = new Date();
  const { hour, minute } = getSlotStart(slot);
  const slotDate = new Date(`${dateValue}T00:00:00`);
  slotDate.setHours(hour, minute, 0, 0);
  return slotDate.getTime() <= now.getTime();
}

function toScheduledAt(dateValue: string, slot: string) {
  const { hour, minute } = getSlotStart(slot);
  const date = new Date(`${dateValue}T00:00:00`);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

async function fetchAddressJson<T>(path: string): Promise<T> {
  const response = await fetch(`${PROVINCES_API}${path}`);
  if (!response.ok) {
    throw new Error("Không tải được dữ liệu địa chỉ từ provinces.open-api.vn.");
  }
  return response.json() as Promise<T>;
}

export default function EmployerPostJobPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobCode = searchParams.get("jobCode") ?? "";
  const queryQuantity = Math.max(1, Number(searchParams.get("quantity") ?? 1));
  const queryVariantCode = searchParams.get("variantCode") ?? "";
  const queryMachineType = searchParams.get("machineType") ?? "";
  const queryUnitPrice = Number(searchParams.get("unitPrice") ?? 0);
  const queryPricingType = searchParams.get("pricingType") ?? "fixed";
  const queryPriceMin = Number(searchParams.get("priceMin") ?? 0);
  const queryPriceMax = Number(searchParams.get("priceMax") ?? 0);
  const userCode = readStoredUserCode();

  const [categories, setCategories] = useState<Category[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState("");
  const [quantity, setQuantity] = useState(queryQuantity);
  const [selectedVariantCode, setSelectedVariantCode] = useState(queryVariantCode);
  const [selectedDay, setSelectedDay] = useState(() => toDateValue(new Date()));
  const [selectedTime, setSelectedTime] = useState("");
  const [addressMode, setAddressMode] = useState<"saved" | "new">("new");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [provinceOptions, setProvinceOptions] = useState<ProvinceOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<DistrictOption[]>([]);
  const [wardOptions, setWardOptions] = useState<WardOption[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [voucher, setVoucher] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [checkout, setCheckout] = useState<CheckoutInfo | null>(null);
  const [feedback, setFeedback] = useState("");
  const [addressFeedback, setAddressFeedback] = useState("");
  const [transferNoticeOpen, setTransferNoticeOpen] = useState(false);

  useEffect(() => {
    platformApi.getUserHome().then((data) => {
      setCategories(data.categories);
    });
    platformApi.getUserJobs().then(setJobs).catch((reason: Error) => setFeedback(reason.message));
    platformApi.getUserProfile(userCode).then((data) => {
      setProfile(data);
      const firstAddress = data.savedAddresses[0] || data.address;
      if (firstAddress) {
        setSelectedAddress(firstAddress);
        setAddressMode("saved");
      }
    });
  }, [userCode]);

  useEffect(() => {
    fetchAddressJson<ProvinceOption[]>("/p/")
      .then(setProvinceOptions)
      .catch((reason: Error) => setAddressFeedback(reason.message));
  }, []);

  useEffect(() => {
    if (!jobCode) {
      return;
    }

    platformApi.getUserJobDetail(jobCode).then((detail) => {
      setJobDetail(detail);
      setSelectedCategoryCode(detail.categoryCode);
      setQuantity(queryQuantity);
      setSelectedVariantCode(queryVariantCode || detail.serviceVariants[0]?.code || "");
    }).catch((reason: Error) => setFeedback(reason.message));
  }, [jobCode, queryQuantity, queryVariantCode]);

  useEffect(() => {
    if (jobCode || !selectedCategoryCode || !jobs.length) {
      return;
    }

    const matchedJob = jobs.find((job) => job.categoryCode === selectedCategoryCode);
    if (!matchedJob) {
      setJobDetail(null);
      setSelectedVariantCode("");
      return;
    }

    platformApi.getUserJobDetail(matchedJob.code).then((detail) => {
      setJobDetail(detail);
      setSelectedVariantCode(detail.serviceVariants[0]?.code || "");
    }).catch((reason: Error) => setFeedback(reason.message));
  }, [jobCode, jobs, selectedCategoryCode]);

  const serviceDays = useMemo(() => buildServiceDays(), []);
  const availableTimeSlots = useMemo(
    () => timeSlots.filter((slot) => !isPastSlot(selectedDay, slot)),
    [selectedDay]
  );

  useEffect(() => {
    if (!availableTimeSlots.length) {
      setSelectedTime("");
      return;
    }

    setSelectedTime((current) => availableTimeSlots.includes(current) ? current : availableTimeSlots[0]);
  }, [availableTimeSlots]);

  useEffect(() => {
    setSelectedDistrict("");
    setSelectedWard("");
    setDistrictOptions([]);
    setWardOptions([]);

    if (!selectedCity) {
      return;
    }

    fetchAddressJson<{ districts: DistrictOption[] }>(`/p/${selectedCity}?depth=2`)
      .then((data) => setDistrictOptions(data.districts ?? []))
      .catch((reason: Error) => setAddressFeedback(reason.message));
  }, [selectedCity]);

  useEffect(() => {
    setSelectedWard("");
    setWardOptions([]);

    if (!selectedDistrict) {
      return;
    }

    fetchAddressJson<{ wards: WardOption[] }>(`/d/${selectedDistrict}?depth=2`)
      .then((data) => setWardOptions(data.wards ?? []))
      .catch((reason: Error) => setAddressFeedback(reason.message));
  }, [selectedDistrict]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.code === selectedCategoryCode),
    [categories, selectedCategoryCode]
  );

  const selectedProvinceName = provinceOptions.find((item) => String(item.code) === selectedCity)?.name ?? "";
  const selectedDistrictName = districtOptions.find((item) => String(item.code) === selectedDistrict)?.name ?? "";
  const selectedWardName = wardOptions.find((item) => String(item.code) === selectedWard)?.name ?? "";
  const newAddressErrors = {
    city: addressMode === "new" && !selectedCity ? "Vui lòng chọn tỉnh/thành phố." : "",
    district: addressMode === "new" && !selectedDistrict ? "Vui lòng chọn quận/huyện." : "",
    ward: addressMode === "new" && !selectedWard ? "Vui lòng chọn phường/xã." : "",
    street: addressMode === "new" && !newAddress.trim() ? "Vui lòng nhập địa chỉ cụ thể." : ""
  };
  const savedAddresses = profile?.savedAddresses ?? [];
  const unitLabel = jobDetail?.unitLabel ?? "dich vu";
  const serviceVariants = jobDetail?.serviceVariants ?? [];
  const selectedVariant = serviceVariants.find((item) => item.code === selectedVariantCode) ?? serviceVariants[0];
  const pricingType = selectedVariant?.pricingType ?? queryPricingType;
  const machineType = selectedVariant?.name ?? (queryMachineType || "");
  const unitPrice = selectedVariant?.price ?? (jobDetail ? (queryUnitPrice || jobDetail.budgetMin || parseBudget(selectedCategory?.averageBudgetLabel)) : 0);
  const rangePriceMin = selectedVariant?.priceMin ?? (queryPriceMin || unitPrice);
  const rangePriceMax = selectedVariant?.priceMax ?? (queryPriceMax || unitPrice);
  const isRangePrice = pricingType === "range";
  const subtotal = unitPrice * quantity;
  const rangeSubtotalMin = rangePriceMin * quantity;
  const rangeSubtotalMax = rangePriceMax * quantity;
  const serviceFee = Math.round(subtotal * 0.05);
  const tax = Math.round(subtotal * 0.0273);
  const total = subtotal + serviceFee + tax;
  const address = addressMode === "saved" ? selectedAddress : `${newAddress.trim()}, ${selectedWardName}, ${selectedDistrictName}, ${selectedProvinceName}`;
  const hasNewAddressError = Boolean(newAddressErrors.city || newAddressErrors.district || newAddressErrors.ward || newAddressErrors.street);
  const previewTransferContent = "HOMESWIFT TAO DON";
  const previewQrUrl = buildBankQrUrl(total, previewTransferContent);
  const variantPriceLabel = (variant: typeof serviceVariants[number]) => {
    if (variant.pricingType === "range") {
      return `${variant.name} (${formatCurrency(variant.priceMin ?? 0)} - ${formatCurrency(variant.priceMax ?? 0)})`;
    }
    return `${variant.name} (${formatCurrency(variant.price ?? 0)})`;
  };

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback("");

    if (!selectedCategory) {
      setFeedback("Vui lòng chọn loại dịch vụ.");
      return;
    }

    if (!jobDetail) {
      setFeedback("Vui long chon loai dich vu hop le truoc khi thanh toan.");
      return;
    }

    if (serviceVariants.length && !selectedVariant) {
      setFeedback("Vui long chon loai may/dich vu.");
      return;
    }

    if (!selectedTime) {
      setFeedback("Vui lòng chọn khung giờ còn khả dụng.");
      return;
    }

    if ((addressMode === "saved" && !selectedAddress) || (addressMode === "new" && hasNewAddressError)) {
      setFeedback("Vui lòng nhập đầy đủ địa chỉ dịch vụ trước khi thanh toán.");
      setAddressMode("new");
      return;
    }

    try {
      const sourceJobCode = jobDetail.code;

      const result = await platformApi.createUserOrder({
        userCode,
        jobCode: sourceJobCode,
        scheduledAt: toScheduledAt(selectedDay, selectedTime),
        totalAmount: total,
        paymentMethod,
        address,
        quantity,
        machineType: isRangePrice ? `${machineType} (${formatCurrency(rangePriceMin)} - ${formatCurrency(rangePriceMax)} / ${unitLabel})` : machineType
      });

      setCreatedOrder(result.order);
      setCheckout(result.checkout);
      const updatedProfile = await platformApi.getUserProfile(userCode);
      setProfile(updatedProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}")), ...updatedProfile }));
      window.dispatchEvent(new Event("homeswift-auth"));
      setFeedback(result.checkout ? "Đơn đã được tạo. Vui lòng quét QR để thanh toán." : "Đã xác nhận đặt lịch. Đơn đang chờ hệ thống điều phối thợ.");
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

  const confirmTransferred = async () => {
    if (!createdOrder) {
      return;
    }

    try {
      const updatedOrder = await platformApi.markOrderTransferred(createdOrder.code);
      setCreatedOrder(updatedOrder);
      setTransferNoticeOpen(true);
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

  if (checkout && createdOrder) {
    return (
      <div className="booking-page">
        <section className="booking-shell checkout-shell">
          <h1>Thanh toán chuyển khoản</h1>
          <div className="checkout-grid">
            <article className="checkout-qr-card">
              <img 
                src={checkout.qrUrl} 
                alt={`QR thanh toán đơn ${createdOrder.code}`} 
                crossOrigin="anonymous"
              />
              <div>
                <span>Số tiền</span>
                <strong>{formatCurrency(createdOrder.totalAmount)}</strong>
              </div>
            </article>

            <article className="checkout-info-card">
              <h2>Thông tin chuyển khoản</h2>
              <p>Ngân hàng: <b>{checkout.bankName}</b></p>
              <p>Số tài khoản: <b>{checkout.accountNumber}</b></p>
              <p>Chủ tài khoản: <b>{checkout.accountName}</b></p>
              <p>Nội dung: <b>{checkout.transferContent}</b></p>
              <div className="escrow-note">
                ViecNhanh sẽ giữ an toàn khoản tiền này. Tiền chỉ được chuyển cho thợ sau khi bạn nghiệm thu và hài lòng.
              </div>
              <button className="button primary booking-submit" type="button" onClick={confirmTransferred}>
                Tôi đã chuyển khoản
              </button>
              {feedback ? <p className="booking-feedback">{feedback}</p> : null}
              {transferNoticeOpen ? (
                <div className="otp-modal-backdrop" role="dialog" aria-modal="true">
                  <div className="otp-modal">
                    <button
                      type="button"
                      aria-label="Đóng thông báo"
                      onClick={() => navigate("/")}
                      style={{ marginLeft: "auto", border: 0, background: "transparent", fontSize: 22, cursor: "pointer" }}
                    >
                      ×
                    </button>
                    <h2>Đã ghi nhận chuyển khoản</h2>
                    <p>HomeSwift đã ghi nhận bạn đã chuyển khoản. Admin cần thời gian kiểm tra và duyệt tiền trước khi điều phối thợ.</p>
                    <button className="button primary" type="button" onClick={() => navigate("/")}>
                      Về trang chủ
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <section className="booking-shell">
        <h1>Thanh toán & Đặt lịch</h1>

        <form className="booking-layout" onSubmit={submitBooking}>
          <div className="booking-config">
            <h2>Cấu hình đơn hàng</h2>

            <section className="booking-step">
              <h3>Bước 1 - Chi tiết công việc</h3>
              <div className="booking-field-grid">
                <label>
                  Loại dịch vụ
                  <select
                    value={selectedCategoryCode}
                    onChange={(event) => {
                      setSelectedCategoryCode(event.target.value);
                      setJobDetail(null);
                      setSelectedVariantCode("");
                    }}
                    disabled={Boolean(jobCode)}
                  >
                    <option value="">Chọn loại dịch vụ</option>
                    {categories.map((category) => (
                      <option key={category.code} value={category.code}>
                        {viText(category.name)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Số lượng {unitLabel}
                  <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <option key={item} value={item}>{item} {unitLabel}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Loại {unitLabel}
                  <select
                    value={selectedVariantCode}
                    onChange={(event) => setSelectedVariantCode(event.target.value)}
                    disabled={!serviceVariants.length}
                  >
                    <option value="">Chọn loại {unitLabel}</option>
                    {serviceVariants.map((variant) => (
                      <option key={variant.code} value={variant.code}>
                        {variantPriceLabel(variant)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="booking-step">
              <h3>Bước 2 - Thời gian thực hiện</h3>
              <div className="schedule-grid">
                <div className="calendar-card">
                  <div className="calendar-head">
                    <strong>Chọn ngày dịch vụ</strong>
                  </div>
                  <div className="calendar-grid booking-date-grid">
                    {serviceDays.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        className={day.value === selectedDay ? "active" : ""}
                        onClick={() => setSelectedDay(day.value)}
                        title={day.fullLabel}
                      >
                        <span>{day.label}</span>
                        <b>{day.day}</b>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="time-slots">
                  <h4>Thời gian</h4>
                  <div>
                    {availableTimeSlots.length ? availableTimeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={slot === selectedTime ? "active" : ""}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </button>
                    )) : <p>Hôm nay không còn khung giờ phù hợp.</p>}
                  </div>
                </div>
              </div>
            </section>

            <section className="booking-step">
              <h3>Bước 3 - Địa điểm dịch vụ</h3>
              <div className="address-options">
                <span>Địa chỉ dịch vụ</span>
                {savedAddresses.length ? (
                  savedAddresses.map((item) => (
                    <label key={item}>
                      <input
                        type="radio"
                        checked={addressMode === "saved" && selectedAddress === item}
                        onChange={() => {
                          setAddressMode("saved");
                          setSelectedAddress(item);
                        }}
                      />
                      {item}
                    </label>
                  ))
                ) : <p>Chưa có địa chỉ đã lưu.</p>}
                <label>
                  <input
                    type="radio"
                    checked={addressMode === "new"}
                    onChange={() => setAddressMode("new")}
                  />
                  Thêm địa chỉ mới
                </label>
                {addressMode === "new" ? (
                  <div className="new-address-grid">
                    <label>
                      Tỉnh/Thành phố
                      <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)} aria-invalid={Boolean(newAddressErrors.city)}>
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinceOptions.map((city) => (
                          <option key={city.code} value={city.code}>{city.name}</option>
                        ))}
                      </select>
                      {newAddressErrors.city ? <small className="field-error">{newAddressErrors.city}</small> : null}
                    </label>
                    <label>
                      Quận/Huyện
                      <select value={selectedDistrict} onChange={(event) => setSelectedDistrict(event.target.value)} disabled={!selectedCity} aria-invalid={Boolean(newAddressErrors.district)}>
                        <option value="">Chọn quận/huyện</option>
                        {districtOptions.map((district) => (
                          <option key={district.code} value={district.code}>{district.name}</option>
                        ))}
                      </select>
                      {newAddressErrors.district ? <small className="field-error">{newAddressErrors.district}</small> : null}
                    </label>
                    <label>
                      Phường/Xã
                      <select value={selectedWard} onChange={(event) => setSelectedWard(event.target.value)} disabled={!selectedDistrict} aria-invalid={Boolean(newAddressErrors.ward)}>
                        <option value="">Chọn phường/xã</option>
                        {wardOptions.map((ward) => (
                          <option key={ward.code} value={ward.code}>{ward.name}</option>
                        ))}
                      </select>
                      {newAddressErrors.ward ? <small className="field-error">{newAddressErrors.ward}</small> : null}
                    </label>
                    <label>
                      Địa chỉ cụ thể
                      <input
                        value={newAddress}
                        onChange={(event) => setNewAddress(event.target.value)}
                        placeholder="Số nhà, tên đường, tòa nhà..."
                        aria-invalid={Boolean(newAddressErrors.street)}
                      />
                      {newAddressErrors.street ? <small className="field-error">{newAddressErrors.street}</small> : null}
                    </label>
                  </div>
                ) : null}
                {addressFeedback ? <small className="field-error">{addressFeedback}</small> : null}
              </div>
            </section>
          </div>

          <aside className="booking-summary-card">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="summary-lines">
              <span>{viText(jobDetail?.title ?? selectedCategory?.name)} (x{quantity})</span>
              <strong>{isRangePrice ? `${formatCurrency(rangeSubtotalMin)} - ${formatCurrency(rangeSubtotalMax)}` : formatCurrency(subtotal)}</strong>
              <span>Đơn giá</span>
              <strong>{isRangePrice ? `${formatCurrency(rangePriceMin)} - ${formatCurrency(rangePriceMax)} / ${unitLabel}` : `${formatCurrency(unitPrice)} / ${unitLabel}`}</strong>
              <span>Phí dịch vụ</span>
              <strong>{formatCurrency(serviceFee)}</strong>
              <span>Thuế</span>
              <strong>{formatCurrency(tax)}</strong>
            </div>
            <div className="summary-total">
              <span>Tổng cộng</span>
              <strong>{formatCurrency(total)}</strong>
            </div>

            <label className="voucher-field">
              Mã giảm giá (Voucher)
              <div>
                <input
                  value={voucher}
                  onChange={(event) => setVoucher(event.target.value)}
                  placeholder="Mã giảm giá"
                />
                <button type="button">Áp dụng</button>
              </div>
            </label>

            <fieldset className="payment-methods">
              <legend>Phương thức thanh toán</legend>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={() => setPaymentMethod("bank_transfer")}
                />
                Chuyển khoản QR ngân hàng
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                />
                Ví ViecNhanh ({formatCurrency(profile?.walletBalance ?? 0)})
              </label>
            </fieldset>

            {paymentMethod === "bank_transfer" ? (
              <article className="payment-qr-preview">
                <img 
                  src={previewQrUrl} 
                  alt="QR chuyển khoản ngân hàng" 
                  crossOrigin="anonymous"
                />
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
        </form>
      </section>

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
    </div>
  );
}
