import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Plus, Trash2, DollarSign, Star, X, MapPin, Phone, Mail, Clock, User as UserIcon } from "lucide-react";
import { platformApi } from "../../api/platformApi";
import type { Order, UserProfile } from "../../types/platform";

const AUTH_STORAGE_KEY = "homeswift_user";

type User = {
  code?: string;
  role?: string;
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
};

function readStoredUser(): User {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function OrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [user] = useState<User>(readStoredUser());
  const [workerInfo, setWorkerInfo] = useState<UserProfile | null>(null);
  const [employerInfo, setEmployerInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Invoice form state
  const [invoiceItems, setInvoiceItems] = useState<Array<{ name: string; price: number }>>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (orderCode) {
      loadOrder();
    }
  }, [orderCode]);

  const loadOrder = async () => {
    if (!orderCode) return;
    try {
      const found = await platformApi.getOrderDetail(orderCode);
      if (found) {
        setOrder(found);
        if (found.invoiceItems) {
          setInvoiceItems(found.invoiceItems);
        }
        // Load worker and employer info
        if (found.workerCode) {
          try {
            const worker = await platformApi.getUserProfile(found.workerCode);
            setWorkerInfo(worker);
          } catch (e) {
            console.error("Failed to load worker info:", e);
          }
        }
        if (found.employerCode) {
          try {
            const employer = await platformApi.getUserProfile(found.employerCode);
            setEmployerInfo(employer);
          } catch (e) {
            console.error("Failed to load employer info:", e);
          }
        }
      }
    } catch (error: any) {
      setFeedback(error.message);
    }
  };

  const handleAcceptOrder = async () => {
    if (!order || !user.code) {
      setFeedback("Vui lòng đăng nhập để nhận việc!");
      return;
    }
    setLoading(true);
    setFeedback("");
    try {
      await platformApi.acceptOrder({
        orderId: order._id!,
        workerCode: user.code
      });
      setFeedback("Đã nhận việc thành công!");
      await loadOrder();
    } catch (error: any) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvoiceItem = () => {
    const price = Number(newItemPrice);
    if (newItemName.trim() && price > 0) {
      setInvoiceItems([...invoiceItems, { name: newItemName.trim(), price }]);
      setNewItemName("");
      setNewItemPrice("");
    }
  };

  const handleRemoveInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleSubmitInvoice = async () => {
    if (!order || invoiceItems.length === 0) return;
    setLoading(true);
    setFeedback("");
    try {
      const materialTotal = invoiceItems.reduce((sum, item) => sum + item.price, 0);
      await platformApi.createInvoice({
        orderId: order._id!,
        invoiceItems,
        materialTotal
      });
      setFeedback("Đã gửi hóa đơn phát sinh, chờ khách hàng duyệt!");
      await loadOrder();
    } catch (error: any) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveInvoice = async () => {
    if (!order) return;
    setLoading(true);
    setFeedback("");
    try {
      await platformApi.approveInvoice({ orderId: order._id! });
      setFeedback("Đã duyệt hóa đơn phát sinh!");
      await loadOrder();
    } catch (error: any) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!order) return;
    setLoading(true);
    setFeedback("");
    try {
      await platformApi.completeOrder(order.code);
      setFeedback("Đã xác nhận hoàn thành! Chờ khách hàng nghiệm thu.");
      await loadOrder();
    } catch (error: any) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseOrderFunds = async () => {
    if (!order) return;
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!order) return;
    setLoading(true);
    setFeedback("");
    try {
      await platformApi.reviewOrder(order.code, { rating, comment });
      setFeedback("Thanh toán thành công! Đơn hàng đã hoàn thành.");
      setShowReviewModal(false);
      setTimeout(() => navigate("/workspace"), 2000);
    } catch (error: any) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return <div className="page-stack"><p>Đang tải...</p></div>;
  }

  const materialTotal = invoiceItems.reduce((sum, item) => sum + item.price, 0);
  const isWorker = user.role === "worker";
  const isEmployer = user.role === "employer";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS": return "#22C55E";
      case "COMPLETED_PENDING_REVIEW": return "#F59E0B";
      case "COMPLETED": return "#10B981";
      case "SUCCESS": return "#10B981";
      default: return "#64748B";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "IN_PROGRESS": return "Đang thực hiện";
      case "COMPLETED_PENDING_REVIEW": return "Chờ nghiệm thu";
      case "COMPLETED": return "Đã hoàn thành";
      case "SUCCESS": return "Đã hoàn thành";
      default: return status;
    }
  };

  if (!order) {
    return <div className="page-stack"><p>Đang tải...</p></div>;
  }

  return (
    <div className="page-stack" style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Chi tiết đơn hàng #{order.code}</h1>
      
      {feedback && (
        <div style={{ 
          padding: 16, 
          borderRadius: 8, 
          background: feedback.includes("thành công") ? "#d1fae5" : feedback.includes("không đủ") ? "#fee2e2" : "#fef3c7",
          color: feedback.includes("thành công") ? "#065f46" : feedback.includes("không đủ") ? "#991b1b" : "#92400e",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          {feedback.includes("thành công") ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {feedback}
        </div>
      )}

      {/* Order Summary */}
      <div style={{ background: "white", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px solid #e5e7eb" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div>
            <h3 style={{ marginBottom: 12, color: "#64748B", fontSize: 14, fontWeight: 600 }}>Dịch vụ</h3>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{order.jobTitle || "Dịch vụ tận nơi"}</p>
            <p style={{ color: "#64748B", fontSize: 14 }}>Mã đơn: {order.code}</p>
          </div>
          <div>
            <h3 style={{ marginBottom: 12, color: "#64748B", fontSize: 14, fontWeight: 600 }}>Trạng thái</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: getStatusColor(order.status) }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: getStatusColor(order.status) }}>{getStatusText(order.status)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
          <div>
            <p style={{ color: "#64748B", fontSize: 13, marginBottom: 4 }}>Thời gian hẹn</p>
            <p style={{ fontSize: 15, fontWeight: 700 }}>{new Date(order.scheduledAt).toLocaleString('vi-VN')}</p>
          </div>
          <div>
            <p style={{ color: "#64748B", fontSize: 13, marginBottom: 4 }}>Địa chỉ</p>
            <p style={{ fontSize: 15, fontWeight: 700 }}>{order.address}</p>
          </div>
          <div>
            <p style={{ color: "#64748B", fontSize: 13, marginBottom: 4 }}>Tổng tiền</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0066FF" }}>{order.totalAmount.toLocaleString()}đ</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Employer Info */}
        {employerInfo && (
          <div style={{ background: "white", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb" }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>Thông tin khách hàng</h3>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <img src={employerInfo.avatar || "https://i.pravatar.cc/150?u=employer"} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} alt="Employer" />
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{employerInfo.name}</p>
                <p style={{ color: "#64748B", fontSize: 13 }}>Khách hàng</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 14 }}>
                <Phone size={16} /> {employerInfo.phone}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 14 }}>
                <Mail size={16} /> {employerInfo.email}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 14 }}>
                <MapPin size={16} /> {employerInfo.address}
              </div>
            </div>
          </div>
        )}

        {/* Worker Info */}
        {workerInfo && order.workerCode && (
          <div style={{ background: "white", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb" }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>Thông tin thợ</h3>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <img src={workerInfo.avatar || "https://i.pravatar.cc/150?u=worker"} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} alt="Worker" />
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{workerInfo.name}</p>
                <p style={{ color: "#64748B", fontSize: 13 }}>Thợ</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 14 }}>
                <Phone size={16} /> {workerInfo.phone}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 14 }}>
                <Mail size={16} /> {workerInfo.email}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 14 }}>
                <MapPin size={16} /> {workerInfo.address}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WORKER VIEW - Complete Order Button */}
      {isWorker && (order.status === "IN_PROGRESS" || order.status === "accepted_by_technician") && (
        <button 
          className="button primary"
          onClick={handleCompleteOrder}
          disabled={loading}
          style={{ width: "100%", padding: 16, fontSize: 16, marginBottom: 24, background: "#22C55E" }}
        >
          {loading ? "Đang xử lý..." : "Xác nhận hoàn thành công việc"}
        </button>
      )}

      {isWorker && order.status === "confirmed" && order.materialStatus !== "pending" && (
        <div style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <h2 style={{ marginBottom: 16 }}>Khai báo vật tư phát sinh</h2>
          
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Tên vật tư"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={{ flex: 2, padding: 10, borderRadius: 6, border: "1px solid #d1d5db" }}
            />
            <input
              type="number"
              placeholder="Giá tiền"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #d1d5db" }}
            />
            <button 
              className="button secondary"
              onClick={handleAddInvoiceItem}
              style={{ padding: "10px 16px" }}
            >
              <Plus size={18} />
            </button>
          </div>

          {invoiceItems.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: 8, textAlign: "left" }}>Vật tư</th>
                    <th style={{ padding: 8, textAlign: "right" }}>Giá</th>
                    <th style={{ padding: 8, width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: 8 }}>{item.name}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{item.price.toLocaleString()}đ</td>
                      <td style={{ padding: 8, textAlign: "center" }}>
                        <button 
                          onClick={() => handleRemoveInvoiceItem(index)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 12, textAlign: "right", fontSize: 18, fontWeight: 600 }}>
                Tổng: {materialTotal.toLocaleString()}đ
              </div>
            </div>
          )}

          <button 
            className="button primary"
            onClick={handleSubmitInvoice}
            disabled={loading || invoiceItems.length === 0}
            style={{ width: "100%", padding: 12 }}
          >
            {loading ? "Đang gửi..." : "Gửi hóa đơn phát sinh"}
          </button>
        </div>
      )}

      {isWorker && order.materialStatus === "pending" && (
        <div style={{ background: "#fef3c7", padding: 16, borderRadius: 8, color: "#92400e" }}>
          <AlertCircle size={20} style={{ display: "inline", marginRight: 8 }} />
          Đang chờ khách hàng duyệt hóa đơn phát sinh
        </div>
      )}

      {/* EMPLOYER VIEW */}
      {isEmployer && order.materialStatus === "pending" && (
        <div style={{ background: "#fef3c7", padding: 20, borderRadius: 12, border: "2px solid #fbbf24", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <AlertCircle size={24} style={{ color: "#f59e0b" }} />
            <h3 style={{ margin: 0, color: "#92400e" }}>Thợ yêu cầu phát sinh chi phí vật tư</h3>
          </div>
          <p style={{ color: "#92400e", marginBottom: 16 }}>
            Trị giá: <strong>{(order.materialTotal ?? 0).toLocaleString()}đ</strong>
          </p>
          
          <table style={{ width: "100%", marginBottom: 16, background: "white", borderRadius: 8, overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Vật tư</th>
                <th style={{ padding: 12, textAlign: "right" }}>Giá</th>
              </tr>
            </thead>
            <tbody>
              {order.invoiceItems?.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: 12 }}>{item.name}</td>
                  <td style={{ padding: 12, textAlign: "right" }}>{item.price.toLocaleString()}đ</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button 
            className="button primary"
            onClick={handleApproveInvoice}
            disabled={loading}
            style={{ width: "100%", padding: 14, fontSize: 16 }}
          >
            {loading ? "Đang xử lý..." : "Đồng ý và Sửa chữa"}
          </button>
        </div>
      )}

      {/* EMPLOYER VIEW - Review and Release Button */}
      {isEmployer && (order.status === "COMPLETED_PENDING_REVIEW" || order.status === "COMPLETED_BY_TECHNICIAN") && !order.isReleased && (
        <button 
          className="button primary"
          onClick={handleReleaseOrderFunds}
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 18, 
            fontSize: 18, 
            background: "#F59E0B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 24
          }}
        >
          <Star size={22} />
          {loading ? "Đang xử lý..." : "Xác nhận nghiệm thu & Đánh giá"}
        </button>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: 24,
            maxWidth: 500,
            width: "90%",
            boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>Đánh giá dịch vụ</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24 }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Đánh giá sao</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 32,
                      color: star <= rating ? "#fbbf24" : "#d1d5db"
                    }}
                  >
                    <Star size={32} fill={star <= rating ? "#fbbf24" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Nhận xét</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  fontFamily: "inherit",
                  fontSize: 14,
                  minHeight: 100,
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowReviewModal(false)}
                className="button secondary"
                style={{ flex: 1, padding: 12 }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReview}
                className="button primary"
                disabled={loading}
                style={{ flex: 1, padding: 12 }}
              >
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}