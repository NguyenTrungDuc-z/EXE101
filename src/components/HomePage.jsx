import React, { useState, useEffect } from 'react';
import { 
  Search, BadgeCheck, Brush, Zap, Wrench, Refrigerator, Snowflake,
  Star, ChevronRight, Clock, ShieldCheck, LayoutGrid
} from 'lucide-react';
import './HomePage.css';

// Hàm hỗ trợ render Icon cho Danh mục
const getCategoryIcon = (iconString) => {
  switch (iconString) {
    case 'cleaning_services': return <Brush size={28} />;
    case 'build': return <Wrench size={28} />;
    case 'plumbing': return <Zap size={28} />;
    case 'ac_unit': return <Snowflake size={28} />; // Dùng Snowflake thay cho Refrigerator
    default: return <LayoutGrid size={28} />;
  }
};

export default function HomePage() {
  // 1. STATE LƯU TRỮ DỮ LIỆU TỪ API
  const [categories, setCategories] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. GỌI API TỪ JSON-SERVER (Cổng 9999)
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:9999/categories').then(res => res.json()),
      fetch('http://localhost:9999/providers').then(res => res.json())
    ])
    .then(([catData, provData]) => {
      // Lấy 4 danh mục đầu tiên cho mục Dịch vụ phổ biến
      setCategories(catData.slice(0, 4)); 
      
      // Lấy 3 thợ có đánh giá cao nhất cho mục Thợ nổi bật
      const topProviders = provData
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
      setFeaturedProviders(topProviders);
      
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      setIsLoading(false);
    });
  }, []);

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

      {/* KHỐI 2: DỊCH VỤ PHỔ BIẾN (GỌI TỪ API) */}
      <section className="services-section">
        <h2 className="section-title">Dịch vụ phổ biến</h2>
        {isLoading ? (
          <p style={{textAlign: 'center', padding: '20px'}}>Đang tải dịch vụ...</p>
        ) : (
          <div className="services-grid">
            {categories.map((cat) => (
              <div className="service-card" key={cat.id}>
                <div className="service-icon">{getCategoryIcon(cat.icon)}</div>
                <h3>{cat.name}</h3>
                <p>{cat.description || "Dịch vụ chuyên nghiệp"}</p>
              </div>
            ))}
          </div>
        )}
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
      {/* KHỐI 4: THỢ NỔI BẬT (GỌI TỪ API) */}
      {/* ========================================= */}
      <section className="featured-providers-section">
        <div className="section-header-flex">
          <div>
            <h2 className="section-title">Thợ nổi bật trong khu vực</h2>
            <p className="section-subtitle">Những chuyên gia có đánh giá cao nhất tuần này.</p>
          </div>
          <a href="#xem-tat-ca" className="view-all-link">Xem tất cả <ChevronRight size={18} /></a>
        </div>

        {isLoading ? (
          <p style={{textAlign: 'center', padding: '20px'}}>Đang tải danh sách thợ...</p>
        ) : (
          <div className="providers-grid">
            {featuredProviders.map((provider) => (
              <div className="provider-card" key={provider.id}>
                
                {/* Ảnh bìa */}
                <div 
                  className="provider-cover" 
                  style={{ backgroundImage: `url(${provider.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  {provider.is_verified && <span className="badge">Được xác minh</span>}
                </div>
                
                {/* Thông tin thợ */}
                <div className="provider-info">
                  {/* Nếu JSON không có avatar, dùng API tạo avatar từ tên */}
                  <img 
                    src={provider.avatar_url || `https://ui-avatars.com/api/?name=${provider.name}&background=2563eb&color=fff`} 
                    alt={provider.name} 
                    className="provider-avatar" 
                  />
                  <h3>{provider.name}</h3>
                  <p className="specialty">{provider.title || "Chuyên gia dịch vụ"} • {provider.experience_years || 5} năm KN</p>
                  
                  {/* Render Sao tự động dựa theo rating */}
                  <div className="rating">
                    {[...Array(5)].map((_, index) => (
                      <Star 
                        key={index} 
                        size={16} 
                        fill={index < Math.round(provider.rating) ? "#fbbf24" : "none"} 
                        color={index < Math.round(provider.rating) ? "#fbbf24" : "#d1d5db"} 
                      />
                    ))}
                    <span className="rating-score">{provider.rating}</span>
                    <span className="rating-count">({provider.total_reviews})</span>
                  </div>
                  
                  <button className="view-profile-btn">Xem hồ sơ</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================= */}
      {/* KHỐI 5: TẠI SAO CHỌN */}
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
      {/* KHỐI 6: CTA SẴN SÀNG BẮT ĐẦU */}
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
      {/* KHỐI 7: THỐNG KÊ */}
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