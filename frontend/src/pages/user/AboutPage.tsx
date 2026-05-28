const coreValues = [
  { title: "Tin cậy", description: "Giá cố định minh bạch, quy trình rõ ràng và bảo vệ quyền lợi khách hàng." },
  { title: "Tận tâm", description: "Đội ngũ kỹ thuật viên được xác minh, phục vụ đúng giờ và theo sát phản hồi." },
  { title: "Minh bạch", description: "Báo giá, lịch hẹn, trạng thái dịch vụ và đánh giá đều được hiển thị rõ ràng." },
  { title: "Sáng tạo", description: "Liên tục cải tiến trải nghiệm đặt dịch vụ, theo dõi đơn và chăm sóc sau dịch vụ." }
];

const leaders = [
  { name: "Nguyễn Thưởng", role: "Founder", image: "https://i.pravatar.cc/320?u=leader-1" },
  { name: "Nguyễn Trường", role: "Co-founder", image: "https://i.pravatar.cc/320?u=leader-2" },
  { name: "Nguyễn Thông", role: "Operations", image: "https://i.pravatar.cc/320?u=leader-3" },
  { name: "Nguyễn Thọ Hạnh", role: "Customer Success", image: "https://i.pravatar.cc/320?u=leader-4" },
  { name: "Trần Minh Anh", role: "Product", image: "https://i.pravatar.cc/320?u=leader-5" },
  { name: "Lê Hoàng Nam", role: "Partnership", image: "https://i.pravatar.cc/320?u=leader-6" },
  { name: "Phạm Quốc Bảo", role: "Technology", image: "https://i.pravatar.cc/320?u=leader-7" },
  { name: "Đỗ Ngọc Mai", role: "Quality", image: "https://i.pravatar.cc/320?u=leader-8" }
];

const partners = ["HomeSwift", "VIETNANK", "Banet", "Bảo hiểm Hà"];

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-team-photo">
        <img
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1500&q=80"
          alt="Đội ngũ HomeSwift"
        />
      </div>

      <h1>Chúng tôi nâng tầm<br />cuộc sống gia đình Việt</h1>

      <section className="about-mission-panel">
        <h2>Sứ mệnh & Tầm nhìn</h2>
        <div>
          <article>
            <h3>Sứ mệnh</h3>
            <p>Cung cấp dịch vụ gia đình minh bạch, tiện lợi và an tâm thông qua nền tảng HomeSwift.</p>
          </article>
          <article>
            <h3>Tầm nhìn</h3>
            <p>Trở thành siêu ứng dụng dịch vụ tại nhà hàng đầu, kết nối khách hàng với đội ngũ phục vụ đáng tin cậy.</p>
          </article>
        </div>
      </section>

      <section className="about-core-values">
        <h2>Giá trị cốt lõi</h2>
        <div>
          {coreValues.map((item, index) => (
            <article key={item.title}>
              <span>{["✓", "❤", "⌕", "✦"][index]}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-leadership">
        <h2>Đội ngũ lãnh đạo</h2>
        <div>
          {leaders.map((leader) => (
            <article key={leader.name}>
              <img src={leader.image} alt={leader.name} />
              <strong>{leader.name}</strong>
              <span>{leader.role}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="about-numbers">
        <h2>Con số ấn tượng</h2>
        <div>
          <article><strong>10,000+</strong><span>Đối tác nghề nghiệp</span></article>
          <article><strong>50,000+</strong><span>Khách hàng từ lần lương</span></article>
          <article><strong>20+</strong><span>Tỉnh</span></article>
        </div>
      </section>

      <section className="about-partners">
        <h2>Đối tác</h2>
        <div>
          {partners.map((partner) => (
            <span key={partner}>{partner}</span>
          ))}
        </div>
      </section>
    </section>
  );
}
