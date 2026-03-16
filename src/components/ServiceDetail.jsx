import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, Clock, Calendar, Shield, CheckCircle2 
} from 'lucide-react';
import './ServiceDetail.css';

export default function ServiceDetail() {
  const { id } = useParams(); // Lấy ID dịch vụ từ URL
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Giả lập gọi API lấy dữ liệu chi tiết của 1 dịch vụ (từ localhost:9999)
  useEffect(() => {
    // Thay 'services' bằng endpoint đúng trong database.json của bro nếu cần
    fetch(`http://localhost:9999/services/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Không tìm thấy dịch vụ");
        return res.json();
      })
      .then(data => {
        setService(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        // DỮ LIỆU MẪU (Fallback) để bro xem UI trước khi có API chuẩn
        setService({
          id: id,
          title: "Sửa Chữa Nội Thất",
          categoryName: "Sửa chữa",
          image: "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?q=80&w=1000&auto=format&fit=crop",
          rating: 4.7,
          reviews: 143,
          description: "Sửa chữa đồ gỗ, cửa, tủ, bàn ghế. Sơn lại, đánh bóng, thay phụ kiện. Tay nghề cao, giá cả hợp lý.",
          hourlyRate: "60.000đ",
          dailyRate: "450.000đ",
          providersCount: 1
        });
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <div className="loading-state">Đang tải thông tin...</div>;
  if (!service) return <div className="error-state">Dịch vụ không tồn tại!</div>;

  return (
    <div className="service-detail-wrapper">
      {/* Nút Quay lại */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Quay lại</span>
      </button>

      <div className="detail-container">
        {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
        <div className="main-content">
          <img src={service.image} alt={service.title} className="service-cover-img" />
          
          <div className="service-header-info">
            <div className="title-and-rating">
              <h1 className="service-title">{service.title}</h1>
              <div className="service-rating">
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
                <span className="rating-score">{service.rating}</span>
                <span className="rating-count">({service.reviews})</span>
              </div>
            </div>
            <span className="category-badge">{service.categoryName}</span>
          </div>

          <p className="service-description">{service.description}</p>

          {/* Các box giá cả & số lượng thợ */}
          <div className="info-boxes">
            <div className="info-box">
              <div className="info-icon blue-bg"><Clock size={20} color="#3b82f6" /></div>
              <div className="info-text">
                <span className="info-label">Theo giờ</span>
                <span className="info-value">{service.hourlyRate}</span>
              </div>
            </div>
            <div className="info-box">
              <div className="info-icon green-bg"><Calendar size={20} color="#22c55e" /></div>
              <div className="info-text">
                <span className="info-label">Theo ngày</span>
                <span className="info-value">{service.dailyRate}</span>
              </div>
            </div>
            <div className="info-box">
              <div className="info-icon purple-bg"><Shield size={20} color="#a855f7" /></div>
              <div className="info-text">
                <span className="info-label">Thợ có sẵn</span>
                <span className="info-value">{service.providersCount} người</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG VỀ DỊCH VỤ & KHUYẾN MÃI */}
        <div className="sidebar">
          <div className="sidebar-card">
            <h3>Về Dịch Vụ Này</h3>
            <ul className="feature-list">
              <li>
                <CheckCircle2 size={18} color="#22c55e" className="check-icon"/>
                <div>
                  <strong>Đảm bảo chất lượng</strong>
                  <p>Hoàn tiền 100% nếu không hài lòng</p>
                </div>
              </li>
              <li>
                <CheckCircle2 size={18} color="#22c55e" className="check-icon"/>
                <div>
                  <strong>Thợ được xác minh</strong>
                  <p>Kiểm tra lý lịch và chứng chỉ</p>
                </div>
              </li>
              <li>
                <CheckCircle2 size={18} color="#22c55e" className="check-icon"/>
                <div>
                  <strong>Hỗ trợ 24/7</strong>
                  <p>Luôn sẵn sàng hỗ trợ khi bạn cần</p>
                </div>
              </li>
              <li>
                <CheckCircle2 size={18} color="#22c55e" className="check-icon"/>
                <div>
                  <strong>Thanh toán linh hoạt</strong>
                  <p>Tiền mặt, chuyển khoản, ví điện tử</p>
                </div>
              </li>
            </ul>

            <div className="promo-box">
              <div className="promo-header">
                <span className="dollar-sign">$</span>
                <strong>Khuyến mãi</strong>
              </div>
              <p>Giảm 20% cho lần đặt đầu tiên! Sử dụng mã: <strong>FIRST20</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}