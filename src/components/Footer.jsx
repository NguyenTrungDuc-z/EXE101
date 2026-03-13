import React from 'react';
import { Briefcase } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-grid">
        
        {/* CỘT 1: Thương hiệu */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <Briefcase size={20} color="white" />
            </div>
            ViecNhanh
          </div>
          <p>Nền tảng kết nối người cần dịch vụ với thợ chuyên nghiệp, nhanh chóng và uy tín.</p>
        </div>

        {/* CỘT 2: Dịch vụ */}
        <div className="footer-column">
          <h3>Dịch vụ</h3>
          <ul>
            <li><a href="#don-dep">Dọn dẹp</a></li>
            <li><a href="#lap-dat">Lắp đặt</a></li>
            <li><a href="#sua-chua">Sửa chữa</a></li>
          </ul>
        </div>

        {/* CỘT 3: Hỗ trợ */}
        <div className="footer-column">
          <h3>Hỗ trợ</h3>
          <ul>
            <li><a href="#help">Trung tâm trợ giúp</a></li>
            <li><a href="#contact">Liên hệ</a></li>
            <li><a href="#terms">Điều khoản</a></li>
          </ul>
        </div>

        {/* CỘT 4: Liên hệ */}
        <div className="footer-column">
          <h3>Liên hệ</h3>
          <ul>
            <li>Email: support@viecnhanh.vn</li>
            <li>Hotline: 1900 xxxx</li>
            <li>Thời gian: 7:00 - 22:00</li>
          </ul>
        </div>

      </div>

      {/* Dòng chữ dưới cùng */}
      <div className="footer-bottom">
        <p>© 2026 ViecNhanh. Bản quyền thuộc về ViecNhanh.</p>
      </div>
    </footer>
  );
}