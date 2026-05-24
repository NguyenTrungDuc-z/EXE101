import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Briefcase, CalendarDays, User, LogOut, Settings, ChevronDown 
} from 'lucide-react';
import { useAuth } from './AuthContext'; 
import { toast } from 'react-toastify';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    toast.info("Đã đăng xuất tài khoản");
    navigate('/');
  };

  return (
    <header className="header-container">
      
      {/* 1. Phần Logo */}
      <Link to="/" className="logo-section" style={{ textDecoration: 'none' }}>
        <div className="logo-icon-bg">
          <Briefcase color="white" size={24} />
        </div>
        <span className="logo-text">ViecNhanh</span>
      </Link>

      {/* 2. Phần Menu */}
      <nav className="nav-menu">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          <Home size={20} />
          <span>Trang chủ</span>
        </NavLink>
        
        <NavLink 
          to="/Service" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          <Briefcase size={20} />
          <span>Dịch vụ</span>
        </NavLink>
        
        <NavLink 
          to="/Bookings" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          <CalendarDays size={20} />
          <span>Đơn đặt</span>
        </NavLink>
      </nav>

      {/* 3. Phần Nút bấm / Profile */}
      <div className="action-buttons">
        {user ? (
          <div className="user-nav-wrapper">
            <div 
              className="user-profile-toggle" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {/* Cập nhật: Ưu tiên ảnh từ database, nếu không có dùng ảnh mặc định */}
              <img 
                src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                alt="User Avatar" 
                className="nav-avatar" 
              />
              <span className="nav-user-name">{user.name}</span>
              <ChevronDown size={16} className={showDropdown ? 'rotate-180' : ''} />
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="header-dropdown">
                <div className="dropdown-info">
                  <p className="user-role">
                    {/* Cập nhật khớp với Role trong database */}
                    {user.role === 'employer' ? '👨‍💼 Khách hàng' : '🛠️ Người làm'}
                  </p>
                </div>
                <hr />
                {/* Đổi đường dẫn thành /DetailUser để khớp với trang bạn mới tạo */}
                <Link to="/DetailUser" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <User size={18} /> Hồ sơ cá nhân
                </Link>
                <Link to="/Settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <Settings size={18} /> Cài đặt
                </Link>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/Login" className="btn-login">Đăng nhập</Link>
            <Link to="/Register" className="btn-register">Đăng ký</Link>
          </>
        )}
      </div>
    </header>
  );
}