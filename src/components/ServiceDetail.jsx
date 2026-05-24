import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { 
  ArrowLeft, Star, Clock, Calendar, Shield, CheckCircle2, X, Zap, Loader2 
} from 'lucide-react';
import './ServiceDetail.css';

const formatCurrency = (amount) => {
  if (!amount) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [categoryName, setCategoryName] = useState("Đang tải..."); 
  const [isLoading, setIsLoading] = useState(true);

  // === STATE CHO MODAL ĐẶT LỊCH ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    type: 'hourly', 
    date: '',
    time: '',
    duration: 2, 
    level: 'standard' 
  });

  const getCurrentUser = () => {
    if (user) return user;
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:9999/services/${id}`).then(res => {
        if (!res.ok) throw new Error("Không tìm thấy dịch vụ");
        return res.json();
      }),
      fetch(`http://localhost:9999/categories`).then(res => res.json())
    ])
    .then(([serviceData, categoriesData]) => {
      setService(serviceData);
      const matchedCategory = categoriesData.find(c => String(c.id) === String(serviceData.category_id));
      setCategoryName(matchedCategory ? matchedCategory.name : "Dịch vụ khác");
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
      toast.error("Lỗi tải dữ liệu dịch vụ!");
    });
  }, [id]);

  const calculateTotal = () => {
    if (!service) return 0;
    const multiplier = bookingData.level === 'intensive' ? 1.5 : 1;
    if (bookingData.type === 'hourly') {
      return (service.basePriceHour || 0) * bookingData.duration * multiplier;
    } else {
      return (service.basePriceDay || 0) * multiplier;
    }
  };

  const checkAuth = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      Swal.fire({
        title: 'Bạn chưa đăng nhập',
        text: 'Vui lòng đăng nhập để tiến hành đặt lịch dịch vụ!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập ngay',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#2563eb'
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.setItem('redirectAfterLogin', location.pathname);
          navigate('/Login');
        }
      });
      return false;
    }
    return true;
  };

  const handleOpenBooking = () => {
    if (checkAuth()) {
      setIsModalOpen(true);
    }
  };

  // === LOGIC QUAN TRỌNG: LƯU ĐƠN VÀ CHUYỂN TRANG ===
  const handleConfirmBooking = () => {
    if (!checkAuth()) return;

    if(!bookingData.date || !bookingData.time) {
      toast.warning("Vui lòng chọn đầy đủ ngày và giờ thực hiện!");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const scheduleTime = new Date(`${bookingData.date}T${bookingData.time}:00`);

    const newOrder = {
      id: `BK_${Date.now()}`,
      user_id: currentUser.id,
      service_id: service.id,
      provider_id: null,
      booking_type: bookingData.type,
      duration: bookingData.type === 'hourly' ? bookingData.duration : 1,
      schedule_time: scheduleTime.toISOString(),
      address: {
        street: 'Chua cap nhat',
        district: 'Chua cap nhat',
        city: 'Chua cap nhat'
      },
      total_price: calculateTotal(),
      payment_method: 'COD',
      status: 'finding_provider',
      arrival_status: 'none',
      estimated_arrival: 0,
      can_cancel: true,
      has_reviewed: false,
      notes: ''
    };

    setIsModalOpen(false);

    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          fetch('http://localhost:9999/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
          })
            .then((res) => {
              if (!res.ok) throw new Error('Failed to create booking');
              return res.json();
            })
            .then(resolve)
            .catch(reject);
        }, 2500);
      }),
      {
        pending: '🔍 Hệ thống đang tìm thợ gần bạn nhất...',
        success: '✅ Đã lưu đơn hàng! Đang chuyển đến danh sách đơn của bạn...',
        error: '❌ Có lỗi xảy ra, vui lòng thử lại!'
      }
    ).then(() => {
      setTimeout(() => navigate('/bookings'), 1000);
    });
  };

  if (isLoading) return <div className="loading-state"><Loader2 className="animate-spin" /> Đang tải thông tin dịch vụ...</div>;
  if (!service) return <div className="error-state">Dịch vụ không tồn tại!</div>;

  return (
    <div className="service-detail-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Quay lại</span>
      </button>

      <div className="detail-container">
        {/* CỘT TRÁI */}
        <div className="main-content">
          <div className="img-container">
             <img src={service.cover_image} alt={service.title} className="service-cover-img" />
             <div className="verified-badge"><Shield size={14} /> Dịch vụ đảm bảo</div>
          </div>
          
          <div className="service-header-info">
            <h1 className="service-title">
              {service.title} <CheckCircle2 size={24} color="#10b981" />
            </h1>
            <div className="fast-booking-tag">
              <Zap size={16} /> Phản hồi trong 5 phút
            </div>

            <div className="service-rating">
              <Star size={20} fill="#fbbf24" color="#fbbf24" />
              <span className="rating-score">{service.rating}</span>
              <span className="rating-count">({service.total_reviews} đánh giá)</span>
            </div>
            <span className="category-badge">{categoryName}</span>
          </div>

          <div className="service-description-box">
            <h3>Chi tiết dịch vụ</h3>
            <p className="service-description">{service.description}</p>
          </div>

          <div className="info-boxes">
            <div className="info-box">
              <div className="info-icon blue-bg"><Clock size={20} color="#3b82f6" /></div>
              <div className="info-text">
                <span className="info-label">Cơ bản theo giờ</span>
                <span className="info-value">{formatCurrency(service.basePriceHour)}</span>
              </div>
            </div>
            <div className="info-box">
              <div className="info-icon green-bg"><Calendar size={20} color="#22c55e" /></div>
              <div className="info-text">
                <span className="info-label">Gói theo ngày</span>
                <span className="info-value">{formatCurrency(service.basePriceDay)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="sidebar">
          <div className="booking-action-card">
            <h3>Đặt dịch vụ này</h3>
            <p>Giá chỉ từ <strong>{formatCurrency(service.basePriceHour)}</strong></p>
            <button className="btn-book-now" onClick={handleOpenBooking}>
              Tiếp tục đặt lịch
            </button>
            <p className="note">Nhấn để chọn thời gian & thợ</p>
          </div>

          <div className="sidebar-card">
            <h3>Tại sao chọn chúng tôi?</h3>
            <ul className="feature-list">
              <li><CheckCircle2 size={18} color="#22c55e" /> 100% thợ có chứng chỉ</li>
              <li><CheckCircle2 size={18} color="#22c55e" /> Bảo hiểm dịch vụ</li>
              <li><CheckCircle2 size={18} color="#22c55e" /> Hỗ trợ 24/7</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL ĐẶT LỊCH */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <div className="modal-header">
              <h2>Thông tin đặt lịch</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-type-tabs">
                <button 
                  className={`type-tab-btn ${bookingData.type === 'hourly' ? 'active' : ''}`}
                  onClick={() => setBookingData({...bookingData, type: 'hourly'})}
                >Theo giờ</button>
                <button 
                  className={`type-tab-btn ${bookingData.type === 'daily' ? 'active' : ''}`}
                  onClick={() => setBookingData({...bookingData, type: 'daily'})}
                >Theo ngày</button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Chọn ngày</label>
                  <input 
                    type="date" 
                    value={bookingData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Giờ bắt đầu</label>
                  <input 
                    type="time" 
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                  />
                </div>
              </div>

              {bookingData.type === 'hourly' && (
                <div className="form-group">
                  <label>Thời lượng: {bookingData.duration} giờ</label>
                  <input 
                    type="range" min="2" max="8" step="1"
                    value={bookingData.duration}
                    onChange={(e) => setBookingData({...bookingData, duration: Number(e.target.value)})}
                  />
                </div>
              )}

              <div className="price-summary">
                <div className="price-row">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="price-row total">
                  <span>Tổng cộng:</span>
                  <span className="total-amount">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Quay lại</button>
              <button className="btn-confirm" onClick={handleConfirmBooking}>Xác nhận & Tìm thợ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


