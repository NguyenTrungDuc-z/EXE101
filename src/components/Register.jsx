import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search, Briefcase, User, Mail, Phone, Lock, ShieldCheck } from 'lucide-react';
import './Register.css';

export default function Register() {
  // State lưu trữ vai trò được chọn: 'employer' (Tìm người giúp) hoặc 'worker' (Tìm việc làm)
  const [role, setRole] = useState('employer');

  return (
    <div className="register-page">
      <div className="register-card">
        
        {/* CỘT TRÁI - TEXT & BENEFITS */}
        <div className="register-left">
          <h1>Bắt đầu hành trình sự nghiệp của bạn</h1>
          <p className="register-left-desc">
            Gia nhập cộng đồng tìm việc nhanh chóng và hiệu quả nhất Việt Nam. 
            Hàng ngàn cơ hội đang chờ đón bạn.
          </p>

          <div className="benefits-list">
            <div className="benefit-item">
              <CheckCircle2 className="benefit-icon" size={24} />
              Tạo hồ sơ chuyên nghiệp miễn phí
            </div>
            <div className="benefit-item">
              <CheckCircle2 className="benefit-icon" size={24} />
              Nhận thông báo việc làm phù hợp
            </div>
            <div className="benefit-item">
              <CheckCircle2 className="benefit-icon" size={24} />
              Ứng tuyển nhanh chóng chỉ với 1 click
            </div>
          </div>
        </div>

        {/* CỘT PHẢI - FORM */}
        <div className="register-right">
          <h2>Đăng ký tài khoản</h2>
          <p className="register-subtitle">
            Bạn đã có tài khoản? <Link to="/dang-nhap" className="register-link">Đăng nhập ngay</Link>
          </p>

          <form>
            {/* Box chọn vai trò */}
            <label className="role-label">Bạn tham gia với vai trò nào?</label>
            <div className="role-selector">
              <div 
                className={`role-card ${role === 'employer' ? 'active' : ''}`}
                onClick={() => setRole('employer')}
              >
                <div className="role-radio"></div>
                <Search className="role-icon" size={28} />
                <span>Tìm người giúp</span>
              </div>

              <div 
                className={`role-card ${role === 'worker' ? 'active' : ''}`}
                onClick={() => setRole('worker')}
              >
                <div className="role-radio"></div>
                <Briefcase className="role-icon" size={28} />
                <span>Tìm việc làm</span>
              </div>
            </div>

            {/* Các ô input nhập liệu */}
            <div className="input-group">
              <label>Họ và tên</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input type="text" placeholder="Nhập họ và tên của bạn" />
              </div>
            </div>

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" placeholder="example@gmail.com" />
              </div>
            </div>

            <div className="input-group">
              <label>Số điện thoại</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={18} />
                <input type="tel" placeholder="Nhập số điện thoại" />
              </div>
            </div>

            {/* Hàng chứa Mật khẩu & Xác nhận */}
            <div className="input-row">
              <div className="input-group">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input type="password" placeholder="••••••••" />
                </div>
              </div>

              <div className="input-group">
                <label>Xác nhận mật khẩu</label>
                <div className="input-wrapper">
                  <ShieldCheck className="input-icon" size={18} />
                  <input type="password" placeholder="••••••••" />
                </div>
              </div>
            </div>

            {/* Điều khoản */}
            <label className="terms-checkbox">
              <input type="checkbox" />
              <span>
                Tôi đồng ý với <a href="#!">Điều khoản dịch vụ</a> và <a href="#!">Chính sách bảo mật</a> của ViecNhanh.
              </span>
            </label>

            {/* Nút Submit */}
            <button type="button" className="btn-register-submit">Đăng ký ngay</button>
          </form>

          {/* Social Links */}
          <div className="divider">HOẶC ĐĂNG KÝ BẰNG</div>
          <div className="social-login">
            <button className="btn-social">
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="social-icon" />
              Google
            </button>
            <button className="btn-social">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png" alt="Facebook" className="social-icon" />
              Facebook
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}