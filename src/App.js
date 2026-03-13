import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import thư viện
import Header from './components/Header';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Service from './components/Service';

function App() {
  return (
    // Bọc toàn bộ App trong thẻ <Router>
    <Router>
      <div className="app-container">
        
        {/* Header luôn hiện ở mọi trang */}
        <Header />

        {/* Khu vực thay đổi nội dung tùy theo link */}
        <Routes>
          {/* Khi ở trang chủ (/) -> Hiện HomePage */}
          <Route path="/" element={<HomePage />} />
          
          {/* Chừa sẵn chỗ cho 2 trang kia (sau này tạo file thì thay vào element) */}
          <Route path="/Service" element={< Service/>} />
          <Route path="/don-dat" element={<h2 style={{padding: '100px', textAlign: 'center'}}>Đây là trang Đơn đặt</h2>} />

          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register/>} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
        </Routes>

        {/* Footer luôn hiện ở đáy */}
        <Footer />

      </div>
    </Router>
  );
}

export default App;