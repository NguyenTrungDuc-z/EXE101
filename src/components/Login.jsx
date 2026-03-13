import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Eye, EyeOff } from 'lucide-react';
import './Login.css';

export default function Login() {
  // State quản lý việc ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      
      {/* CỘT TRÁI - BANNER QUẢNG CÁO */}
      <div className="login-left">
        <div className="login-logo-box">
          <Briefcase className="login-logo-icon" size={24} />
          ViecNhanh
        </div>

        <h1>
          Tìm kiếm người giúp việc <br />
          <span className="text-orange">tận tâm</span> chỉ trong <br />
          vài phút.
        </h1>

        <div className="login-image-container">
          <img 
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop" 
            alt="Người đại diện" 
          />
        </div>

        <div className="login-stats">
          <div className="login-stat-card">
            <h4>5000+</h4>
            <p>Đối tác</p>
          </div>
          <div className="login-stat-card">
            <h4>4.9/5</h4>
            <p>Đánh giá</p>
          </div>
          <div className="login-stat-card">
            <h4>24/7</h4>
            <p>Hỗ trợ</p>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI - FORM ĐĂNG NHẬP */}
      <div className="login-right">
        <div className="login-right-content">
          <h2>Chào mừng trở lại</h2>
          <p className="login-subtitle">
            Bạn mới biết đến ViecNhanh? <Link to="/Register" className="login-link">Tạo tài khoản mới</Link>
          </p>

          <form>
            <div className="form-group">
              <label>Email hoặc Số điện thoại</label>
              <input type="text" placeholder="name@example.com" />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <Link to="/ForgotPassword" className="forgot-password">Quên mật khẩu?</Link>
              
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
              />
              
              {/* Nút bấm chuyển đổi ẩn hiện mật khẩu */}
              <div 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            <label className="remember-me">
              <input type="checkbox" />
              Ghi nhớ đăng nhập
            </label>

            <button type="button" className="btn-submit">Đăng nhập</button>
          </form>

          <div className="divider">Hoặc tiếp tục với</div>

          <div className="social-login">
            <button className="btn-social">
              {/* Fake logo Google bằng ảnh */}
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="social-icon" />
              Google
            </button>
            
          </div>

          <p className="terms-text">
            Bằng việc đăng nhập, bạn đồng ý với <a href="#!">Điều khoản dịch vụ</a> và <a href="#!">Chính sách bảo mật</a> của chúng tôi.
          </p>
        </div>
      </div>

    </div>
  );
}