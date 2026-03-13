import React from 'react';

import { Search, BadgeCheck, Brush, Zap, Wrench, Refrigerator, Star, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="homepage-wrapper">
      
      
      {/* KHỐI 1: HERO SECTION */}
      <section className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">
            Dịch vụ Gia đình <br />
            <span className="highlight">Chuyên nghiệp</span> <br />
            trong Tầm tay
          </h1>
          <p className="hero-subtitle">
            Tìm kiếm thợ sửa chữa, vệ sinh và lắp đặt uy tín nhất cho ngôi nhà của bạn. Cam kết chất lượng và giá cả minh bạch.
          </p>
          <div className="search-box">
            <Search color="#9ca3af" size={20} />
            <input type="text" placeholder="Bạn cần dịch vụ gì hôm nay?" className="search-input" />
            <button className="search-btn">Tìm kiếm</button>
          </div>
          <div className="trust-section">
            <div className="avatars">
              <img src="https://i.pravatar.cc/100?img=11" alt="Thợ 1" />
              <img src="https://i.pravatar.cc/100?img=12" alt="Thợ 2" />
              <img src="https://i.pravatar.cc/100?img=13" alt="Thợ 3" />
            </div>
            <span className="trust-text"><strong>10,000+</strong> Thợ đã sẵn sàng</span>
          </div>
        </div>
        <div className="hero-right">
          <img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop" alt="Thợ chuyên nghiệp" className="main-image" />
          <div className="floating-badge">
            <div className="badge-icon"><BadgeCheck size={24} /></div>
            <div className="badge-info">
              <h4>99.8%</h4>
              <p>Khách hàng hài lòng</p>
            </div>
          </div>
        </div>
      </section>

      {/* KHỐI 2: DỊCH VỤ PHỔ BIẾN */}
      <section className="services-section">
        <h2 className="section-title">Dịch vụ phổ biến</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon"><Brush size={28} /></div>
            <h3>Dọn dẹp nhà</h3>
            <p>Định kỳ hoặc theo giờ</p>
          </div>
          <div className="service-card">
            <div className="service-icon"><Zap size={28} /></div>
            <h3>Điện nước</h3>
            <p>Xử lý sự cố nhanh 24/7</p>
          </div>
          <div className="service-card">
            <div className="service-icon"><Wrench size={28} /></div>
            <h3>Lắp đặt</h3>
            <p>Nội thất và thiết bị</p>
          </div>
          <div className="service-card">
            <div className="service-icon"><Refrigerator size={28} /></div>
            <h3>Điện máy</h3>
            <p>Máy giặt, tủ lạnh, TV</p>
          </div>
        </div>
      </section>

      {/* KHỐI 3: CÁCH THỨC HOẠT ĐỘNG */}
      <section className="how-it-works-section">
        <div className="hiw-header">
          <h2>Cách thức hoạt động</h2>
          <p>Chỉ với 3 bước đơn giản để ngôi nhà của bạn được chăm sóc bởi những bàn tay chuyên nghiệp nhất.</p>
        </div>
        <div className="steps-container">
          <div className="steps-line"></div>
          <div className="step-item">
            <div className="step-number">1</div>
            <h3>Chọn dịch vụ</h3>
            <p>Dễ dàng lựa chọn từ danh mục hàng trăm dịch vụ đa dạng.</p>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h3>Chọn thợ ưng ý</h3>
            <p>Xem hồ sơ, kinh nghiệm và đánh giá từ khách hàng thực tế.</p>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h3>Đặt lịch & Thư giãn</h3>
            <p>Xác nhận lịch hẹn và thanh toán an toàn qua ứng dụng.</p>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* KHỐI 4: THỢ NỔI BẬT (MỚI) */}
      {/* ========================================= */}
      <section className="featured-providers-section">
        <div className="section-header-flex">
          <div>
            <h2 className="section-title">Thợ nổi bật trong khu vực</h2>
            <p className="section-subtitle">Những chuyên gia có đánh giá cao nhất tuần này.</p>
          </div>
          <a href="#xem-tat-ca" className="view-all-link">Xem tất cả <ChevronRight size={18} /></a>
        </div>

        <div className="providers-grid">
          {/* Card Thợ 1 */}
          <div className="provider-card">
            <div className="provider-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop')" }}>
              <span className="badge">Ưu tú</span>
            </div>
            <div className="provider-info">
              <img src="https://i.pravatar.cc/150?img=11" alt="Nguyễn Văn Hùng" className="provider-avatar" />
              <h3>Nguyễn Văn Hùng</h3>
              <p className="specialty">Chuyên gia Điện nước • 8 năm KN</p>
              <div className="rating">
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span className="rating-score">5.0</span>
                <span className="rating-count">(124)</span>
              </div>
              <button className="view-profile-btn">Xem hồ sơ</button>
            </div>
          </div>

          {/* Card Thợ 2 */}
          <div className="provider-card">
            <div className="provider-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=400&auto=format&fit=crop')" }}>
              <span className="badge">Được xác minh</span>
            </div>
            <div className="provider-info">
              <img src="https://i.pravatar.cc/150?img=5" alt="Lê Thị Lan" className="provider-avatar" />
              <h3>Lê Thị Lan</h3>
              <p className="specialty">Chuyên gia Dọn dẹp • 5 năm KN</p>
              <div className="rating">
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} color="#fbbf24" /> {/* Sao rỗng */}
                <span className="rating-score">4.8</span>
                <span className="rating-count">(89)</span>
              </div>
              <button className="view-profile-btn">Xem hồ sơ</button>
            </div>
          </div>

          {/* Card Thợ 3 */}
          <div className="provider-card">
            <div className="provider-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format&fit=crop')" }}>
            </div>
            <div className="provider-info">
              <img src="https://i.pravatar.cc/150?img=12" alt="Trần Minh Tâm" className="provider-avatar" />
              <h3>Trần Minh Tâm</h3>
              <p className="specialty">Kỹ thuật viên Điện máy • 10 năm KN</p>
              <div className="rating">
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span className="rating-score">4.9</span>
                <span className="rating-count">(215)</span>
              </div>
              <button className="view-profile-btn">Xem hồ sơ</button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* KHỐI 5: TẠI SAO CHỌN (MỚI) */}
      {/* ========================================= */}
      <section className="why-choose-us-section">
        <div className="hiw-header">
          <h2>Tại Sao Chọn ViecNhanh?</h2>
          <p>Chúng tôi cam kết mang đến trải nghiệm tốt nhất</p>
        </div>
        <div className="reasons-grid">
          <div className="reason-item">
            <div className="reason-icon"><Clock size={24} /></div>
            <h3>Nhanh Chóng</h3>
            <p>Đặt lịch dễ dàng, thợ có mặt trong vòng 2 giờ</p>
          </div>
          <div className="reason-item">
            <div className="reason-icon"><ShieldCheck size={24} /></div>
            <h3>Uy Tín</h3>
            <p>Đội ngũ thợ được xác minh và đánh giá bởi khách hàng</p>
          </div>
          <div className="reason-item">
            <div className="reason-icon"><Star size={24} /></div>
            <h3>Chất Lượng</h3>
            <p>Cam kết chất lượng dịch vụ, hoàn tiền 100% nếu không hài lòng</p>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* KHỐI 6: CTA SẴN SÀNG BẮT ĐẦU (MỚI) */}
      {/* ========================================= */}
      <section className="cta-section">
        <h2>Sẵn Sàng Bắt Đầu?</h2>
        <p>Tìm thợ ngay hôm nay và trải nghiệm dịch vụ chuyên nghiệp</p>
        <button className="cta-btn">
          <Search size={18} />
          Tìm dịch vụ ngay
        </button>
      </section>

      {/* ========================================= */}
      {/* KHỐI 7: THỐNG KÊ (MỚI) */}
      {/* ========================================= */}
      <section className="stats-section">
        <div className="stat-item">
          <h2>1000+</h2>
          <p>Thợ chuyên nghiệp</p>
        </div>
        <div className="stat-item">
          <h2>50K+</h2>
          <p>Đơn hoàn thành</p>
        </div>
        <div className="stat-item">
          <h2>4.8</h2>
          <p>Đánh giá trung bình</p>
        </div>
        <div className="stat-item">
          <h2>24/7</h2>
          <p>Hỗ trợ khách hàng</p>
        </div>
      </section>

    </div>
  );
}