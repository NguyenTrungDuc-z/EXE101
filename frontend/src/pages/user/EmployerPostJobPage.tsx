import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { DEMO_EMPLOYER_CODE } from "../../config";
import { platformApi } from "../../api/platformApi";
import type { Category } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

const savedAddresses = [
  "Nhà riêng - 123 Đường ABC, Quận 1, TP.HCM",
  "Văn phòng - 45 Nguyễn Huệ, Quận 1, TP.HCM"
];

const timeSlots = [
  "8:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "12:00 - 13:00",
  "14:00 - 16:00",
  "17:00 - 18:00"
];

const serviceUnits = ["1 máy", "2 máy", "3 máy"];
const machineTypes = ["Treo tường", "Âm trần", "Tủ đứng"];

function parseBudget(label?: string) {
  const firstNumber = label?.match(/\d+/)?.[0];
  return firstNumber ? Number(firstNumber) * 1000 : 150000;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function getCalendarDays() {
  return [
    ["Mo", "Tu", "Tr", "Th", "Fr", "Sa", "Su"],
    ["27", "28", "29", "30", "31", "1", "2"],
    ["3", "4", "5", "6", "7", "8", "9"],
    ["10", "11", "12", "13", "14", "15", "16"],
    ["17", "18", "19", "20", "21", "22", "23"],
    ["24", "25", "26", "27", "28", "29", "30"]
  ];
}

export default function EmployerPostJobPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState("");
  const [unitCount, setUnitCount] = useState("2 máy");
  const [machineType, setMachineType] = useState("Treo tường");
  const [selectedDay, setSelectedDay] = useState("31");
  const [selectedTime, setSelectedTime] = useState("10:00 - 12:00");
  const [addressMode, setAddressMode] = useState("saved");
  const [newAddress, setNewAddress] = useState("");
  const [voucher, setVoucher] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    platformApi.getUserHome().then((data) => {
      setCategories(data.categories);
      setSelectedCategoryCode((current) => current || data.categories[0]?.code || "");
    });
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.code === selectedCategoryCode),
    [categories, selectedCategoryCode]
  );

  const quantity = Number(unitCount.match(/\d+/)?.[0] ?? 1);
  const unitPrice = parseBudget(selectedCategory?.averageBudgetLabel);
  const subtotal = unitPrice * quantity;
  const serviceFee = Math.round(subtotal * 0.05);
  const tax = Math.round(subtotal * 0.0273);
  const total = subtotal + serviceFee + tax;
  const calendar = getCalendarDays();

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback("");

    if (!selectedCategory) {
      setFeedback("Vui lòng chọn loại dịch vụ.");
      return;
    }

    const address = addressMode === "saved" ? savedAddresses[0] : newAddress.trim();
    if (!address) {
      setFeedback("Vui lòng nhập địa chỉ dịch vụ.");
      return;
    }

    try {
      await platformApi.createUserJob({
        employerCode: DEMO_EMPLOYER_CODE,
        title: `${viText(selectedCategory.name)} (${unitCount})`,
        categoryCode: selectedCategory.code,
        location: address,
        salaryLabel: `${formatCurrency(total)} / lần`,
        budgetMin: subtotal,
        budgetMax: total,
        employmentType: "task",
        urgency: "medium",
        summary: `${viText(selectedCategory.name)} - ${machineType}, thời gian ${selectedTime}, ngày ${selectedDay}/10.`,
        requirements: [
          `Số lượng: ${unitCount}`,
          `Loại máy: ${machineType}`,
          `Thanh toán: ${paymentMethod}`
        ],
        startDate: new Date().toISOString()
      });

      setFeedback("Đã xác nhận đặt lịch. Đơn đang chờ hệ thống điều phối thợ.");
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

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
                  <select value={selectedCategoryCode} onChange={(event) => setSelectedCategoryCode(event.target.value)}>
                    {categories.map((category) => (
                      <option key={category.code} value={category.code}>
                        {viText(category.name)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Số lượng
                  <select value={unitCount} onChange={(event) => setUnitCount(event.target.value)}>
                    {serviceUnits.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Loại máy
                  <select value={machineType} onChange={(event) => setMachineType(event.target.value)}>
                    {machineTypes.map((item) => (
                      <option key={item} value={item}>{item}</option>
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
                    <button type="button">‹</button>
                    <strong>25 Tháng 10</strong>
                    <button type="button">›</button>
                  </div>
                  <div className="calendar-grid">
                    {calendar.flat().map((item, index) => (
                      <button
                        key={`${item}-${index}`}
                        type="button"
                        className={item === selectedDay ? "active" : ""}
                        disabled={index < 7}
                        onClick={() => setSelectedDay(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="time-slots">
                  <h4>Thời gian</h4>
                  <div>
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={slot === selectedTime ? "active" : ""}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="booking-step">
              <h3>Bước 3 - Địa điểm dịch vụ</h3>
              <div className="address-options">
                <span>Địa chỉ đã lưu</span>
                <label>
                  <input
                    type="radio"
                    checked={addressMode === "saved"}
                    onChange={() => setAddressMode("saved")}
                  />
                  {savedAddresses[0]}
                </label>
                <label>
                  <input
                    type="radio"
                    checked={addressMode === "new"}
                    onChange={() => setAddressMode("new")}
                  />
                  Thêm địa chỉ mới
                </label>
                {addressMode === "new" ? (
                  <input
                    value={newAddress}
                    onChange={(event) => setNewAddress(event.target.value)}
                    placeholder="Nhập địa chỉ mới"
                  />
                ) : null}
              </div>
            </section>
          </div>

          <aside className="booking-summary-card">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="summary-lines">
              <span>{viText(selectedCategory?.name)} (x{quantity})</span>
              <strong>{formatCurrency(subtotal)}</strong>
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
                  placeholder="Mã giảm giá (Voucher)"
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
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                Thẻ tín dụng/Ghi nợ
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                />
                Ví điện tử (Momo, ZaloPay)
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                Tiền mặt khi hoàn thành
              </label>
            </fieldset>

            <button className="button primary booking-submit" type="submit">
              Xác nhận & Thanh toán
            </button>
            {feedback ? <p className="booking-feedback">{feedback}</p> : null}
          </aside>
        </form>
      </section>

      <footer className="home-footer booking-footer">
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
    </div>
  );
}
