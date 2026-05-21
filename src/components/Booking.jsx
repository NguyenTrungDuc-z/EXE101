import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, User, Calendar, MapPin, 
  Phone, Trash2, Star, AlertCircle, XCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAuth } from './AuthContext';
import './Booking.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);

  const { user } = useAuth();
  const currentUserId = user?.id;

  // 1. Lấy dữ liệu từ db.json (thay vì LocalStorage để đồng bộ hệ thống)
  useEffect(() => {
    if (!currentUserId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    fetch('http://localhost:9999/bookings?user_id=' + currentUserId)
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        toast.error("Không thể tải danh sách đơn hàng");
      });
  }, [currentUserId]);

  const autoDispatchIfDue = async (currentBookings) => {
    if (!currentBookings || currentBookings.length === 0) return;

    const now = Date.now();
    const dueBookings = currentBookings.filter(b =>
      b.status === 'finding_provider' && new Date(b.schedule_time).getTime() <= now
    );

    if (dueBookings.length === 0) return;

    setIsDispatching(true);

    try {
      const [providers, services] = await Promise.all([
        fetch('http://localhost:9999/providers').then(res => res.json()),
        fetch('http://localhost:9999/services').then(res => res.json())
      ]);

      const serviceMap = new Map(services.map(s => [String(s.id), s]));
      const busyProviderIds = new Set(
        currentBookings
          .filter(b => b.status === 'accepted' && b.provider_id)
          .map(b => String(b.provider_id))
      );
      const availableProviders = providers.filter(
        p => p.status === 'available' && !busyProviderIds.has(String(p.id))
      );
      const assignedProviderIds = new Set(busyProviderIds);
      const assignmentMap = new Map();

      await Promise.all(dueBookings.map(async (booking) => {
        const service = serviceMap.get(String(booking.service_id));
        const categoryId = service ? String(service.category_id) : null;

        const assignedProvider = categoryId
          ? availableProviders.find(p =>
              !assignedProviderIds.has(String(p.id)) &&
              Array.isArray(p.supported_categories) &&
              p.supported_categories.map(String).includes(categoryId)
            )
          : null;
        if (!assignedProvider) return;
        assignedProviderIds.add(String(assignedProvider.id));

        const patchPayload = {
          status: 'accepted',
          provider_id: assignedProvider.id,
          arrival_status: 'moving',
          estimated_arrival: 15
        };

        await fetch(`http://localhost:9999/bookings/${booking.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchPayload)
        });

        if (assignedProvider) {
          await fetch(`http://localhost:9999/providers/${assignedProvider.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'busy' })
          });
        }

        assignmentMap.set(String(booking.id), String(assignedProvider.id));
      }));

      setBookings(prev =>
        prev.map(b => {
          if (b.status !== 'finding_provider') return b;
          if (new Date(b.schedule_time).getTime() > now) return b;

          const service = serviceMap.get(String(b.service_id));
          const categoryId = service ? String(service.category_id) : null;
          const assignedProvider = assignmentMap.get(String(b.id)) || b.provider_id;
          if (!assignedProvider) return b;

          return {
            ...b,
            status: 'accepted',
            provider_id: assignedProvider,
            arrival_status: 'moving',
            estimated_arrival: 15
          };
        })
      );
    } catch (err) {
      console.error(err);
      toast.error("Khong the dieu phoi tho tu dong");
    } finally {
      setIsDispatching(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    autoDispatchIfDue(bookings);
    const intervalId = setInterval(() => autoDispatchIfDue(bookings), 30000);
    return () => clearInterval(intervalId);
  }, [currentUserId, bookings]);

  // Logic Hủy Đơn (Có kiểm tra điều kiện)
  const handleCancel = (booking) => {
    if (booking.status !== 'finding_provider' && booking.estimated_arrival < 5) {
      return Swal.fire('Không thể hủy', 'Thợ chỉ còn cách bạn dưới 5 phút, vui lòng không hủy lúc này.', 'error');
    }

    Swal.fire({
      title: 'Xác nhận hủy thuê?',
      text: "Việc hủy đơn quá nhiều có thể ảnh hưởng đến điểm uy tín của bạn.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Xác nhận hủy',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        // Cập nhật lên server
        fetch(`http://localhost:9999/bookings/${booking.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled', arrival_status: 'none' })
        }).then(() => {
          setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
          toast.success("Đã hủy đơn thành công");
        });
      }
    });
  };

  const renderStatusBadge = (status, arrivalStatus, timeLeft) => {
    if (status === 'accepted' && arrivalStatus === 'moving') {
      return (
        <div className="status-container">
          <span className="status-badge moving">
            <Clock size={14} className="animate-spin-slow" /> Thợ đang đến
          </span>
          <span className="arrival-estimate">Dự kiến: {timeLeft} phút</span>
        </div>
      );
    }
    switch (status) {
      case 'accepted': return <span className="status-badge confirmed"><CheckCircle2 size={14} /> Đã xác nhận</span>;
      case 'completed': return <span className="status-badge completed"><CheckCircle2 size={14} /> Hoàn thành</span>;
      case 'finding_provider': return <span className="status-badge pending"><Clock size={14} /> Đang tìm thợ...</span>;
      case 'cancelled': return <span className="status-badge cancelled"><XCircle size={14} /> Đã hủy</span>;
      default: return null;
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return b.status !== 'cancelled'; // Ẩn đơn hủy ở tab Tất cả
    return b.status === activeTab;
  });
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const timeA = new Date(a.schedule_time).getTime();
    const timeB = new Date(b.schedule_time).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return String(b.id).localeCompare(String(a.id));
  });

  return (
    <div className="bookings-page-wrapper">
      <div className="bookings-header">
        <h1>Đơn Đặt Của Tôi</h1>
        <p>Theo dõi thợ và quản lý lịch trình dịch vụ</p>
      </div>

      <div className="bookings-tabs-container">
        <div className="bookings-tabs">
          {['all', 'finding_provider', 'accepted', 'completed'].map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`} 
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? 'Tất cả' : tab === 'finding_provider' ? 'Đang tìm' : tab === 'accepted' ? 'Đang thực hiện' : 'Lịch sử'}
            </button>
          ))}
        </div>
      </div>

      <div className="bookings-list">
        {loading ? <p>Đang tải...</p> : sortedBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="empty-icon">📂</div>
            <p>Không có đơn đặt nào.</p>
          </div>
        ) : (
          sortedBookings.map((booking) => (
            <div className={`booking-card ${booking.arrival_status === 'moving' ? 'highlight' : ''}`} key={booking.id}>
              <div className="booking-info">
                <div className="booking-top">
                  <h3 className="booking-service-name">Mã đơn: #{booking.id.split('_').pop()}</h3>
                  {renderStatusBadge(booking.status, booking.arrival_status, booking.estimated_arrival)}
                </div>

                <div className="worker-brief-card">
                  <img src={booking.provider_id ? "https://i.pravatar.cc/150?u="+booking.provider_id : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="avatar" />
                  <div className="worker-text">
                    <strong>{booking.provider_id ? "Thợ: Nguyễn Văn Tuấn" : "Đang chờ điều phối..."}</strong>
                    {booking.provider_id && <div className="worker-rating"><Star size={12} fill="gold" color="gold"/> 4.9 (150 đánh giá)</div>}
                  </div>
                </div>

                <div className="booking-details-grid">
                  <div className="detail-item"><Calendar size={15} /> <span>{new Date(booking.schedule_time).toLocaleDateString('vi-VN')}</span></div>
                  <div className="detail-item"><MapPin size={15} /> <span>{booking.address.district}</span></div>
                  <div className="detail-item price-item"><strong className="price-text">{formatCurrency(booking.total_price)}</strong></div>
                </div>
              </div>

              <div className="booking-actions">
                {booking.status === 'accepted' && (
                  <>
                    <button className="btn-contact"><Phone size={16} /> Gọi thợ</button>
                    {booking.can_cancel && <button className="btn-cancel" onClick={() => handleCancel(booking)}>Hủy thuê</button>}
                  </>
                )}
                {booking.status === 'completed' && <button className="btn-primary">Đánh giá ngay</button>}
                {booking.status === 'finding_provider' && <button className="btn-cancel" onClick={() => handleCancel(booking)}>Hủy tìm kiếm</button>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}




