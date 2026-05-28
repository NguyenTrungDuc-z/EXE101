const faqs = [
  {
    question: "Dịch vụ của bạn có bảo hiểm không?",
    answer: "Có, tất cả dịch vụ của chúng tôi đều được bảo hiểm trách nhiệm toàn diện để bạn yên tâm."
  },
  {
    question: "Tôi có thể đổi lịch hoặc hủy đặt lịch không?",
    answer: "Bạn có thể đổi lịch hoặc hủy miễn phí tối đa 24 giờ trước giờ hẹn. Vui lòng quản lý trong phần Đặt lịch của bạn."
  },
  {
    question: "Bạn cung cấp những dụng cụ vệ sinh nào?",
    answer: "Kỹ thuật viên mang theo dụng cụ cơ bản và vật tư phù hợp với từng loại dịch vụ."
  },
  {
    question: "Tôi thanh toán dịch vụ như thế nào?",
    answer: "HomeSwift hỗ trợ thanh toán bằng ví điện tử, chuyển khoản hoặc tiền mặt sau khi hoàn tất dịch vụ."
  },
  {
    question: "Tôi phải làm gì nếu không hài lòng với công việc?",
    answer: "Gửi khiếu nại kèm hình ảnh để đội hỗ trợ kiểm tra và xử lý lại theo chính sách chất lượng."
  }
];

export default function HelpPage() {
  return (
    <section className="help-page">
      <div className="help-shell">
        <h1>Trung tâm trợ giúp & Khiếu nại</h1>

        <section className="help-faq">
          <h2>Câu hỏi thường gặp (FAQ)</h2>
          <div className="help-accordion">
            {faqs.map((item, index) => (
              <details key={item.question} open={index < 2}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="complaint-panel">
          <h2>Gửi khiếu nại / Báo cáo sự cố</h2>
          <form className="complaint-form">
            <label>
              Chọn đơn hàng
              <select defaultValue="">
                <option value="" disabled>Chọn một đơn hàng cũ...</option>
                <option>HS-10234 - Vệ sinh máy lạnh</option>
                <option>HS-10235 - Sửa điện lạnh</option>
                <option>HS-10192 - Dọn dẹp nhà cửa</option>
              </select>
            </label>

            <label className="complaint-upload">
              Đính kèm ảnh
              <span>
                <b>↥</b>
                Kéo và thả tệp vào đây
                <button type="button">Tải ảnh lên (Tùy chọn)</button>
              </span>
            </label>

            <label>
              Chi tiết vấn đề
              <textarea placeholder="Vui lòng mô tả vấn đề bạn gặp phải..." />
            </label>

            <button className="button primary complaint-submit" type="button">[Gửi khiếu nại]</button>
          </form>
        </section>
      </div>

      <button className="help-chat-button" type="button" aria-label="Mở chat hỗ trợ">
        ◕
      </button>
    </section>
  );
}
