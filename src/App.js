import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext'; 
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

// Import các components
import Header from './components/Header';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Service from './components/Service';
import ServiceDetail from './components/ServiceDetail';
import Bookings from './components/Booking';
import DetailUser from './components/DetailUser'; // 1. Bổ sung import DetailUser

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />

          <main className="main-content"> {/* Thêm thẻ main để dễ quản lý layout */}
            <Routes>
              {/* Trang chủ */}
              <Route path="/" element={<HomePage />} />
              
              {/* Dịch vụ */}
              <Route path="/Service" element={<Service />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
              
              {/* Quản lý đơn hàng */}
              <Route path="/Bookings" element={<Bookings />} />
              
              {/* Tài khoản & Profile */}
              <Route path="/Login" element={<Login />} />
              <Route path="/Register" element={<Register />} />
              <Route path="/ForgotPassword" element={<ForgotPassword />} />
              
              {/* 2. Bổ sung Route cho trang Hồ sơ cá nhân */}
              <Route path="/DetailUser" element={<DetailUser />} />

              {/* Bạn có thể thêm trang 404 nếu cần */}
              <Route path="*" element={<div style={{padding: '100px', textAlign: 'center'}}><h2>404 - Không tìm thấy trang</h2></div>} />
            </Routes>
          </main>

          <Footer />
        </div>
        
        <ToastContainer 
          position="top-right" 
          autoClose={2000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;