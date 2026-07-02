import { Award, CalendarCheck, CheckCircle2, Headphones, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useState } from "react";

const benefits = [
  "Nhận đơn theo khu vực phục vụ",
  "Hiển thị đánh giá và lịch sử hoàn thành",
  "Quản lý lịch làm việc rõ ràng",
  "Được hỗ trợ khi có tranh chấp đơn hàng",
];

const stats = [
  { value: "24h", label: "phản hồi hồ sơ" },
  { value: "4 bước", label: "xác minh minh bạch" },
  { value: "100%", label: "chọn khu vực phù hợp" },
];

const steps = [
  { icon: Users, title: "Gửi hồ sơ", description: "Cung cấp thông tin đội nhóm, khu vực và nhóm dịch vụ chính." },
  { icon: ShieldCheck, title: "Xác minh", description: "ViecNhanh kiểm tra năng lực, kinh nghiệm và thông tin liên hệ." },
  { icon: CalendarCheck, title: "Nhận lịch", description: "Bắt đầu nhận yêu cầu phù hợp với thời gian rảnh của bạn." },
];

export default function PartnerPage() {
  const [sent, setSent] = useState(false);

  return (
    <section className="partner-page">
      <div className="partner-hero">
        <div className="partner-hero-copy">
          <span className="eyebrow">Trở thành cộng tác viên</span>
          <h1>Mở rộng lịch làm việc cùng khách hàng ViecNhanh.</h1>
          <p>
            Đăng ký hồ sơ kỹ thuật viên hoặc đội dịch vụ để nhận yêu cầu phù hợp theo khu vực,
            chuyên môn và thời gian rảnh của bạn.
          </p>
          <div className="partner-hero-actions" aria-label="Điểm nổi bật">
            <span><MapPin size={18} /> Chọn khu vực linh hoạt</span>
            <span><Award size={18} /> Ghi nhận chất lượng dịch vụ</span>
          </div>
        </div>

        <article className="partner-benefit-card">
          <div className="partner-card-icon"><Sparkles size={26} /></div>
          <h2>Lợi ích đối tác</h2>
          <ul>
            {benefits.map((benefit) => (
              <li key={benefit}>
                <CheckCircle2 size={18} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="partner-stats" aria-label="Tổng quan chương trình đối tác">
        {stats.map((stat) => (
          <article key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>

      <div className="partner-content-grid">
        <div className="partner-process">
          <span className="eyebrow">Quy trình hợp tác</span>
          <h2>Từ đăng ký đến nhận đơn được thiết kế rõ ràng.</h2>
          <div className="partner-step-list">
            {steps.map(({ icon: Icon, title, description }) => (
              <article key={title}>
                <span><Icon size={22} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="partner-support-note">
            <Headphones size={20} />
            <p>Đội ngũ ViecNhanh hỗ trợ đối tác trong quá trình xác minh và vận hành đơn.</p>
          </div>
        </div>

        <form
          className="partner-form"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <div className="partner-form-head">
            <span className="eyebrow">Hồ sơ đăng ký</span>
            <h2>Thông tin đối tác</h2>
            <p>Điền thông tin cơ bản để ViecNhanh liên hệ xác minh hồ sơ.</p>
          </div>
          <label>
            Họ và tên / Tên đội dịch vụ
            <input placeholder="Nguyễn Văn A" />
          </label>
          <label>
            Số điện thoại
            <input placeholder="0901 234 567" />
          </label>
          <label>
            Khu vực phục vụ
            <input placeholder="Quận 1, Quận 3, Bình Thạnh..." />
          </label>
          <label>
            Nhóm dịch vụ chính
            <select defaultValue="Vệ sinh máy lạnh">
              <option>Vệ sinh máy lạnh</option>
              <option>Sửa điện lạnh</option>
              <option>Dọn dẹp nhà cửa</option>
              <option>Điện nước</option>
              <option>Giặt ủi</option>
            </select>
          </label>
          <label className="partner-full">
            Kinh nghiệm và ghi chú
            <textarea placeholder="Mô tả kinh nghiệm, chứng chỉ hoặc lịch làm việc mong muốn..." />
          </label>
          <button className="button primary partner-full" type="submit">Gửi hồ sơ đối tác</button>
          {sent ? (
            <p className="booking-feedback partner-full">
              Đã ghi nhận hồ sơ. ViecNhanh sẽ liên hệ để xác minh thông tin.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
