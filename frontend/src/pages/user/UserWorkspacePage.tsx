import React, { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Wallet, 
  User, 
  HelpCircle, 
  Search, 
  Bell, 
  Zap,
  Clock,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  MapPin,
  Star,
  LogOut,
  CreditCard,
  ShieldCheck,
  Phone,
  Mail,
  Camera,
  Home,
  Briefcase,
  Plus,
  MessageSquare,
  Upload,
  ChevronDown
} from "lucide-react";
import { viText } from "../../utils/vietnameseText";
import type { Order, AuthUser, WalletTransaction, UserProfile } from "../../types/platform";
import { useNavigate } from "react-router-dom";

export default function UserWorkspacePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeOrderTab, setActiveOrderTab] = useState("ongoing");
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("homeswift_user");
    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
      setLoading(true);
      
      Promise.all([
        platformApi.getUserOrders(userData.code),
        platformApi.getUserProfile(userData.code),
        platformApi.getWalletHistory(userData.code)
      ]).then(([ordersData, profileData, txData]) => {
        setOrders(ordersData);
        setProfile(profileData);
        setTransactions(txData);
      }).finally(() => setLoading(false));
    }
  }, []);

  // Fetch pending orders when worker-dashboard tab is active
  useEffect(() => {
    if (activeTab === "worker" && user?.role === "worker") {
      setLoading(true);
      platformApi.getPendingOrders()
        .then((pendingOrders) => {
          setOrders(pendingOrders);
        })
        .catch(err => console.error("Error fetching pending orders:", err))
        .finally(() => setLoading(false));
    }
  }, [activeTab, user?.role]);

