import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      toast.warning('Vui long nhap day du tai khoan va mat khau!');
      return;
    }

    setIsLoading(true);

    try {
      // Gia lap do tre mang cho muot ma
      await new Promise(resolve => setTimeout(resolve, 800));

      const response = await fetch('http://localhost:9999/users');
      const users = await response.json();

      const matchedUser = users.find(
        (u) => (u.email === identifier || u.phone === identifier) && u.password === password
      );

      if (matchedUser) {
        const userInfo = {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          avatar: matchedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser.name)}&background=random`
        };

        // Cap nhat trang thai dang nhap toan cuc
        login(userInfo);

        toast.success(`Chao mung ${matchedUser.name} da quay tro lai!`);

        const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
        if (redirectAfterLogin) {
          localStorage.removeItem('redirectAfterLogin');
          setTimeout(() => navigate(redirectAfterLogin), 1000);
        } else {
          // Chuyen huong ve trang chu
          setTimeout(() => navigate('/'), 1000);
        }
      } else {
        toast.error('Tai khoan hoac mat khau khong chinh xac!');
      }
    } catch (error) {
      console.error('Loi khi dang nhap:', error);
      toast.error('May chu khong phan hoi. Vui long kiem tra json-server!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* COT TRAI - BANNER */}
      <div className="login-left">
        <div className="login-logo-box">
          <Briefcase className="login-logo-icon" size={24} />
          ViecNhanh
        </div>

        <h1>
          Tim kiem nguoi giup viec <br />
          <span className="text-orange">tan tam</span> chi trong <br />
          vai phut.
        </h1>

        <div className="login-image-container">
          <img 
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop" 
            alt="Nguoi dai dien" 
          />
        </div>

        <div className="login-stats">
          <div className="login-stat-card"><h4>5000+</h4><p>Doi tac</p></div>
          <div className="login-stat-card"><h4>4.9/5</h4><p>Danh gia</p></div>
          <div className="login-stat-card"><h4>24/7</h4><p>Ho tro</p></div>
        </div>
      </div>

      {/* COT PHAI - FORM */}
      <div className="login-right">
        <div className="login-right-content">
          <h2>Chao mung tro lai</h2>
          <p className="login-subtitle">
            Ban moi biet den ViecNhanh? <Link to="/Register" className="login-link">Tao tai khoan moi</Link>
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email hoac So dien thoai</label>
              <input 
                type="text" 
                placeholder="name@example.com hoac so dien thoai" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Mat khau</label>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter the password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
              />
              <div 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Ghi nho dang nhap</span>
              </label>
              <Link to="/ForgotPassword" className="forgot-password">
                Quen mat khau?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex-center">
                  <Loader2 className="animate-spin" size={20} />
                  <span> Dang xac thuc...</span>
                </div>
              ) : 'Dang nhap'}
            </button>
          </form>

          <div className="divider">Hoac tiep tuc voi</div>

          <div className="social-login">
            <button className="btn-social" type="button">
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="social-icon" />
              Google
            </button>
          </div>

          <p className="terms-text">
            Bang viec dang nhap, ban dong y voi <a href="#!">Dieu khoan dich vu</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
