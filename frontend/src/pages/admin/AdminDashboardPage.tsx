import React, { useEffect, useState } from "react";
import { 
  Users, 
  UserCircle, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  MoreVertical, 
  Download, 
  Layers, 
  Wrench, 
  Home, 
  Snowflake 
} from "lucide-react";
import { platformApi } from "../../api/platformApi";
import type { AdminOverview } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);

  useEffect(() => {
    platformApi.getAdminOverview().then(setData);
  }, []);

  const stats = [
    { label: "Người dùng", value: "1,240", trend: "+12%", isUp: true, icon: <UserCircle size={24} />, color: "#0066FF", bg: "#EFF6FF" },
    { label: "Khách hàng", value: "856", trend: "+5%", isUp: true, icon: <Briefcase size={24} />, color: "#0066FF", bg: "#EFF6FF" },
    { label: "Thợ dịch vụ", value: "384", trend: "-2%", isUp: false, icon: <Wrench size={24} />, color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Yêu cầu mới", value: "142", trend: "+24%", isUp: true, icon: <FileText size={24} />, color: "#0891B2", bg: "#ECFEFF" },
  ];

  const recentActivities = [
    { id: 1, title: "Kỹ thuật viên mới", desc: "Nguyễn Văn Nam vừa đăng ký tài khoản thợ điện.", time: "2 phút trước", icon: <Users size={22} />, bg: "#EFF6FF", color: "#0066FF" },
    { id: 2, title: "Hoàn tất đơn hàng", desc: "Đơn sửa ống nước #5541 đã hoàn thành xuất sắc.", time: "15 phút trước", icon: <CheckCircle2 size={22} />, bg: "#F0FDF4", color: "#22C55E" },
    { id: 3, title: "Khiếu nại đang chờ", desc: "Người dùng Trần Thị A gửi khiếu nại về dịch vụ vệ sinh.", time: "1 giờ trước", icon: <AlertCircle size={22} />, bg: "#FFF7ED", color: "#F97316" },
  ];

  const newRequests = [
    { id: "KH2301", service: "Sửa ống nước (Khẩn)", location: "Phường 5, Quận 3, TP.HCM", distance: "Cách đây 10 phút", price: "350,000đ", status: "CHỜ XỬ LÝ", statusColor: "#0066FF", statusBg: "#EFF6FF", icon: <Wrench size={20} /> },
    { id: "VS1102", service: "Dọn dẹp căn hộ", location: "VinHomes Central Park, Bi...", distance: "Cách đây 25 phút", price: "450,000đ", status: "ĐANG THỰC HIỆN", statusColor: "#22C55E", statusBg: "#F0FDF4", icon: <Home size={20} /> },
    { id: "ML8820", service: "Vệ sinh máy lạnh", location: "Thảo Điền, Quận 2, Thủ Đức", distance: "Cách đây 45 phút", price: "220,000đ", status: "CHỜ XỬ LÝ", statusColor: "#0066FF", statusBg: "#EFF6FF", icon: <Snowflake size={20} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      {/* Page Header */}
      <div>
        <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#0066FF", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>QUẢN TRỊ VIÊN</h3>
        <h1 style={{ fontSize: "40px", fontWeight: 850, color: "#1E293B", lineHeight: 1.1, marginBottom: "12px" }}>Bảng điều phối vận hành</h1>
        <p style={{ fontSize: "17px", color: "#64748B", maxWidth: "800px", lineHeight: 1.6 }}>
          Phân tích tổng quan hiệu suất, trạng thái đơn hàng và hoạt động thời gian thực trên nền tảng ViecNhanh .
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "24px" }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ background: "white", padding: "28px", borderRadius: "32px", border: "1px solid #F1F5F9", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {stat.icon}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 700, color: stat.isUp ? "#22C55E" : "#EF4444" }}>
                {stat.isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {stat.trend}
              </div>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#64748B", marginBottom: "4px" }}>{stat.label}</div>
            <div style={{ fontSize: "32px", fontWeight: 850, color: "#1E293B" }}>{stat.value}</div>
          </div>
        ))}
        
        {/* Revenue Card */}
        <div style={{ 
          background: "#0066FF", 
          padding: "28px", 
          borderRadius: "32px", 
          color: "white", 
          position: "relative", 
          overflow: "hidden",
          boxShadow: "0 12px 24px rgba(0, 102, 255, 0.2)"
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
              <Layers size={24} />
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>Doanh thu (VNĐ)</div>
            <div style={{ fontSize: "32px", fontWeight: 850 }}>1.1B</div>
          </div>
          <div style={{ position: "absolute", right: "-20px", bottom: "-20px", width: "120px", height: "120px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
        {/* Revenue Chart */}
        <div style={{ background: "white", padding: "32px", borderRadius: "32px", border: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
            <div>
              <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>Biểu đồ doanh thu</h3>
              <p style={{ fontSize: "14px", color: "#94A3B8" }}>Xu hướng doanh thu theo tuần trong tháng hiện tại</p>
            </div>
            <select style={{ background: "#F1F5F9", border: "none", borderRadius: "12px", padding: "8px 16px", fontSize: "14px", fontWeight: 700, color: "#1E293B", outline: "none" }}>
              <option>Tháng này</option>
              <option>Tháng trước</option>
            </select>
          </div>
          
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "240px", padding: "0 20px" }}>
            {[
              { day: "Thứ 2", h: "40%" },
              { day: "Thứ 3", h: "60%" },
              { day: "Thứ 4", h: "45%" },
              { day: "Thứ 5", h: "75%" },
              { day: "Thứ 6", h: "100%", active: true },
              { day: "Thứ 7", h: "80%" },
              { day: "Chủ Nhật", h: "55%" },
            ].map(bar => (
              <div key={bar.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", flex: 1 }}>
                <div style={{ width: "48px", height: "200px", background: "#F1F5F9", borderRadius: "12px", position: "relative", overflow: "hidden" }}>
                  <div style={{ 
                    position: "absolute", 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: bar.h, 
                    background: bar.active ? "#0066FF" : "#E2E8F0", 
                    borderRadius: "12px",
                    transition: "height 0.5s ease"
                  }} />
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8" }}>{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: "white", padding: "32px", borderRadius: "32px", border: "1px solid #F1F5F9" }}>
          <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#1E293B", marginBottom: "32px" }}>Hoạt động gần đây</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {recentActivities.map(activity => (
              <div key={activity.id} style={{ display: "flex", gap: "20px" }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "16px", 
                  background: activity.bg, 
                  color: activity.color, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {activity.icon}
                </div>
                <div style={{ flex: 1, borderBottom: "1px solid #F1F5F9", paddingBottom: "24px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>{activity.title}</div>
                  <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.5, marginBottom: "8px" }}>{activity.desc}</p>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button style={{ 
            width: "100%", 
            marginTop: "32px", 
            padding: "16px", 
            background: "#EFF6FF", 
            color: "#0066FF", 
            border: "none", 
            borderRadius: "16px", 
            fontSize: "14px", 
            fontWeight: 700, 
            cursor: "pointer" 
          }}>
            Xem tất cả hoạt động
          </button>
        </div>
      </div>

      {/* New Requests Table */}
      <div style={{ background: "white", padding: "32px", borderRadius: "32px", border: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>Yêu cầu dịch vụ mới</h3>
            <p style={{ fontSize: "14px", color: "#94A3B8" }}>Tổng cộng 14 yêu cầu đang chờ xử lý</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "10px 20px", 
              background: "#F1F5F9", 
              color: "#64748B", 
              border: "none", 
              borderRadius: "12px", 
              fontSize: "14px", 
              fontWeight: 700, 
              cursor: "pointer" 
            }}>
              <Download size={18} />
              Tải báo cáo CSV
            </button>
            <button style={{ 
              padding: "10px 20px", 
              background: "#0066FF", 
              color: "white", 
              border: "none", 
              borderRadius: "12px", 
              fontSize: "14px", 
              fontWeight: 700, 
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 102, 255, 0.2)"
            }}>
              Xử lý hàng loạt
            </button>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #F1F5F9" }}>
              <th style={{ padding: "0 0 20px 0", fontSize: "12px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>DỊCH VỤ</th>
              <th style={{ padding: "0 0 20px 0", fontSize: "12px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>ĐỊA ĐIỂM</th>
              <th style={{ padding: "0 0 20px 0", fontSize: "12px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>CHI PHÍ</th>
              <th style={{ padding: "0 0 20px 0", fontSize: "12px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>TRẠNG THÁI</th>
              <th style={{ padding: "0 0 20px 0", fontSize: "12px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right" }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {newRequests.map(req => (
              <tr key={req.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                <td style={{ padding: "24px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F1F5F9", color: "#0066FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {req.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#1E293B", marginBottom: "2px" }}>{req.service}</div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>ID: #{req.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "24px 0" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#1E293B", marginBottom: "2px" }}>{req.location}</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>{req.distance}</div>
                </td>
                <td style={{ padding: "24px 0" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#1E293B" }}>{req.price}</span>
                </td>
                <td style={{ padding: "24px 0", textAlign: "center" }}>
                  <span style={{ 
                    padding: "6px 16px", 
                    borderRadius: "8px", 
                    fontSize: "11px", 
                    fontWeight: 800, 
                    background: req.statusBg, 
                    color: req.statusColor 
                  }}>
                    {req.status}
                  </span>
                </td>
                <td style={{ padding: "24px 0", textAlign: "right" }}>
                  <button style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", padding: "8px" }}>
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>© 2024 ViecNhanh  Admin Ecosystem. All rights reserved.</p>
          <div style={{ display: "flex", gap: "32px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", cursor: "pointer" }}>Điều khoản hệ thống</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", cursor: "pointer" }}>Bảo mật dữ liệu</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", cursor: "pointer" }}>Hỗ trợ kỹ thuật</span>
          </div>
        </div>
      </div>

      {/* Floating Support Button */}
      <button style={{ 
        position: "fixed", 
        bottom: "32px", 
        right: "32px", 
        width: "56px", 
        height: "56px", 
        background: "#0066FF", 
        color: "white", 
        border: "none", 
        borderRadius: "50%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        boxShadow: "0 12px 24px rgba(0, 102, 255, 0.3)",
        cursor: "pointer",
        zIndex: 1000
      }}>
        <div style={{ position: "relative" }}>
          <Users size={24} />
          <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "12px", height: "12px", background: "#22C55E", borderRadius: "50%", border: "2px solid #0066FF" }} />
        </div>
      </button>
    </div>
  );
}