const handleLogout = () => {
    localStorage.removeItem("homeswift_user");
    localStorage.removeItem("homeswift_token");
    // Notify other tabs/components (UserLayout) to update user state
    window.dispatchEvent(new Event("homeswift-auth"));
    navigate("/login");
  };

  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: <LayoutDashboard size={20} /> },
    { id: "orders", label: "Đơn hàng của tôi", icon: <ShoppingBag size={20} /> },
    ...(user?.role === "worker"
      ? [{ id: "worker", label: "Không gian làm việc của Thợ", icon: <Briefcase size={20} /> }]
      : []),
    { id: "wallet", label: "Ví & Ưu đãi", icon: <Wallet size={20} /> },
    { id: "profile", label: "Thông tin cá nhân", icon: <User size={20} /> },
    { id: "support", label: "Hỗ trợ", icon: <HelpCircle size={20} /> },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#22C55E";
      case "confirmed": return "#0066FF";
      case "finding_worker": return "#F97316";
      case "payment_review": return "#7C3AED";
      case "COMPLETED_PENDING_REVIEW": return "#F59E0B";
      case "COMPLETED": return "#22C55E";
      case "SUCCESS": return "#22C55E";
      case "cancelled":
      case "canceled": return "#EF4444";
      default: return "#64748B";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Đã hoàn thành";
      case "confirmed": return "Đã xác nhận";
      case "finding_worker": return "Đang tìm thợ";
      case "payment_review": return "Chờ admin duyệt tiền";
      case "accepted_by_technician": return "Thợ đã nhận việc";
      case "in_progress": return "Đang thực hiện";
      case "COMPLETED_PENDING_REVIEW": return "Chờ nghiệm thu";
      case "COMPLETED_BY_TECHNICIAN": return "Thợ báo hoàn thành";
      case "COMPLETED": return "Đã hoàn thành";
      case "SUCCESS": return "Đã hoàn thành";
      case "cancelled":
      case "canceled": return "Đã hủy";
      default: return status;
    }
  };

  const getProgress = (status: string) => {
    switch (status) {
      case "payment_review": return 25;
      case "finding_worker": return 40;
      case "confirmed": return 60;
      case "accepted_by_technician": return 75;
      case "in_progress": return 85;
      case "COMPLETED_BY_TECHNICIAN": return 95;
      case "COMPLETED_PENDING_REVIEW": return 95;
      case "COMPLETED": return 100;
      case "SUCCESS": return 100;
      case "completed": return 100;
      default: return 10;
    }
  };

  const renderOrders = () => {
    const filteredOrders = orders.filter((order) => {
      if (activeOrderTab === "ongoing") {
        return order.status !== "completed" && order.status !== "SUCCESS" && order.status !== "COMPLETED" && order.status !== "cancelled" && order.status !== "canceled";
      }
      if (activeOrderTab === "completed") {
        return order.status === "completed" || order.status === "SUCCESS" || order.status === "COMPLETED";
      }
      if (activeOrderTab === "cancelled") {
        return order.status === "cancelled" || order.status === "canceled";
      }
      return true;
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "32px", borderBottom: "2px solid #E2E8F0" }}>
          {[
            { id: "ongoing", label: "Đang diễn ra" },
            { id: "completed", label: "Đã hoàn thành" },
            { id: "cancelled", label: "Đã hủy" }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveOrderTab(tab.id)}
              style={{
                padding: "12px 0",
                fontSize: "16px",
                fontWeight: 700,
                color: activeOrderTab === tab.id ? "#0066FF" : "#64748B",
                border: "none",
                background: "transparent",
                borderBottom: activeOrderTab === tab.id ? "3px solid #0066FF" : "3px solid transparent",
                cursor: "pointer",
                marginBottom: "-2px"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>Đang tải đơn hàng...</div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: "80px", textAlign: "center", background: "white", borderRadius: "32px", border: "1px solid #F1F5F9" }}>
              <ShoppingBag size={48} color="#CBD5E1" style={{ marginBottom: "16px" }} />
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#64748B" }}>Bạn chưa có đơn hàng nào</p>
              <button 
                onClick={() => navigate("/")}
                style={{ marginTop: "20px", padding: "12px 24px", background: "#0066FF", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                Đặt lịch ngay
              </button>
            </div>
          ) : filteredOrders.map((order) => (
          <div key={order.code} style={{ 
            background: "white", 
            borderRadius: "24px", 
            padding: "32px", 
            border: "1px solid #F1F5F9",
            boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#0066FF" }}>
                  <Zap size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>{viText(order.jobTitle || "Dịch vụ tận nơi")}</h3>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#94A3B8" }}>Order #{order.code}</div>
                  {order.technicianId && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                      <img src="https://i.pravatar.cc/150?u=tech" style={{ width: "24px", height: "24px", borderRadius: "50%" }} alt="Tech" />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>Kỹ thuật viên: <strong style={{ color: "#1E293B" }}>Siu nhân</strong></span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", marginBottom: "4px" }}>Thời gian: <span style={{ color: "#1E293B" }}>{new Date(order.scheduledAt || Date.now()).toLocaleDateString('vi-VN')}</span></div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#64748B" }}>Trạng thái: <strong style={{ color: getStatusColor(order.status) }}>{getStatusText(order.status)}</strong></div>
                  <div style={{ width: "200px", height: "8px", background: "#F1F5F9", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${getProgress(order.status)}%`, height: "100%", background: getStatusColor(order.status), transition: "width 0.5s ease" }} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#94A3B8" }}>{getProgress(order.status)}%</span>
                </div>
              </div>
            </div>

            <div style={{ height: "1px", background: "#F1F5F9" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", marginBottom: "4px" }}>Tổng số tiền:</div>
                <div style={{ fontSize: "20px", fontWeight: 850, color: "#1E293B" }}>{order.totalAmount.toLocaleString()}đ</div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button 
                  onClick={() => navigate(`/user/orders/${order.code}`)}
                  style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid #E2E8F0", background: "white", color: "#1E293B", fontWeight: 700, cursor: "pointer" }}
                >
                  Xem chi tiết
                </button>
                {(order.status === "COMPLETED_PENDING_REVIEW" || order.status === "COMPLETED_BY_TECHNICIAN") && user?.role === "employer" && (
                  <button 
                    onClick={() => {
                      setSelectedOrderForReview(order);
                      setShowReviewModal(true);
                    }}
                    style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "#F59E0B", color: "white", fontWeight: 700, cursor: "pointer" }}
                  >
                    Nghiệm thu & Đánh giá
                  </button>
                )}
                <button 
                  onClick={() => navigate(`/booking?jobCode=${order.jobCode}`)}
                  style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "#0066FF", color: "white", fontWeight: 700, cursor: "pointer" }}
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    );
  };

  const renderOverview = () => {
    const activeOrder = orders.find(o => o.status !== 'completed' && o.status !== 'cancelled');
    const recentOrders = orders.filter(o => o.status === 'completed').slice(0, 2);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1E293B" }}>Chào buổi sáng, {user?.name}!</h1>

        {/* Active Order Card */}
        <div style={{ background: "white", borderRadius: "24px", border: "1px solid #F1F5F9", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "14px", color: "#64748B", marginBottom: "8px" }}>Đơn hàng đang diễn ra</div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1E293B" }}>{activeOrder ? viText(activeOrder.jobTitle) : "Không có đơn hàng nào"} - {activeOrder ? getStatusText(activeOrder.status) : ""}</h2>
            </div>
            {activeOrder && (
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#0066FF" }}>
                    <Zap size={20} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>{viText(activeOrder.jobTitle)} - {new Date(activeOrder.scheduledAt).toLocaleDateString('vi-VN')}</div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>Trong lành: sạch đẹp điện lạnh</div>
                  </div>
                  <button onClick={() => navigate(`/booking?jobCode=${activeOrder.jobCode}`)} style={{ padding: "8px 16px", background: "#0066FF", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Đặt lại</button>
                </div>
              </div>
            )}
          </div>
          {activeOrder && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: 1, height: "8px", background: "#F1F5F9", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${getProgress(activeOrder.status)}%`, height: "100%", background: "#0066FF" }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#64748B" }}>{getProgress(activeOrder.status)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "14px", color: "#64748B" }}>
                  Thông tin: {user?.name}<br />
                  Thời gian: 09:00 - 20:00 - Địa điểm: dịch vụ tại nhà
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img src={user?.avatar || "https://i.pravatar.cc/150?u=user"} style={{ width: "32px", height: "32px", borderRadius: "50%" }} alt="User" />
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>{user?.name}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent History */}
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "16px" }}>Lịch sử dịch vụ gần đây</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentOrders.map((order, idx) => (
              <div key={idx} style={{ background: "white", borderRadius: "20px", border: "1px solid #F1F5F9", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                    <Zap size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{viText(order.jobTitle)} - {new Date(order.scheduledAt).toLocaleDateString('vi-VN')}</div>
                    <div style={{ fontSize: "13px", color: "#64748B" }}>Thông tin: dịch vụ</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <img src={user?.avatar || "https://i.pravatar.cc/150?u=user"} style={{ width: "24px", height: "24px", borderRadius: "50%" }} alt="User" />
                      <span style={{ fontSize: "13px", color: "#64748B" }}>{user?.name}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#22C55E", fontWeight: 700, fontSize: "14px" }}>Hoàn thành</div>
                  <div style={{ fontSize: "13px", color: "#64748B" }}>Thời gian: {new Date(order.scheduledAt).toLocaleDateString('vi-VN')}</div>
                  <div style={{ fontSize: "13px", color: "#64748B" }}>Giá đã trả: <strong style={{ color: "#1E293B" }}>{order.totalAmount.toLocaleString()}đ</strong></div>
                </div>
                <button onClick={() => navigate(`/booking?jobCode=${order.jobCode}`)} style={{ padding: "8px 20px", background: "#0066FF", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}>Đặt lại</button>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions & Loyalty */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "16px" }}>Dịch vụ gợi ý cho bạn</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ background: "white", padding: "20px", borderRadius: "20px", border: "1px solid #F1F5F9", display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                  <Zap size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>Giặt sofa</div>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>Giá cố định minh bạch của chúng tôi minh bạch</div>
                </div>
              </div>
              <div style={{ background: "white", padding: "20px", borderRadius: "20px", border: "1px solid #F1F5F9", display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                  <Zap size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>Diệt côn trùng</div>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>Thợ đã xác minh của mỗi lần văn và bảo bạn.</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #0066FF 0%, #0052CC 100%)", borderRadius: "24px", padding: "24px", color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Chương trình khách hàng thân thiết</div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "16px" }}>Chuyên hàng thân thiết là HomeSwift</div>
              <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px" }}>5,000 điểm</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>• Thưởng cho khách hàng thân thiết</div>
            </div>
            <Star size={80} style={{ position: "absolute", right: "-10px", bottom: "-10px", opacity: 0.2, color: "white" }} fill="currentColor" />
          </div>
        </div>
      </div>
    );
  };

  const renderWallet = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1E293B" }}>Ví của tôi & Ưu đãi thành viên</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>Ví HomeSwift</div>
            <div style={{ fontSize: "14px", color: "#64748B", marginBottom: "12px" }}>Số dư khả dụng</div>
            <div style={{ fontSize: "32px", fontWeight: 850, color: "#0066FF" }}>{user?.walletBalance?.toLocaleString()}đ</div>
          </div>
          <button style={{ padding: "12px 24px", background: "#0066FF", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>Nạp tiền</button>
        </div>
        <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid #F1F5F9" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#1E293B", marginBottom: "12px" }}>Điểm thưởng</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B" }}>
              <Star size={24} fill="currentColor" />
            </div>
            <div style={{ fontSize: "32px", fontWeight: 850, color: "#F59E0B" }}>5,000 điểm</div>
          </div>
          <div style={{ fontSize: "13px", color: "#64748B", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
            <HelpCircle size={14} /> Điểm có thể đổi quà
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "16px" }}>Voucher của bạn</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div style={{ background: "linear-gradient(135deg, #0066FF 0%, #0052CC 100%)", borderRadius: "20px", padding: "20px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800 }}>Giảm 50k</div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "12px" }}>cho đơn từ 200k</div>
              <button style={{ padding: "6px 16px", background: "white", color: "#0066FF", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Dùng ngay</button>
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, opacity: 0.3, transform: "rotate(-90deg)" }}>50k</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #0066FF 0%, #0052CC 100%)", borderRadius: "20px", padding: "20px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800 }}>Miễn phí</div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "12px" }}>vận chuyển</div>
              <button style={{ padding: "6px 16px", background: "#F59E0B", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Dùng ngay</button>
            </div>
            <Zap size={48} style={{ opacity: 0.3 }} />
          </div>
          <div style={{ background: "linear-gradient(135deg, #0066FF 0%, #0052CC 100%)", borderRadius: "20px", padding: "20px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800 }}>Giảm 10%</div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "12px" }}>dịch vụ vệ sinh</div>
              <button style={{ padding: "6px 16px", background: "white", color: "#0066FF", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Dùng ngay</button>
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, opacity: 0.3, transform: "rotate(-90deg)" }}>10%</div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "16px" }}>Lịch sử giao dịch ví</h3>
        <div style={{ background: "white", borderRadius: "24px", border: "1px solid #F1F5F9", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <th style={{ textAlign: "left", padding: "20px", color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Mô tả</th>
                <th style={{ textAlign: "left", padding: "20px", color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Ngày tháng</th>
                <th style={{ textAlign: "right", padding: "20px", color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Số tiền</th>
                <th style={{ textAlign: "right", padding: "20px", color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>Chưa có giao dịch nào</td></tr>
              ) : transactions.map((tx, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "20px", fontWeight: 600 }}>{tx.description}</td>
                  <td style={{ padding: "20px", color: "#64748B" }}>{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: "20px", textAlign: "right", fontWeight: 700, color: tx.type === 'deposit' ? "#22C55E" : "#EF4444" }}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}đ
                  </td>
                  <td style={{ padding: "20px", textAlign: "right", color: "#22C55E", fontWeight: 600 }}>Hoàn thành</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1E293B" }}>Thông tin cá nhân</h1>
      
      <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid #F1F5F9" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "24px" }}>Chỉnh sửa hồ sơ</h3>
        <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <img src={user?.avatar || "https://i.pravatar.cc/150?u=user"} style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }} alt="Avatar" />
            <button style={{ position: "absolute", bottom: 0, right: 0, width: "32px", height: "32px", borderRadius: "50%", background: "#0066FF", color: "white", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Camera size={16} />
            </button>
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#64748B" }}>Tên từ avatar</label>
              <div style={{ position: "relative" }}>
                <input value={user?.name} style={{ width: "100%", padding: "12px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", fontWeight: 600 }} readOnly />
                <MoreVertical size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#64748B" }}>Số điện thoại (đã xác thực)</label>
              <div style={{ position: "relative" }}>
                <input value={profile?.phone || "0901234567"} style={{ width: "100%", padding: "12px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", fontWeight: 600 }} readOnly />
                <CheckCircle2 size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#22C55E" }} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#64748B" }}>Email</label>
              <div style={{ position: "relative" }}>
                <input value={profile?.email || "nguyenvana@email.com"} style={{ width: "100%", padding: "12px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", fontWeight: 600 }} readOnly />
                <MoreVertical size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "16px" }}>Quản lý địa chỉ</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #F1F5F9", display: "flex", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#EFF6FF", color: "#0066FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Home size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>Nhà</div>
              <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "16px" }}>123 Đường ABC, Quận 1, TP.HCM</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ padding: "6px 20px", background: "white", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Sửa</button>
                <button style={{ padding: "6px 20px", background: "#FEF2F2", border: "1px solid #FEE2E2", color: "#EF4444", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Xóa</button>
              </div>
            </div>
          </div>
          <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #F1F5F9", display: "flex", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#F8FAFC", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Briefcase size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>Văn phòng</div>
              <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "16px" }}>456 Đường XYZ, Quận 3, TP.HCM</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ padding: "6px 20px", background: "white", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Sửa</button>
                <button style={{ padding: "6px 20px", background: "#FEF2F2", border: "1px solid #FEE2E2", color: "#EF4444", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Xóa</button>
              </div>
            </div>
          </div>
        </div>
        <button style={{ width: "100%", marginTop: "16px", padding: "14px", background: "white", border: "1px solid #E2E8F0", borderRadius: "16px", color: "#1E293B", fontWeight: 700, cursor: "pointer" }}>[Thêm địa chỉ mới]</button>
      </div>

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "16px" }}>Bảo mật</h3>
        <button style={{ width: "100%", padding: "14px", background: "white", border: "1px solid #E2E8F0", borderRadius: "16px", color: "#1E293B", fontWeight: 700, cursor: "pointer" }}>[Đổi mật khẩu]</button>
      </div>

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "16px" }}>Tài khoản liên kết</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: "white", padding: "16px 24px", borderRadius: "16px", border: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>G</div>
              <span style={{ fontWeight: 600 }}>Google (Đã liên kết)</span>
            </div>
            <CheckCircle2 size={20} color="#22C55E" />
          </div>
          <div style={{ background: "white", padding: "16px 24px", borderRadius: "16px", border: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1877F2", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>f</div>
              <span style={{ fontWeight: 600 }}>Facebook (Chưa liên kết)</span>
            </div>
            <ChevronRight size={20} color="#94A3B8" />
          </div>
        </div>
      </div>
    </div>
  );

  const handleWorkerResponse = (orderCode: string, response: "accepted" | "rejected") => {
    platformApi.respondToOrder(orderCode, response)
      .then(() => {
        alert(`Đã ${response === "accepted" ? "chấp nhận" : "từ chối"} đơn hàng`);
        window.location.reload();
      })
      .catch(err => alert("Lỗi: " + err.message));
  };

  const handleCompleteOrder = (orderCode: string) => {
    if (confirm("Bạn xác nhận đã hoàn thành công việc này?")) {
      platformApi.completeOrder(orderCode)
        .then(() => {
          alert("Đã báo cáo hoàn thành công việc. Vui lòng chờ khách hàng nghiệm thu.");
          window.location.reload();
        })
        .catch(err => alert("Lỗi: " + err.message));
    }
  };

  const handleReviewOrder = () => {
    if (!selectedOrderForReview) return;
    
    platformApi.reviewOrder(selectedOrderForReview.code, { rating, comment })
      .then(() => {
        alert("Cảm ơn bạn đã đánh giá dịch vụ!");
        setShowReviewModal(false);
        window.location.reload();
      })
      .catch(err => alert("Lỗi: " + err.message));
  };

  const renderWorkerDashboard = () => {
    const pendingAcceptOrders = orders.filter(o => o.status === "PENDING_ASSIGN" || o.status === "PENDING_ACCEPT");
    const inProgressOrders = orders.filter(o => o.status === "IN_PROGRESS");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1E293B" }}>Công việc được gán</h1>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {pendingAcceptOrders.length === 0 ? (
            <div style={{ padding: "80px", textAlign: "center", background: "white", borderRadius: "32px", border: "1px solid #F1F5F9" }}>
              <Briefcase size={48} color="#CBD5E1" style={{ marginBottom: "16px" }} />
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#64748B" }}>Hiện chưa có công việc mới nào được gán cho bạn</p>
            </div>
          ) : pendingAcceptOrders.map((order) => (
            <div key={order.code} style={{ 
              background: "white", 
              borderRadius: "24px", 
              padding: "32px", 
              border: "1px solid #F1F5F9",
              boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "24px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", color: "#22C55E" }}>
                    <Zap size={32} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>{viText(order.jobTitle || "Dịch vụ tận nơi")}</h3>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#94A3B8" }}>Mã đơn: {order.code}</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#64748B", marginTop: "8px" }}>Địa chỉ: {order.address}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", marginBottom: "4px" }}>Tiền công dự kiến:</div>
                  <div style={{ fontSize: "24px", fontWeight: 850, color: "#22C55E" }}>{(order.technicianPayout || 0).toLocaleString()}đ</div>
                </div>
              </div>

              <div style={{ height: "1px", background: "#F1F5F9" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "14px", color: "#64748B" }}>
                  Thời gian hẹn: <strong>{new Date(order.scheduledAt || Date.now()).toLocaleString('vi-VN')}</strong>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button 
                    onClick={() => handleWorkerResponse(order.code, "rejected")}
                    style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "#EF4444", color: "white", fontWeight: 700, cursor: "pointer" }}
                  >
                    Từ chối
                  </button>
                  <button 
                    onClick={() => handleWorkerResponse(order.code, "accepted")}
                    style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "#22C55E", color: "white", fontWeight: 700, cursor: "pointer" }}
                  >
                    Đồng ý đi làm
                  </button>
                </div>
              </div>
            </div>
          ))}

          {inProgressOrders.length > 0 && (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1E293B", marginTop: "20px" }}>Công việc đang thực hiện</h2>
              {inProgressOrders.map((order) => (
                <div key={order.code} style={{ 
                  background: "white", 
                  borderRadius: "24px", 
                  padding: "32px", 
                  border: "1px solid #F1F5F9",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "20px" }}>
                      <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#0066FF" }}>
                        <Clock size={32} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>{viText(order.jobTitle || "Dịch vụ tận nơi")}</h3>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#94A3B8" }}>Mã đơn: {order.code}</div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#64748B", marginTop: "8px" }}>Địa chỉ: {order.address}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", marginBottom: "4px" }}>Tiền công:</div>
                      <div style={{ fontSize: "24px", fontWeight: 850, color: "#0066FF" }}>{(order.technicianPayout || 0).toLocaleString()}đ</div>
                    </div>
                  </div>

                  <div style={{ height: "1px", background: "#F1F5F9" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "14px", color: "#64748B" }}>
                      Trạng thái: <strong style={{ color: "#0066FF" }}>Đang thực hiện</strong>
                    </div>
                    <button 
                      onClick={() => handleCompleteOrder(order.code)}
                      style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "#0066FF", color: "white", fontWeight: 700, cursor: "pointer" }}
                    >
                      Báo cáo hoàn thành
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSupport = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1E293B" }}>Trung tâm trợ giúp & Hỗ trợ khách hàng</h1>
      
      <div style={{ position: "relative" }}>
        <Search size={20} style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
        <input placeholder="Tìm câu hỏi thường gặp..." style={{ width: "100%", padding: "16px 24px", background: "white", border: "1px solid #E2E8F0", borderRadius: "16px", fontSize: "15px" }} />
      </div>

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "16px" }}>Các danh mục FAQ phổ biến</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #F1F5F9", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#0066FF", margin: "0 auto 16px" }}>
              <Wallet size={28} />
            </div>
            <div style={{ fontWeight: 700, marginBottom: "4px" }}>Chính sách hoàn tiền</div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>Chính sách hoàn tiền - chính sách hoàn tiền</div>
          </div>
          <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #F1F5F9", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#0066FF", margin: "0 auto 16px" }}>
              <Clock size={28} />
            </div>
            <div style={{ fontWeight: 700, marginBottom: "4px" }}>Cách đổi lịch hẹn</div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>Cách đổi lịch hẹn và cùng cách đổi lịch hẹn và sên.</div>
          </div>
          <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #F1F5F9", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#0066FF", margin: "0 auto 16px" }}>
              <ShieldCheck size={28} />
            </div>
            <div style={{ fontWeight: 700, marginBottom: "4px" }}>Bảo hiểm hư hại</div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>Bảo hiểm hư hại và công xo ítàng bảo hiểm hư hại.</div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "16px" }}>Khu vực liên hệ trực tiếp</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 24px", background: "#0066FF", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>
            <MessageSquare size={20} /> Chat với chúng tôi
          </button>
          <div style={{ fontWeight: 700, color: "#1E293B" }}>Hotline hỗ trợ 24/7: <span style={{ color: "#0066FF" }}>1900 1234</span></div>
        </div>
      </div>

      <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid #F1F5F9" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", marginBottom: "24px" }}>Gửi yêu cầu hỗ trợ/khiếu nại</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "#64748B" }}>Chủ đề</label>
            <div style={{ position: "relative" }}>
              <select style={{ width: "100%", padding: "14px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", appearance: "none", fontWeight: 600 }}>
                <option>Chủ đề</option>
              </select>
              <ChevronDown size={20} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "#64748B" }}>Mô tả chi tiết</label>
            <textarea placeholder="Mô tả chi tiết" style={{ width: "100%", padding: "16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", minHeight: "120px", resize: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "#64748B" }}>Tải lên tệp đính kèm</label>
            <button style={{ width: "100%", padding: "14px", background: "white", border: "1px dashed #E2E8F0", borderRadius: "12px", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer" }}>
              <Upload size={20} /> Tải lên tệp đính kèm
            </button>
          </div>
          <button style={{ padding: "14px", background: "#0066FF", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", width: "fit-content" }}>Gửi yêu cầu</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: "280px", 
        background: "white", 
        borderRight: "1px solid #E2E8F0", 
        display: "flex", 
        flexDirection: "column",
        position: "fixed",
        height: "100vh",
        zIndex: 100
      }}>
        <div style={{ padding: "32px 24px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ 
            width: "32px", 
            height: "32px", 
            background: "#0066FF", 
            borderRadius: "8px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "white"
          }}>
            <ShieldCheck size={20} fill="currentColor" />
          </div>
          <span style={{ fontSize: "22px", fontWeight: 800, color: "#1E293B", letterSpacing: "-0.5px" }}>HomeSwift</span>
        </div>

        <nav style={{ flex: 1, padding: "0 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: activeTab === item.id ? "#EFF6FF" : "transparent",
                  color: activeTab === item.id ? "#0066FF" : "#64748B",
                  fontWeight: 600,
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left",
                  width: "100%"
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            {user?.role === "admin" && (
              <button 
                onClick={() => navigate("/admin")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #0066FF",
                  background: "white",
                  color: "#0066FF",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left",
                  width: "100%",
                  marginTop: "12px",
                  marginBottom: "4px"
                }}
              >
                <ShieldCheck size={20} />
                <span>Bảng điều khiển Admin</span>
              </button>
            )}

            <button 
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "none",
                background: "transparent",
                color: "#EF4444",
                fontWeight: 600,
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
                width: "100%",
                marginTop: "8px"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#FEF2F2"}
              onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </nav>

      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: "280px", padding: "44px 40px" }}>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "worker" && renderWorkerDashboard()}
        {activeTab === "wallet" && renderWallet()}
        {activeTab === "profile" && renderProfile()}
        {activeTab === "support" && renderSupport()}
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "32px",
            padding: "40px",
            width: "100%",
            maxWidth: "500px",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1E293B", marginBottom: "8px" }}>Nghiệm thu & Đánh giá</h2>
              <p style={{ color: "#64748B" }}>Vui lòng đánh giá chất lượng dịch vụ của thợ để hoàn tất đơn hàng.</p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star}
                  onClick={() => setRating(star)}
                  style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
                >
                  <Star 
                    size={40} 
                    fill={star <= rating ? "#F59E0B" : "none"} 
                    color={star <= rating ? "#F59E0B" : "#CBD5E1"} 
                  />
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#64748B" }}>Nhận xét của bạn</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
                style={{ 
                  width: "100%", 
                  padding: "16px", 
                  background: "#F8FAFC", 
                  border: "1px solid #E2E8F0", 
                  borderRadius: "16px", 
                  minHeight: "120px", 
                  resize: "none",
                  fontSize: "15px"
                }} 
              />
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <button 
                onClick={() => setShowReviewModal(false)}
                style={{ flex: 1, padding: "14px", borderRadius: "16px", border: "1px solid #E2E8F0", background: "white", color: "#64748B", fontWeight: 700, cursor: "pointer" }}
              >
                Hủy
              </button>
              <button 
                onClick={handleReviewOrder}
                style={{ flex: 1, padding: "14px", borderRadius: "16px", border: "none", background: "#0066FF", color: "white", fontWeight: 700, cursor: "pointer" }}
              >
                Gửi & Giải ngân
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
