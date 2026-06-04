import { Award, CheckCircle2, HeartHandshake, Lightbulb, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import LinhImg from "../../assets/team/ling.jpg";
import HungImg from "../../assets/team/hung.jpg";
import DuyenImg from "../../assets/team/duyen.jpg";
import ThuyImg from "../../assets/team/thuy.jpg";
import DucImg from "../../assets/team/duc.jpg";
import DuyAnh from "../../assets/team/danh.jpg";

const coreValues = [
  { icon: ShieldCheck, title: "Tin cậy", description: "Giá cố định minh bạch, quy trình rõ ràng và bảo vệ quyền lợi khách hàng." },
  { icon: HeartHandshake, title: "Tận tâm", description: "Đội ngũ kỹ thuật viên được xác minh, phục vụ đúng giờ và theo sát phản hồi." },
  { icon: CheckCircle2, title: "Minh bạch", description: "Báo giá, lịch hẹn, trạng thái dịch vụ và đánh giá đều được hiển thị rõ ràng." },
  { icon: Lightbulb, title: "Sáng tạo", description: "Liên tục cải tiến trải nghiệm đặt dịch vụ, theo dõi đơn và chăm sóc sau dịch vụ." }
];

const leaders = [
  { name: "Nguyễn Vũ Ngọc Linh", role: "Founder & Marketing Lead", image: LinhImg },
  { name: "Nguyễn Việt Hùng", role: "Co-founder & Growth Marketing", image: HungImg },
  { name: "Phạm Thị Duyên", role: "Content Marketing & Branding", image: DuyenImg },
  { name: "Đào Thanh Thùy", role: "Customer Success & Operations", image: ThuyImg },
  { name: "Nguyễn Trung Đức", role: "FullStack Developer", image: DucImg },
  { name: "Hoàng Duy Anh", role: "FullStack Developer", image: DuyAnh }
];

const numbers = [
  { value: "24/7", label: "kênh hỗ trợ khách hàng" },
  { value: "4 bước", label: "quy trình đặt dịch vụ rõ ràng" },
  { value: "100%", label: "đối tác cần được xác minh" }
];

const partners = ["ViecNhanh", "VIETNANK", "Banet", "Bảo hiểm Hà"];

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="about-hero-copy">
          <span className="eyebrow">Về ViecNhanh</span>
          <h1>Nâng tầm trải nghiệm dịch vụ gia đình Việt.</h1>
          <p>
            ViecNhanh kết nối khách hàng với đội ngũ dịch vụ đáng tin cậy, giúp mọi nhu cầu tại nhà
            được đặt lịch, theo dõi và hoàn tất minh bạch hơn.
          </p>
          <div className="about-hero-badges" aria-label="Điểm nổi bật">
            <span><Award size={18} /> Dịch vụ được chọn lọc</span>
            <span><Users size={18} /> Đội ngũ được xác minh</span>
          </div>
        </div>
        <div className="about-team-photo">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1500&q=80"
            alt="Đội ngũ ViecNhanh"
          />
        </div>
      </div>

      <section className="about-numbers" aria-label="Số liệu nổi bật">
        <div>
          {numbers.map((item) => (
            <article key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="about-mission-panel">
        <div className="about-section-head">
          <span className="eyebrow">Định hướng</span>
          <h2>Sứ mệnh & Tầm nhìn</h2>
        </div>
        <div>
          <article>
            <span className="about-panel-icon"><Target size={24} /></span>
            <h3>Sứ mệnh</h3>
            <p>Cung cấp dịch vụ gia đình minh bạch, tiện lợi và an tâm thông qua nền tảng ViecNhanh.</p>
          </article>
          <article>
            <span className="about-panel-icon"><Sparkles size={24} /></span>
            <h3>Tầm nhìn</h3>
            <p>Trở thành nền tảng dịch vụ tại nhà hàng đầu, kết nối khách hàng với đội ngũ phục vụ đáng tin cậy.</p>
          </article>
        </div>
      </section>

      <section className="about-core-values">
        <div className="about-section-head">
          <span className="eyebrow">Văn hóa vận hành</span>
          <h2>Giá trị cốt lõi</h2>
        </div>
        <div>
          {coreValues.map(({ icon: Icon, title, description }) => (
            <article key={title}>
              <span><Icon size={28} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-leadership">
        <div className="about-section-head">
          <span className="eyebrow">Con người</span>
          <h2>Đội ngũ phát triển</h2>
        </div>
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

     
    </section>
  );
}
