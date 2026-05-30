import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Plus, Trash2, DollarSign } from "lucide-react";
import { platformApi } from "../../api/platformApi";
import type { Order } from "../../types/platform";

const AUTH_STORAGE_KEY = "homeswift_user";

type User = {
  code?: string;
  role?: string;
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
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Invoice form state
  const [invoiceItems, setInvoiceItems] = useState<Array<{ name: string; price: number }>>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

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
        candidateCode: user.code
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

  const handleCompleteAndPay = async () => {
    if (!order) return;
    if (!confirm("Xác nhận nghiệm thu và thanh toán đơn hàng này?")) return;
    setLoading(true);
    setFeedback("");
    try {
      await platformApi.completeAndPayOrder({ orderId: order._id! });
      setFeedback("Thanh toán thành công! Đơn hàng đã hoàn thành.");
      setTimeout(() => navigate("/workspace"), 2000);
    } catch (error: any) {
      if (error.message && error.message.includes("Insufficient")) {
        setFeedback("Số dư ví không đủ. Vui lòng nạp thêm tiền vào ví!");
      } else {
        setFeedback(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return <div className="page-stack"><p>Đang tải...</p></div>;
  }

  const materialTotal = invoiceItems.reduce((sum, item) => sum + item.price, 0);
  const isCandidate = user.role === "candidate";
  const isEmployer = user.role === "employer";

  return (
    <div className="page-stack" style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
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

      <div style={{ background: "#f9fafb", padding: 20, borderRadius: 12, marginBottom: 24 }}>
        <p><strong>Trạng thái:</strong> {order.status}</p>
        <p><strong>Tổng tiền dịch vụ:</strong> {order.totalAmount.toLocaleString()}đ</p>
        {(order.materialTotal ?? 0) > 0 && (
          <p><strong>Phí vật tư phát sinh:</strong> {(order.materialTotal ?? 0).toLocaleString()}đ ({order.materialStatus})</p>
        )}
      </div>

      {/* CANDIDATE VIEW */}
      {isCandidate && order.status === "pending" && (
        <button 
          className="button primary" 
          onClick={handleAcceptOrder}
          disabled={loading}
          style={{ width: "100%", padding: 16, fontSize: 16 }}
        >
          {loading ? "Đang xử lý..." : "Nhận việc này"}
        </button>
      )}

      {isCandidate && order.status === "confirmed" && order.materialStatus !== "pending" && (
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

      {isCandidate && order.materialStatus === "pending" && (
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

      {isEmployer && (order.status === "in_service" || order.materialStatus === "confirmed") && (
        <button 
          className="button primary"
          onClick={handleCompleteAndPay}
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 18, 
            fontSize: 18, 
            background: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          <DollarSign size={22} />
          {loading ? "Đang xử lý..." : "Xác nhận nghiệm thu & Thanh toán"}
        </button>
      )}
    </div>
  );
}