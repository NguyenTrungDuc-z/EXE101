import React from 'react';
import './Header.css'; // Quan trọng: Import file CSS ở đây!
import { Home, Briefcase, CalendarDays } from 'lucide-react'; // Vẫn cần icon nhé
import { NavLink, Link } from 'react-router-dom';

export default function Header() {
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
    to="/don-dat" 
    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
  >
    <CalendarDays size={20} />
    <span>Đơn đặt</span>
  </NavLink>

</nav>



{/* 3. Phần Nút bấm */}
      <div className="action-buttons">
        {/* Đổi button thành Link và thêm thuộc tính to="..." */}
        <Link to="/Login" className="btn-login">Đăng nhập</Link>
        <Link to="/Register" className="btn-register">Đăng ký</Link>
      </div>

    </header>
  );
}