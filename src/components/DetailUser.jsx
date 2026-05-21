import React, { useState, useEffect } from 'react';
import { Camera, User, Phone, MapPin, Mail, Save, Edit2, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import './DetailUser.css';

export default function DetailUser() {
  const currentUserId = "a391"; // ID của Duy Anh trong db.json
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    age: '',
    avatar: 'https://i.pravatar.cc/150?u=a391'
  });

  // 1. Lấy dữ liệu người dùng từ server
  useEffect(() => {
    fetch(`http://localhost:9999/users/${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        setUserData(data);
        setLoading(false);
      })
      .catch(() => toast.error("Không thể tải thông tin người dùng"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:9999/users/${currentUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật dữ liệu");
    }
  };

  if (loading) return <div className="loader">Đang tải...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Header Profile */}
        <div className="profile-header">
          <div className="avatar-wrapper">
            <img src={userData.avatar || "https://via.placeholder.com/150"} alt="Avatar" />
            {isEditing && (
              <label className="change-avatar-btn">
                <Camera size={18} />
                <input type="file" hidden />
              </label>
            )}
          </div>
          <div className="profile-title">
            <h2>{userData.name}</h2>
            <p>{userData.role === 'employer' ? 'Khách hàng' : 'Người làm'}</p>
          </div>
          <button 
            className={`edit-toggle-btn ${isEditing ? 'active' : ''}`}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? <><Save size={18} /> Lưu thay đổi</> : <><Edit2 size={18} /> Chỉnh sửa</>}
          </button>
        </div>

        <div className="profile-content">
          <div className="info-grid">
            {/* Tên */}
            <div className="info-group">
              <label><User size={16} /> Họ và tên</label>
              <input 
                type="text" 
                name="name"
                value={userData.name} 
                onChange={handleChange}
                disabled={!isEditing} 
              />
            </div>

            {/* Số điện thoại */}
            <div className="info-group">
              <label><Phone size={16} /> Số điện thoại</label>
              <input 
                type="text" 
                name="phone"
                value={userData.phone} 
                onChange={handleChange}
                disabled={!isEditing} 
              />
            </div>

            {/* Email (thường khóa không cho sửa hoặc sửa cẩn thận) */}
            <div className="info-group">
              <label><Mail size={16} /> Email</label>
              <input 
                type="email" 
                value={userData.email} 
                disabled 
                className="disabled-input"
              />
            </div>

            {/* Tuổi */}
            <div className="info-group">
              <label><Calendar size={16} /> Tuổi</label>
              <input 
                type="number" 
                name="age"
                value={userData.age || ''} 
                onChange={handleChange}
                disabled={!isEditing} 
                placeholder="Chưa cập nhật"
              />
            </div>
          </div>

          {/* Địa chỉ - Full Width */}
          <div className="info-group full-width">
            <label><MapPin size={16} /> Địa chỉ chi tiết</label>
            <textarea 
              name="address"
              value={userData.address || ''} 
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Nhập địa chỉ của bạn..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}