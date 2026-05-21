import React, { useState, useEffect } from 'react';
import { Star, Clock, Phone, XCircle, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import './BookingStatus.css';

export default function BookingStatus({ booking, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(booking.estimatedArrival);

  // Logic đếm ngược thời gian giả lập
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 60000); // Mỗi phút giảm 1 đơn vị
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCancel = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn đặt này không?")) {
      onCancel(booking.id);
      toast.info("Đã hủy đơn đặt lịch");
    }
  };

  return (
    <div className="booking-status-card">
      <div className="card-header">
        <span className="status-badge">Đang đến</span>
        <div className="arrival-time">
          <Clock size={16} />
          <span>Dự kiến đến sau: <strong>{timeLeft} phút</strong></span>
        </div>
      </div>

      <div className="worker-info-section">
        <img src={booking.workerAvatar} alt="Worker" className="worker-img" />
        <div className="worker-details">
          <h3>{booking.workerName}</h3>
          <div className="worker-rating">
            <Star size={14} fill="#ffb800" color="#ffb800" />
            <span>{booking.rating} (120 đánh giá)</span>
          </div>
          <p className="worker-phone"><Phone size={14} /> {booking.phone}</p>
        </div>
      </div>

      <div className="booking-actions">
        <button className="btn-contact">Gọi điện</button>
        <button className="btn-cancel-booking" onClick={handleCancel}>
          <XCircle size={18} />
          Hủy thuê
        </button>
      </div>
      
      <div className="progress-bar-container">
        <div className="progress-fill" style={{ width: `${100 - (timeLeft/booking.estimatedArrival)*100}%` }}></div>
      </div>
    </div>
  );
}