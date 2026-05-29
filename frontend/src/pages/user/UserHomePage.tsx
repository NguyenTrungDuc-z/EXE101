import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  Wind,
  Wrench,
  BadgeDollarSign,
  BadgeCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Phone,
  Facebook,
  Instagram,
  Youtube,
  Smartphone,
  Star,
  Globe,
} from "lucide-react";
import { platformApi } from "../../api/platformApi";
import type { UserHome } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

const homeServices = [
  { label: "Vệ sinh", Icon: Sparkles, category: "Don dep nha" },
  { label: "Điều hòa", Icon: Wind, category: "Ve sinh may lanh" },
  { label: "Sửa chữa", Icon: Wrench, category: "Dien nuoc" },
];

export default function UserHomePage() {
  const [data, setData] = useState<UserHome | null>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    platformApi
      .getUserHome()
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const testimonials = data?.testimonials ?? [];
  const testimonialPages = testimonials.length
    ? testimonials
    : [
        {
          author: "HomeSwift",
          rating: 5,
          comment:
            "Thợ tận tâm, báo giá rõ ràng và hoàn thành đúng hẹn. Tôi rất yên tâm khi đặt dịch vụ tại HomeSwift.",
          image:
            "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=700&q=80",
          jobCode: "",
          serviceTitle: "Dịch vụ gia đình",
        },
      ];
  const activeTestimonial = testimonialPages[testimonialIndex % testimonialPages.length];
  const sideTestimonial = testimonialPages[(testimonialIndex + 1) % testimonialPages.length];

  useEffect(() => {
    if (testimonialPages.length <= 1) return;
    const timer = window.setInterval(() => {
      setTestimonialIndex((current) => (current + 1) % testimonialPages.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [testimonialPages.length]);

  const moveTestimonial = (direction: -1 | 1) => {
    setTestimonialIndex(
      (current) => (current + direction + testimonialPages.length) % testimonialPages.length
    );
  };

  const goToServices = (categoryName?: string) => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (categoryName || selectedCategory)
      params.set("categoryName", categoryName || selectedCategory);
    navigate(`/user/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="page-stack home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>Dịch vụ gia đình chuyên nghiệp chỉ trong vài click</h1>
        </div>
        <form
          className="hero-search-panel"
          onSubmit={(event) => {
            event.preventDefault();
            goToServices();
          }}
        >
          <select
            aria-label="Chọn dịch vụ"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="">[Chọn dịch vụ]</option>
            {data?.categories.map((category) => (
              <option key={category.code} value={category.name}>
                {viText(category.name)}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="[Địa chỉ của bạn]"
          />
          <button type="submit" className="button primary search-btn">
            <Search size={20} style={{ marginRight: "8px" }} />
            Tìm kiếm ngay
          </button>
        </form>
      </section>

      {error ? <p className="feedback error">{error}</p> : null}

      <section className="services-showcase">
        <div className="service-card-grid">
          {homeServices.map(({ label, Icon, category }) => (
            <article
              key={label}
              className="service-card interactive"
              onClick={() => goToServices(category)}
            >
              <div className="service-icon">
                <Icon size={32} />
              </div>
              <h3>{label}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="why-band">
        <div className="why-inner">
          <h2>Tại sao chọn chúng tôi</h2>
          <article className="why-card">
            <div className="why-icon">
              <BadgeDollarSign size={28} />
            </div>
            <div>
              <h3>Giá cố định minh bạch</h3>
              <p>Báo giá rõ ràng trước khi đặt lịch, không phát sinh bất ngờ.</p>
            </div>
          </article>
          <article className="why-card">
            <div className="why-icon">
              <BadgeCheck size={28} />
            </div>
            <div>
              <h3>Thợ đã xác minh</h3>
              <p>Đội ngũ được kiểm tra hồ sơ và kinh nghiệm trước khi nhận việc.</p>
            </div>
          </article>
          <article className="why-card">
            <div className="why-icon">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3>Bảo hiểm hư hại</h3>
              <p>Hỗ trợ xử lý khi có sự cố trong quá trình phục vụ tại nhà.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="testimonial-band">
        <h2>Khách hàng nói gì</h2>
        <div className="testimonial-carousel">
          <button
            className="carousel-arrow"
            type="button"
            aria-label="Trước"
            onClick={() => moveTestimonial(-1)}
          >
            <ChevronLeft size={24} />
          </button>
          <article
            className="testimonial-card testimonial-media"
            style={{ backgroundImage: `url(${sideTestimonial.image})` }}
            aria-hidden="true"
          />
          <article className="testimonial-card testimonial-quote">
            <div className="stars">
              {Array.from({ length: activeTestimonial.rating }).map((_, i) => (
                <Star key={i} size={16} fill="#f4c430" stroke="#f4c430" />
              ))}
            </div>
            <p>"{activeTestimonial.comment}"</p>
            <strong>{activeTestimonial.author}</strong>
          </article>
          <article
            className="testimonial-card testimonial-media"
            style={{ backgroundImage: `url(${activeTestimonial.image})` }}
            aria-hidden="true"
          />
          <button
            className="carousel-arrow"
            type="button"
            aria-label="Sau"
            onClick={() => moveTestimonial(1)}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="carousel-dots" aria-label="Chọn đánh giá">
          {testimonialPages.map((item, index) => (
            <button
              key={`${item.author}-${index}`}
              className={index === testimonialIndex ? "active" : ""}
              type="button"
              aria-label={`Xem đánh giá ${index + 1}`}
              onClick={() => setTestimonialIndex(index)}
            />
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <div>
          <h3>Liên hệ</h3>
          <p>
            <Phone size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
            0833 256 780
          </p>
          <p>
            <Globe size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
            homeswift.com
          </p>
        </div>
        <div>
          <h3>Mạng xã hội</h3>
          <div className="social-row">
            <a href="#" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="Youtube">
              <Youtube size={20} />
            </a>
          </div>
        </div>
        <div>
          <h3>Tải ứng dụng iOS</h3>
          <div className="store-badge">
            <Smartphone size={20} style={{ marginRight: "8px" }} />
            <span>App Store</span>
          </div>
        </div>
        <div>
          <h3>Tải ứng dụng Android</h3>
          <div className="store-badge">
            <Smartphone size={20} style={{ marginRight: "8px" }} />
            <span>Google Play</span>
          </div>
        </div>
      </footer>
    </div>
  );
}