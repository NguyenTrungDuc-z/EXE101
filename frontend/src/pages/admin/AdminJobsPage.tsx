import React, { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { 
  ShoppingBag, 
  Calendar, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  MapPin,
  User,
  CreditCard
} from "lucide-react";
import { viText } from "../../utils/vietnameseText";
import type { Order } from "../../types/platform";

export default function AdminJobsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(""); // Empty string means "all dates"
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTechnicians, setAvailableTechnicians] = useState<any[]>([]);
  const [assigning, setAssigning] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      platformApi.getAdminOrders(),
      platformApi.getAvailableTechnicians()
    ])
      .then(([ordersData, techniciansData]) => {
        const sorted = [...ordersData].sort((a, b) => 
          new Date(b.scheduledAt || 0).getTime() - new Date(a.scheduledAt || 0).getTime()
        );
        setOrders(sorted);
        setAvailableTechnicians(techniciansData);
      })
      .catch(err => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = (orderCode: string) => {
    const technicianCode = assigning[orderCode];
    if (!technicianCode) {
      alert("Vui lòng chọn thợ");
      return;
    }

    platformApi.assignTechnician(orderCode, technicianCode)
      .then(() => {
        alert("Giao việc thành công!");
        window.location.reload();
      })
      .catch(err => alert("Lỗi: " + err.message));
  };

  // Chuẩn hóa filter ngày: so sánh theo ISO YYYY-MM-DD
  // Nếu selectedDate là empty string thì hiển thị TẤT CẢ đơn hàng (không lọc theo ngày)
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.scheduledAt || Date.now()).toISOString().split('T')[0];
    const matchesDate = !selectedDate || orderDate === selectedDate; // Empty string means all dates
    const matchesSearch = (order.jobTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.employerCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const statsByStatus = {
    pending: filteredOrders.filter(o => o.status === 'pending' || o.status === 'finding_worker').length,
    completed: filteredOrders.filter(o => o.status === 'completed').length,
    paid: filteredOrders.filter(o => o.paymentStatus === 'paid').length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#0066FF", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>QUẢN TRỊ HỆ THỐNG</h3>
          <h1 style={{ fontSize: "40px", fontWeight: 850, color: "#1E293B", lineHeight: 1.1, marginBottom: "12px" }}>Quản lý đơn hàng (Bookings)</h1>
          <p style={{ fontSize: "17px", color: "#64748B", maxWidth: "800px", lineHeight: 1.6 }}>
            Theo dõi toàn bộ các đơn đặt lịch từ khách hàng, trạng thái thanh toán và tiến độ thực hiện của thợ.
          </p>
        </div>
        <button 
          onClick={() => window.history.back()}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "12px 24px", 
            background: "#EFF6FF", 
            color: "#0066FF", 
            border: "none", 
            borderRadius: "16px", 
            fontSize: "15px", 
            fontWeight: 700, 
            cursor: "pointer" 
          }}
        >
          <ChevronLeft size={20} />
          Về trang chủ
        </button>
      </div>

      {/* Filters & Date Selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "16px", flex: 1 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} color="#94A3B8" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mã đơn, khách hàng hoặc dịch vụ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "14px 16px 14px 48px", 
                background: "white", 
                border: "1px solid #E2E8F0", 
                borderRadius: "16px", 
                fontSize: "15px", 
                outline: "none",
                color: "#1E293B",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }} 
            />
          </div>
          <div style={{ position: "relative" }}>
            <Calendar size={18} color="#0066FF" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", zIndex: 1 }} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ 
                padding: "14px 16px 14px 48px", 
                background: "white", 
                border: "1px solid #E2E8F0", 
                borderRadius: "16px", 
                fontSize: "15px", 
                fontWeight: 700,
                outline: "none",
                color: "#1E293B",
                cursor: "pointer"
              }} 
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ padding: "14px", background: "white", border: "1px solid #E2E8F0", borderRadius: "16px", color: "#64748B", cursor: "pointer" }}>
            <Filter size={20} />
          </button>
          <button style={{ padding: "14px", background: "white", border: "1px solid #E2E8F0", borderRadius: "16px", color: "#64748B", cursor: "pointer" }}>
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "flex", gap: "24px" }}>
        <div style={{ background: "white", padding: "20px 32px", borderRadius: "24px", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#0066FF" }} />
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B" }}>{filteredOrders.length} Tổng đơn hàng</span>
        </div>
        <div style={{ background: "white", padding: "20px 32px", borderRadius: "24px", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#F97316" }} />
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B" }}>{statsByStatus.pending} Chờ xử lý</span>
        </div>
        <div style={{ background: "white", padding: "20px 32px", borderRadius: "24px", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#22C55E" }} />
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B" }}>{statsByStatus.paid} Đã thanh toán</span>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ background: "white", padding: "32px", borderRadius: "32px", border: "1px solid #F1F5F9", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
        <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#1E293B", marginBottom: "32px" }}>
          {selectedDate ? `Danh sách đơn hàng ngày ${selectedDate}` : "Tất cả đơn hàng"}
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8", fontSize: "16px", fontWeight: 600 }}>
              Đang tải dữ liệu...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", background: "#F8FAFC", borderRadius: "24px", border: "2px dashed #E2E8F0" }}>
              <ShoppingBag size={48} color="#CBD5E1" style={{ marginBottom: "16px" }} />
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#64748B" }}>Không có đơn hàng nào trong ngày này</p>
              <p style={{ fontSize: "14px", color: "#94A3B8", marginTop: "4px" }}>Vui lòng chọn ngày khác hoặc thay đổi bộ lọc</p>
            </div>
          ) : filteredOrders.map((order) => (
            <div key={order.code} style={{ 
              padding: "24px", 
              background: "white", 
              border: "1px solid #F1F5F9", 
              borderRadius: "24px", 
              display: "grid", 
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto", 
              alignItems: "center", 
              gap: "24px",
              transition: "all 0.2s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0066FF"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#F1F5F9"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#F1F5F9", color: "#0066FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>{viText(order.jobTitle || "Dịch vụ tận nơi")}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>Mã: {order.code}</span>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#CBD5E1" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: "#64748B", whiteSpace: "nowrap" }}>
                      <User size={14} />
                      Khách: {(order as any).employerName || order.employerCode}
                    </div>
                    {order.workerCode && (
                      <>
                        <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#CBD5E1" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: "#0066FF", whiteSpace: "nowrap" }}>
                          <User size={14} />
                          Thợ: {(order as any).workerName || order.workerCode}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: "4px" }}>Thanh toán</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={16} color="#0066FF" />
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#1E293B" }}>{order.totalAmount.toLocaleString()}đ</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: "4px" }}>Trạng thái</div>
                <span style={{ 
                  padding: "6px 12px", 
                  borderRadius: "8px", 
                  fontSize: "11px", 
                  fontWeight: 800, 
                  background: order.status === 'completed' ? "#F0FDF4" : (order.status === 'pending' || order.status === 'finding_worker' || order.status === 'PENDING_ASSIGN') ? "#FFF7ED" : "#F1F5F9", 
                  color: order.status === 'completed' ? "#22C55E" : (order.status === 'pending' || order.status === 'finding_worker' || order.status === 'PENDING_ASSIGN') ? "#F97316" : "#64748B",
                  textTransform: "uppercase"
                }}>
                  {order.status === 'finding_worker' ? 'Đang tìm thợ' : order.status === 'PENDING_ASSIGN' ? 'Chờ gán thợ' : order.status === 'confirmed' ? 'Đã xác nhận' : order.status === 'completed' ? 'Hoàn thành' : order.status}
                </span>
              </div>

              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: "4px" }}>Thanh toán</div>
                <span style={{ 
                  padding: "6px 12px", 
                  borderRadius: "8px", 
                  fontSize: "11px", 
                  fontWeight: 800, 
                  background: order.paymentStatus === 'paid' ? "#F0FDF4" : "#FEF2F2", 
                  color: order.paymentStatus === 'paid' ? "#22C55E" : "#EF4444",
                  textTransform: "uppercase"
                }}>
                  {order.paymentStatus === 'paid' ? 'ĐÃ TRẢ' : 'CHƯA TRẢ'}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {order.status === 'payment_review' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Xác nhận đã nhận được tiền cho đơn hàng này?")) {
                        platformApi.approveEscrowPayment(order.code)
                          .then(() => {
                            alert("Đã duyệt thanh toán thành công!");
                            window.location.reload();
                          })
                          .catch(err => alert("Lỗi: " + err.message));
                      }
                    }}
                    style={{ 
                      padding: "8px 16px", 
                      background: "#0066FF", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "10px", 
                      fontSize: "13px", 
                      fontWeight: 700, 
                      cursor: "pointer" 
                    }}
                  >
                    Duyệt tiền
                  </button>
                )}

                {order.status === 'PENDING_ASSIGN' && (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }} onClick={e => e.stopPropagation()}>
                    <select 
                      value={assigning[order.code] || ""}
                      onChange={(e) => setAssigning({ ...assigning, [order.code]: e.target.value })}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      style={{ 
                        padding: "8px", 
                        borderRadius: "10px", 
                        border: "1px solid #E2E8F0",
                        fontSize: "13px",
                        outline: "none",
                        minWidth: "150px"
                      }}
                    >
                      <option value="">Chọn thợ...</option>
                      {availableTechnicians.map(t => (
                        <option key={t.code} value={t.code}>{t.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleAssign(order.code)}
                      style={{ 
                        padding: "8px 16px", 
                        background: "#0066FF", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "10px", 
                        fontSize: "13px", 
                        fontWeight: 700, 
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      Giao việc
                    </button>
                  </div>
                )}

                <button style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", padding: "8px" }}>
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Placeholder */}
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center", gap: "8px" }}>
          <button style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid #E2E8F0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={20} color="#94A3B8" />
          </button>
          <button style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#0066FF", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}>1</button>
          <button style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid #E2E8F0", background: "white", color: "#64748B", fontWeight: 700, cursor: "pointer" }}>2</button>
          <button style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid #E2E8F0", background: "white", color: "#64748B", fontWeight: 700, cursor: "pointer" }}>3</button>
          <button style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid #E2E8F0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronRight size={20} color="#94A3B8" />
          </button>
        </div>
      </div>
    </div>
  );
}