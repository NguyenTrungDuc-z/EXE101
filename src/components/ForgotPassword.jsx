import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Mail, ArrowRight, ChevronLeft } from 'lucide-react';
import './ForgotPassword.css';

export default function ForgotPassword() {
  return (
    <div className="forgot-page">
      <div className="forgot-card">
        
        {/* Icon trên cùng */}
        <div className="forgot-icon-wrapper">
          {/* Dùng icon RotateCcw để biểu thị việc khôi phục/đặt lại */}
          <RotateCcw size={28} />
        </div>

        <h2>Quên mật khẩu?</h2>
        <p className="forgot-desc">
          Nhập email của bạn để nhận mã khôi phục tài khoản từ ViecNhanh.
        </p>

        <form className="forgot-form">
          <label>Địa chỉ Email</label>
          <div className="forgot-input-wrapper">
            <Mail className="forgot-input-icon" size={18} />
            <input type="email" placeholder="example@gmail.com" />
          </div>

          <button type="button" className="btn-forgot-submit">
            Gửi mã khôi phục <ArrowRight size={18} />
          </button>
        </form>

        {/* Nút quay lại */}
        <div>
          <Link to="/Login" className="back-to-login">
            <ChevronLeft size={16} /> Quay lại đăng nhập
          </Link>
        </div>

        {/* Link hỗ trợ */}
        <div className="support-link">
          Bạn gặp sự cố? <a href="#!">Liên hệ hỗ trợ kỹ thuật</a>
        </div>

      </div>
    </div>
  );
}