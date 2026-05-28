import { useState } from "react";

export default function PartnerPage() {
  const [sent, setSent] = useState(false);

  return (
    <section className="partner-page">
      <div className="partner-hero">
        <div>
          <span className="eyebrow">Trở thành đối tác</span>
          <h1>Nhận thêm lịch làm việc từ khách hàng HomeSwift.</h1>
          <p>
            Đăng ký hồ sơ kỹ thuật viên hoặc đội dịch vụ để nhận yêu cầu phù hợp theo khu vực,
            chuyên môn và thời gian rảnh của bạn.
          </p>
        </div>
        <article className="partner-benefit-card">
          <h2>Lợi ích đối tác</h2>
          <ul>
            <li>Nhận đơn theo khu vực phục vụ</li>
            <li>Hiển thị đánh giá và lịch sử hoàn thành</li>
            <li>Quản lý lịch làm việc rõ ràng</li>
            <li>Được hỗ trợ khi có tranh chấp đơn hàng</li>
          </ul>
        </article>
      </div>

      <form
        className="partner-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <h2>Thông tin đăng ký</h2>
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
        {sent ? <p className="booking-feedback partner-full">Đã ghi nhận hồ sơ. HomeSwift sẽ liên hệ để xác minh thông tin.</p> : null}
      </form>
    </section>
  );
}
