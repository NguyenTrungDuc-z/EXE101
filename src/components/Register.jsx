import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
import { 
  CheckCircle2, Search, Briefcase, User, Mail, Phone, Lock, ShieldCheck, Loader2 
} from 'lucide-react';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState('employer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Validate cơ bản bằng Toast
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.warning('Vui lòng điền đầy đủ các trường thông tin!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    if (!agreeTerms) {
      toast.info('Bạn cần đồng ý với điều khoản để tiếp tục.');
      return;
    }

    setIsLoading(true);

    try {
      // Giả lập kiểm tra email tồn tại (Tùy chọn)
      const checkRes = await fetch(`http://localhost:9999/users?email=${formData.email}`);
      const existingUsers = await checkRes.json();
      
      if (existingUsers.length > 0) {
        toast.error('Email này đã được đăng ký. Hãy thử email khác!');
        setIsLoading(false);
        return;
      }

      // 2. Gửi request POST
      const response = await fetch('http://localhost:9999/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Thay alert bằng toast thành công
        toast.success('🎉 Đăng ký tài khoản thành công! Đang chuyển hướng...');
        
        // Chờ một chút để người dùng kịp nhìn thấy toast thành công
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        toast.error('Đăng ký thất bại. Lỗi từ máy chủ!');
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      toast.error('Không thể kết nối đến máy chủ. Hãy kiểm tra json-server!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        
        {/* CỘT TRÁI - TEXT & BENEFITS */}
        <div className="register-left">
          <h1>Bắt đầu hành trình sự nghiệp của bạn</h1>
          <p className="register-left-desc">
            Gia nhập cộng đồng tìm việc nhanh chóng và hiệu quả nhất Việt Nam.
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
          </div>
        </div>

        {/* CỘT PHẢI - FORM */}
        <div className="register-right">
          <h2>Đăng ký tài khoản</h2>
          <p className="register-subtitle">
            Bạn đã có tài khoản? <Link to="/Login" className="register-link">Đăng nhập ngay</Link>
          </p>

          <form onSubmit={handleRegister}>
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

            <div className="input-group">
              <label>Họ và tên</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input 
                  type="text" name="name"
                  value={formData.name} onChange={handleInputChange}
                  placeholder="Nhập họ và tên của bạn" 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" name="email"
                  value={formData.email} onChange={handleInputChange}
                  placeholder="example@gmail.com" 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Số điện thoại</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={18} />
                <input 
                  type="tel" name="phone"
                  value={formData.phone} onChange={handleInputChange}
                  placeholder="Nhập số điện thoại" 
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type="password" name="password"
                    value={formData.password} onChange={handleInputChange}
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Xác nhận mật khẩu</label>
                <div className="input-wrapper">
                  <ShieldCheck className="input-icon" size={18} />
                  <input 
                    type="password" name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleInputChange}
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </div>

            <label className="terms-checkbox">
              <input 
                type="checkbox" 
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                Tôi đồng ý với <a href="#!">Điều khoản</a> và <a href="#!">Chính sách</a>.
              </span>
            </label>

            <button 
              type="submit" 
              className="btn-register-submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
            </button>
          </form>

          <div className="divider">HOẶC</div>
          <div className="social-login">
            <button className="btn-social">
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="social-icon" />
              Tiếp tục với Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}