import React, { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Wallet, User, HelpCircle, ShieldCheck } from "lucide-react";
import { platformApi } from "../../api/platformApi";
import type { Application, Order, UserHome, UserProfile, WalletTransaction, MaterialList } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

const AUTH_STORAGE_KEY = "homeswift_user";

type StoredUser = {
  code?: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  city?: string;
  address?: string;
  savedAddresses?: string[];
  walletBalance?: number;
  avatar: string;
  role?: string;
};

type ProfileSection = "overview" | "orders" | "wallet" | "personal" | "support";
type OrderTab = "active" | "completed" | "cancelled";
type OrderView = "list" | "tracking";
type WalletModalMode = "deposit" | "withdraw" | null;

type ProfileOrder = {
  code: string;
  title: string;
  service: string;
  customer: string;
  technician: string;
  technicianAvatar: string;
  date: string;
  statusLabel: string;
  progress: number;
  total: number;
  tab: OrderTab;
  icon: "ac" | "fridge" | "cleaning" | "laundry";
};

const profileMenu: Array<{ id: ProfileSection; label: string; icon: React.ReactNode }> = [
  { id: "overview", label: "Tổng quan", icon: <LayoutDashboard size={20} /> },
  { id: "orders", label: "Đơn hàng của tôi", icon: <ShoppingBag size={20} /> },
  { id: "wallet", label: "Ví & Ưu đãi", icon: <Wallet size={20} /> },
  { id: "personal", label: "Thông tin cá nhân", icon: <User size={20} /> },
  { id: "support", label: "Hỗ trợ", icon: <HelpCircle size={20} /> }
];

const orderTabs: Array<{ id: OrderTab; label: string }> = [
  { id: "active", label: "Đang diễn ra" },
  { id: "completed", label: "Đã hoàn thành" },
  { id: "cancelled", label: "Đã hủy" }
];

function readStoredUser() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}
function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? new Intl.NumberFormat("vi-VN").format(Number(digits)) : "";
}


function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatDateTime(value?: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getOrderTab(status: string): OrderTab {
  if (["done", "completed"].includes(status)) {
    return "completed";
  }

  if (["cancelled", "canceled", "failed"].includes(status)) {
    return "cancelled";
  }

  return "active";
}

function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    payment_pending: "Chờ thanh toán",
    payment_review: "Chờ admin duyệt tiền",
    finding_worker: "Đang tìm thợ",
    pending: "Chờ thợ đến",
    confirmed: "Đang thực hiện",
    in_service: "Đang thực hiện",
    done: "Hoàn thành",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    canceled: "Đã hủy",
    failed: "Đã hủy"
  };

  return labels[status] ?? "Đang thực hiện";
}

function getRoleLabel(role?: string) {
  const labels: Record<string, string> = {
    admin: "Admin",
    candidate: "Thợ dịch vụ",
    employer: "Khách hàng"
  };
  return labels[role || ""] ?? "Khách hàng";
}

function buildOrders(apiOrders: Order[], user: StoredUser): (ProfileOrder & { rawOrder?: Order })[] {
  const iconMap: ("ac" | "fridge" | "cleaning" | "laundry")[] = ["ac", "fridge", "cleaning", "laundry"];

  return apiOrders.map((order, index) => {
    const tab = getOrderTab(order.status);

    return {
      code: order.code,
      title: viText(order.jobTitle) || order.jobCode,
      service: viText(order.jobTitle) || order.jobCode,
      customer: (order as any).employerName || (user.role === "employer" ? user.name : "Khách hàng"),
      technician: (order as any).candidateName || (user.role === "candidate" ? user.name : "Chưa phân công"),
      technicianAvatar: (order as any).candidateAvatar || "",
      date: formatDate(order.scheduledAt),
      statusLabel: getOrderStatusLabel(order.status),
      progress: tab === "completed" ? 100 : tab === "cancelled" ? 0 : 75,
      total: order.totalAmount || 0,
      tab,
      icon: iconMap[index % 4],
      rawOrder: order
    };
  });
}

export default function UserWorkspacePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [home, setHome] = useState<UserHome | null>(null);
  const [user, setUser] = useState<StoredUser | null>(() => readStoredUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<ProfileSection>("overview");
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>("active");
  const [orderView, setOrderView] = useState<OrderView>("list");
  const [selectedOrderCode, setSelectedOrderCode] = useState<string | null>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [withdrawBankName, setWithdrawBankName] = useState("");
  const [withdrawBankAccount, setWithdrawBankAccount] = useState("");
  const [withdrawAccountHolder, setWithdrawAccountHolder] = useState("");
  const [walletFeedback, setWalletFeedback] = useState("");
  const [walletModal, setWalletModal] = useState<WalletModalMode>(null);

  // New states for Wallet, Materials, Reviews
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [currentMaterialList, setCurrentMaterialList] = useState<MaterialList | null>(null);
  const [newMaterialItem, setNewMaterialItem] = useState({ name: "", quantity: 1, unitPrice: 0 });
  const [draftMaterials, setDraftMaterials] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const navigate = useNavigate();
  const userCode = user?.code ?? "";

  useEffect(() => {
    if (!userCode) {
      navigate("/login");
      return;
    }

    platformApi.getUserApplications(userCode).then(setApplications);
    platformApi.getUserOrders(userCode).then(setOrders);
    platformApi.getUserHome().then(setHome);
    platformApi.getUserProfile(userCode).then((data) => {
      setProfile(data);
      setUser((current) => ({ ...(current ?? {}), ...data }));
    });
  }, [navigate, userCode]);

  useEffect(() => {
    const syncUser = () => setUser(readStoredUser());
    window.addEventListener("homeswift-auth", syncUser);
    return () => window.removeEventListener("homeswift-auth", syncUser);
  }, []);

  useEffect(() => {
    if (activeSection === "wallet" && userCode) {
      platformApi.getWalletHistory(userCode).then(setTransactions).catch(console.error);
    }
  }, [activeSection, userCode]);

  useEffect(() => {
    if (orderView === "tracking" && selectedOrderCode) {
      platformApi.getMaterialList(selectedOrderCode).then(res => {
        if (res && res.length > 0) {
          setCurrentMaterialList(res[0]);
        } else {
          setCurrentMaterialList(null);
        }
      }).catch(console.error);
    }
  }, [orderView, selectedOrderCode]);

  const profileOrders = useMemo(() => (user ? buildOrders(orders, user) : []), [orders, user]);
  const activeOrder = profileOrders.find((order) => order.tab === "active") ?? profileOrders[0];
  const visibleOrders = profileOrders.filter((order) => order.tab === activeOrderTab);
  const selectedOrder = profileOrders.find((order) => order.code === selectedOrderCode) ?? activeOrder;
  const recentApplications = applications.slice(0, 2);
  const suggested = home?.categories.slice(0, 4) ?? [];
  const walletDepositTotal = transactions.filter((tx) => ["deposit", "earning"].includes(tx.type)).reduce((sum, tx) => sum + tx.amount, 0);
  const walletSpendTotal = transactions.filter((tx) => ["withdraw", "payment", "commission"].includes(tx.type)).reduce((sum, tx) => sum + tx.amount, 0);

  if (!user) {
    return null;
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event("homeswift-auth"));
    navigate("/");
  };

  const openTracking = (order: ProfileOrder) => {
    setSelectedOrderCode(order.code);
    setOrderView("tracking");
  };

  const submitWalletTransaction = async (type: "deposit" | "withdraw") => {
    const amount = Number(walletAmount.replace(/\D/g, ""));
    setWalletFeedback("");

    if (!amount || amount < 10000) {
      setWalletFeedback("Số tiền tối thiểu là 10.000đ.");
      return;
    }

    try {
      const nextProfile = await platformApi.createWalletTransaction({
        userCode,
        type,
        amount,
        bankName: withdrawBankName,
        bankAccount: withdrawBankAccount,
        accountHolder: withdrawAccountHolder
      });
      setProfile(nextProfile);
      setUser((current) => ({ ...(current ?? {}), ...nextProfile }));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...readStoredUser(), ...nextProfile }));
      window.dispatchEvent(new Event("homeswift-auth"));
      setWalletAmount("");
      setWithdrawBankName("");
      setWithdrawBankAccount("");
      setWithdrawAccountHolder("");
      setWalletModal(null);
      setWalletFeedback(type === "deposit" ? "Nạp tiền thành công." : "Đã gửi yêu cầu rút tiền, admin sẽ duyệt sau khi chuyển khoản.");
    } catch (reason) {
      setWalletFeedback((reason as Error).message);
    }
  };

  const confirmOrderCompleted = async (order: ProfileOrder) => {
    const orderCode = order.code.replace(/^HS-/, "ORD-");
    try {
      await platformApi.completeUserOrder(orderCode);
      setOrders(await platformApi.getUserOrders(userCode));
    } catch (reason) {
      setWalletFeedback((reason as Error).message);
    }
  };

  const cancelOrder = async (order: ProfileOrder) => {
    const orderCode = order.code.replace(/^HS-/, "ORD-");
    try {
      await platformApi.cancelUserOrder(orderCode);
      setOrders(await platformApi.getUserOrders(userCode));
      setOrderView("list");
    } catch (reason) {
      setWalletFeedback((reason as Error).message);
    }
  };

  const workerFinishService = async (order: ProfileOrder) => {
    const orderCode = order.code.replace(/^HS-/, "ORD-");
    try {
      await platformApi.requestOrderCompletion(orderCode);
      setOrders(await platformApi.getUserOrders(userCode));
    } catch (reason) {
      setWalletFeedback((reason as Error).message);
    }
  };

  const submitReview = async () => {
    if (!selectedOrder?.rawOrder) return;
    try {
      await platformApi.createReview({
        orderCode: selectedOrder.rawOrder.code,
        employerCode: user.code ?? "",
        rating: reviewRating,
        comment: reviewComment
      });
      alert("Cảm ơn bạn đã đánh giá!");
      const updatedOrders = await platformApi.getUserOrders(userCode);
      setOrders(updatedOrders);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addMaterialDraft = () => {
    if (newMaterialItem.name && newMaterialItem.quantity > 0 && newMaterialItem.unitPrice > 0) {
      setDraftMaterials([...draftMaterials, { ...newMaterialItem }]);
      setNewMaterialItem({ name: "", quantity: 1, unitPrice: 0 });
    }
  };

  const submitMaterialList = async () => {
    if (!selectedOrder?.rawOrder || draftMaterials.length === 0) return;
    try {
      const res = await platformApi.createMaterialList({
        orderCode: selectedOrder.rawOrder.code,
        workerCode: user.code ?? "",
        items: draftMaterials,
        note: ""
      });
      setCurrentMaterialList(res);
      setDraftMaterials([]);
      alert("Đã gửi danh sách vật tư cho khách hàng.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const replyMaterialList = async (status: "confirmed" | "rejected") => {
    if (!selectedOrder?.rawOrder) return;
    try {
      const res = await platformApi.confirmMaterialList({
        orderCode: selectedOrder.rawOrder.code,
        employerCode: user.code ?? "",
        status
      });
      setCurrentMaterialList(res);
      const updatedOrders = await platformApi.getUserOrders(userCode);
      setOrders(updatedOrders);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const renderOverview = () => (
    <>
      <h1>Chào buổi sáng, {user.name}!</h1>

      {activeOrder ? (
        <section className="current-order-card">
          <div>
            <span>Đơn hàng đang diễn ra</span>
            <h2>{activeOrder.title} - {activeOrder.statusLabel}</h2>
            <div className="progress-row">
              <span style={{ "--progress": `${activeOrder.progress}%` } as CSSProperties} />
              <strong>{activeOrder.progress}%</strong>
            </div>
            <p>Thông tin: {activeOrder.customer}</p>
            <p>Thời gian: {formatDateTime(activeOrder.rawOrder?.scheduledAt)} - Địa điểm: {activeOrder.rawOrder?.address || "Chưa có địa chỉ"}</p>
          </div>
          <article>
            <span className={`profile-service-icon service-icon service-icon-${activeOrder.icon}`} aria-hidden="true" />
            <div>
              <h3>{activeOrder.title} - {activeOrder.date}</h3>
              <p>Trạng thái: {activeOrder.statusLabel.toLowerCase()}</p>
              <div className="profile-worker">
                <img src={activeOrder.technicianAvatar} alt={activeOrder.technician} />
                <span>{activeOrder.technician}</span>
              </div>
            </div>
            <button className="button primary" type="button" onClick={() => navigate("/booking")}>Đặt lại</button>
          </article>
        </section>
      ) : (
        <section className="current-order-card" style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", gap: 16, padding: "40px 24px" }}>
          <p style={{ color: "#6b7280", fontSize: 16 }}>Bạn chưa có đơn hàng đang diễn ra.</p>
          <button className="button primary" type="button" onClick={() => navigate("/booking")}>Đặt dịch vụ ngay</button>
        </section>
      )}

      <section className="profile-section">
        <h2>Lịch sử dịch vụ gần đây</h2>
        <div className="history-list">
          {recentApplications.map((item, index) => (
            <article key={item.code || index} className="history-card">
              <span className={`profile-service-icon service-icon service-icon-${index % 2 ? "garden" : "fridge"}`} aria-hidden="true" />
              <div>
                <h3>{viText(item.jobTitle) || item.jobCode}</h3>
                <p>Thông tin: {viText(item.location) || "Chưa có địa điểm"}</p>
                <div className="profile-worker">
                  <img src={user.avatar} alt={user.name} />
                  <span>{user.name}</span>
                </div>
              </div>
              <div>
                <strong>{item.status}</strong>
                <p>Thời gian: {formatDate(item.appliedAt)}</p>
                <p>Giá tham khảo: <b>{viText(item.salaryLabel) || "Chưa có"}</b></p>
              </div>
              <button className="button primary" type="button" onClick={() => navigate(`/user/jobs?job=${item.jobCode}`)}>Xem dịch vụ</button>
            </article>
          ))}
          {recentApplications.length === 0 ? <p style={{ color: "#6b7280" }}>Chưa có lịch sử ứng tuyển/dịch vụ gần đây.</p> : null}
        </div>
      </section>

      <section className="profile-section profile-bottom-grid">
        <div>
          <h2>Dịch vụ gợi ý cho bạn</h2>
          <div className="profile-suggestions">
            {suggested.map((category, index) => (
              <article key={category.code}>
                <span className={`profile-service-icon service-icon service-icon-${index % 2 ? "pest" : "sofa"}`} aria-hidden="true" />
                <div>
                  <h3>{viText(category.name)}</h3>
                  <p>{viText(category.serviceType)} của bạn.</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <article className="loyalty-card">
          <div>
            <h2>Chương trình khách hàng thân thiết</h2>
            <p>Dữ liệu điểm thưởng sẽ hiển thị khi tài khoản có giao dịch tích điểm.</p>
            <strong>{formatCurrency(profile?.walletBalance ?? user.walletBalance ?? 0)}</strong>
            <p>Số dư ví hiện tại</p>
          </div>
          <span>★</span>
        </article>
      </section>
    </>
  );

  const renderTracking = () => {
    if (!selectedOrder) return null;
    const currentStep = selectedOrder.tab === "completed" ? 4 : selectedOrder.tab === "cancelled" ? 1 : 2;
    const steps = ["Đang tìm thợ", "Đã xác nhận", "Đang đến", "Đang thực hiện", "Hoàn thành"];

    return (
      <section className="service-tracking-page">
        <button className="tracking-back" type="button" onClick={() => setOrderView("list")}>
          ← Quay lại đơn hàng
        </button>
        <h1>Theo dõi trạng thái dịch vụ</h1>

        <div className="service-stepper" aria-label="Tiến độ dịch vụ">
          {steps.map((step, index) => {
            const done = index < currentStep;
            const active = index === currentStep;

            return (
              <div key={step} className={`service-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
                <span>{done ? "✓" : ""}</span>
                <p>{step}</p>
              </div>
            );
          })}
        </div>

        <div className="tracking-content">
          <article className="technician-card">
            <h2>Kỹ thuật viên của bạn</h2>
            {selectedOrder.technicianAvatar ? <img src={selectedOrder.technicianAvatar} alt={selectedOrder.technician} /> : null}
            <strong>{selectedOrder.technician}</strong>
            <p>{selectedOrder.rawOrder?.candidateCode === "UNASSIGNED" ? "Chưa có thợ nhận đơn" : "Thông tin thợ từ hồ sơ hệ thống"}</p>
            <div>
              <button className="button call-button" type="button" disabled>Gọi</button>
              <button className="button message-button" type="button" disabled>Nhắn tin</button>
            </div>
          </article>

          <article className="tracking-info-card">
            <p><b>▣</b> {formatDateTime(selectedOrder.rawOrder?.scheduledAt)}</p>
            <p><b>●</b> {selectedOrder.rawOrder?.address || "Chưa có địa chỉ"}</p>
            {user.role === "employer" && selectedOrder.tab === "active" ? (
              <button type="button" onClick={() => cancelOrder(selectedOrder)}>Hủy dịch vụ</button>
            ) : null}
          </article>

          <article className="tracking-summary-card" style={{ gridColumn: "1 / -1" }}>
            <h2>{selectedOrder.title}</h2>
            <p>Order #{selectedOrder.code}</p>
            <p>Trạng thái: <b>{selectedOrder.statusLabel}</b></p>
            <p>Tổng dịch vụ: <b>{formatCurrency(selectedOrder.total)}</b></p>
            {selectedOrder.rawOrder?.materialTotal ? (
              <p>Phí vật tư phát sinh: <b>{formatCurrency(selectedOrder.rawOrder.materialTotal)}</b>
              ({selectedOrder.rawOrder.materialStatus === 'confirmed' ? 'Đã duyệt' : selectedOrder.rawOrder.materialStatus === 'pending' ? 'Chờ duyệt' : 'Từ chối'})</p>
            ) : null}
            {user.role === "candidate" && selectedOrder.tab === "active" ? (
              <button className="button primary" type="button" onClick={() => workerFinishService(selectedOrder)}>
                Hoàn thành dịch vụ
              </button>
            ) : null}
            {user.role === "employer" && selectedOrder.rawOrder?.status === "in_service" ? (
              <button className="button primary" type="button" onClick={() => confirmOrderCompleted(selectedOrder)}>
                Xác nhận hoàn thành & đánh giá
              </button>
            ) : null}
          </article>

          {/* Review Form - Show for Employer when Completed */}
          {selectedOrder.tab === "completed" && user.role === "employer" && !selectedOrder.rawOrder?.isReviewed && (
            <article className="tracking-summary-card" style={{ gridColumn: "1 / -1" }}>
              <h2>Đánh giá dịch vụ</h2>
              <div style={{ margin: "10px 0" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)}
                          style={{ fontSize: 24, color: star <= reviewRating ? "#f4c430" : "#ccc", background: "none", border: "none", cursor: "pointer" }}>★</button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Nhận xét của bạn..."
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 10 }}
              />
              <button className="button primary" type="button" onClick={submitReview}>Gửi đánh giá</button>
            </article>
          )}

          {/* Material List Section */}
          {(user.role === "candidate" || currentMaterialList) && (
            <article className="tracking-summary-card" style={{ gridColumn: "1 / -1" }}>
              <h2>Danh sách vật tư phát sinh</h2>

              {currentMaterialList ? (
                <div>
                  <table style={{ width: "100%", textAlign: "left", marginBottom: 15, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <th style={{ padding: 8 }}>Vật tư</th>
                        <th style={{ padding: 8 }}>SL</th>
                        <th style={{ padding: 8 }}>Đơn giá</th>
                        <th style={{ padding: 8 }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMaterialList.items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: 8 }}>{item.name}</td>
                          <td style={{ padding: 8 }}>{item.quantity}</td>
                          <td style={{ padding: 8 }}>{formatCurrency(item.unitPrice)}</td>
                          <td style={{ padding: 8 }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ textAlign: "right", fontSize: 18 }}>Tổng cộng: <b>{formatCurrency(currentMaterialList.totalAmount)}</b></p>

                  {currentMaterialList.status === "pending" && user.role === "employer" && (
                    <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                      <button className="button primary" onClick={() => replyMaterialList("confirmed")}>Đồng ý mua</button>
                      <button className="button" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fca5a5" }} onClick={() => replyMaterialList("rejected")}>Từ chối</button>
                    </div>
                  )}
                  {currentMaterialList.status !== "pending" && (
                    <p style={{ marginTop: 10, color: currentMaterialList.status === "confirmed" ? "green" : "red" }}>
                      Trạng thái: <b>{currentMaterialList.status === "confirmed" ? "Đã đồng ý mua" : "Đã từ chối"}</b>
                    </p>
                  )}
                </div>
              ) : (
                user.role === "candidate" && selectedOrder.tab === "active" && (
                  <div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <input placeholder="Tên vật tư" value={newMaterialItem.name} onChange={e => setNewMaterialItem({...newMaterialItem, name: e.target.value})} style={{ flex: 2, padding: 8, borderRadius: 6, border: "1px solid #ddd" }} />
                      <input type="number" placeholder="Số lượng" value={newMaterialItem.quantity} onChange={e => setNewMaterialItem({...newMaterialItem, quantity: Number(e.target.value)})} style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ddd" }} />
                      <input type="number" placeholder="Đơn giá" value={newMaterialItem.unitPrice || ""} onChange={e => setNewMaterialItem({...newMaterialItem, unitPrice: Number(e.target.value)})} style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ddd" }} />
                      <button className="button secondary" onClick={addMaterialDraft}>Thêm</button>
                    </div>

                    {draftMaterials.length > 0 && (
                      <div style={{ marginTop: 15 }}>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                          {draftMaterials.map((item, i) => (
                            <li key={i} style={{ padding: "8px 0", borderBottom: "1px dashed #ddd" }}>
                              {item.name} - SL: {item.quantity} x {formatCurrency(item.unitPrice)} = <b>{formatCurrency(item.quantity * item.unitPrice)}</b>
                            </li>
                          ))}
                        </ul>
                        <button className="button primary" style={{ marginTop: 15 }} onClick={submitMaterialList}>Gửi cho khách hàng xác nhận</button>
                      </div>
                    )}
                  </div>
                )
              )}
            </article>
          )}

        </div>
      </section>
    );
  };

  const renderOrders = () => (
    <section className="profile-orders-page">
      {orderView === "tracking" ? renderTracking() : (
        <>
          <h1>Đơn hàng của tôi</h1>
          <div className="order-tabs" role="tablist" aria-label="Trạng thái đơn hàng">
            {orderTabs.map((tab) => (
              <button
                key={tab.id}
                className={activeOrderTab === tab.id ? "active" : ""}
                type="button"
                role="tab"
                aria-selected={activeOrderTab === tab.id}
                onClick={() => {
                  setActiveOrderTab(tab.id);
                  setOrderView("list");
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {visibleOrders.length === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "60px 24px",
              color: "#6b7280"
            }}>
              <span style={{ fontSize: 48 }}>📋</span>
              <p style={{ fontSize: 16, margin: 0 }}>Bạn chưa có đơn hàng nào trong trạng thái này.</p>
              <button
                className="button primary"
                type="button"
                onClick={() => navigate("/")}
              >
                Đặt dịch vụ ngay
              </button>
            </div>
          ) : (
            <div className="profile-order-list">
              {visibleOrders.map((order, index) => (
                <article key={`${order.code}-${index}`} className={`profile-order-card order-${order.tab}`}>
                  <div className="order-card-main">
                    <span className={`profile-service-icon service-icon service-icon-${order.icon}`} aria-hidden="true" />
                    <div>
                      <h2>{order.title}</h2>
                      <p>Order #{order.code}</p>
                    </div>
                  </div>

                  <p className="order-card-time">Thời gian: <b>{formatDateTime(order.rawOrder?.scheduledAt)}</b></p>

                  <div className="order-card-detail">
                    <p>Loại dịch vụ: <b>{order.service}</b></p>
                    <p>Thông tin: <b>{order.customer}</b></p>
                  </div>

                  <div className="order-card-worker">
                    <p>Kỹ thuật viên:</p>
                    <div className="profile-worker">
                      {order.technicianAvatar ? <img src={order.technicianAvatar} alt={order.technician} /> : null}
                      <span>{order.technician}</span>
                    </div>
                  </div>

                  <div className="order-card-status">
                    <p>Trạng thái: <b>{order.statusLabel}</b></p>
                    <div className="progress-row order-progress">
                      <span style={{ "--progress": `${order.progress}%` } as CSSProperties} />
                      <strong>{order.progress}%</strong>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <p>Tổng số tiền: <b>{formatCurrency(order.total)}</b></p>
                    <div>
                      <button className="button order-outline" type="button" onClick={() => openTracking(order)}>Xem chi tiết</button>
                      {order.tab === "active" && user.role === "candidate" ? (
                        <button className="button order-outline" type="button" onClick={() => workerFinishService(order)}>
                          Hoàn thành dịch vụ
                        </button>
                      ) : null}
                      {order.tab === "active" && user.role === "employer" ? (
                        <button className="button order-outline" type="button" onClick={() => cancelOrder(order)}>
                          Hủy dịch vụ
                        </button>
                      ) : null}
                      <button className="button primary" type="button" onClick={() => navigate("/booking")}>Đặt lại</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );

  const renderWallet = () => (
    <section className="profile-simple-page">
      <h1>Ví của tôi & Ưu đãi thành viên</h1>
      <div className="wallet-grid">
        <article className="wallet-balance-card" style={{ background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)", color: "white", padding: "24px", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ opacity: 0.9, fontSize: "16px" }}>Ví HomeSwift</span>
            <Wallet size={24} />
          </div>
          <strong style={{ fontSize: "36px", display: "block", margin: "12px 0" }}>{formatCurrency(profile?.walletBalance ?? user.walletBalance ?? 0)}</strong>
          <p style={{ fontSize: "14px", opacity: 0.8, marginBottom: "20px" }}>Số dư khả dụng để thanh toán dịch vụ</p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="button" style={{ background: "white", color: "#1e40af", flex: 1 }} onClick={() => setWalletModal("deposit")}>Nạp tiền</button>
            <button className="button" style={{ background: "rgba(255,255,255,0.2)", color: "white", flex: 1 }} onClick={() => setWalletModal("withdraw")}>Rút tiền</button>
          </div>
          {walletFeedback ? <p style={{ marginTop: 10, fontSize: 13 }}>{walletFeedback}</p> : null}
        </article>

        <article className="loyalty-card" style={{ minHeight: "auto", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ opacity: 0.9, fontSize: "16px" }}>Tổng quan giao dịch</span>
            <span style={{ fontSize: 24 }}>★</span>
          </div>
          <strong style={{ fontSize: "26px", display: "block", margin: "12px 0" }}>{transactions.length} giao dịch</strong>
          <p style={{ fontSize: "14px", opacity: 0.8 }}>Tiền vào: <b>{formatCurrency(walletDepositTotal)}</b></p>
          <p style={{ fontSize: "14px", opacity: 0.8 }}>Tiền ra: <b>{formatCurrency(walletSpendTotal)}</b></p>
        </article>
      </div>

      {walletModal ? (
        <div className="otp-modal-backdrop" role="dialog" aria-modal="true">
          <form className="otp-modal" onSubmit={(event) => {
            event.preventDefault();
            submitWalletTransaction(walletModal);
          }}>
            <button
              type="button"
              aria-label="Đóng"
              onClick={() => setWalletModal(null)}
              style={{ marginLeft: "auto", border: 0, background: "transparent", fontSize: 22, cursor: "pointer" }}
            >
              ×
            </button>
            <h2>{walletModal === "deposit" ? "Nạp tiền vào ví" : "Rút tiền về ngân hàng"}</h2>
            <label>
              Số tiền
              <input
                value={walletAmount}
                onChange={(event) => setWalletAmount(formatMoneyInput(event.target.value))}
                placeholder="100.000"
                inputMode="numeric"
              />
            </label>
            {walletModal === "withdraw" ? (
              <>
                <label>
                  Tên ngân hàng
                  <input value={withdrawBankName} onChange={(event) => setWithdrawBankName(event.target.value)} placeholder="VD: Vietcombank" />
                </label>
                <label>
                  Số tài khoản
                  <input value={withdrawBankAccount} onChange={(event) => setWithdrawBankAccount(event.target.value.replace(/\D/g, ""))} placeholder="Nhập số tài khoản" inputMode="numeric" />
                </label>
                <label>
                  Chủ tài khoản
                  <input value={withdrawAccountHolder} onChange={(event) => setWithdrawAccountHolder(event.target.value)} placeholder="Tên chủ tài khoản" />
                </label>
              </>
            ) : null}
            {walletFeedback ? <p className="booking-feedback">{walletFeedback}</p> : null}
            <button className="button primary" type="submit">
              {walletModal === "deposit" ? "Xác nhận nạp tiền" : "Gửi yêu cầu rút tiền"}
            </button>
          </form>
        </div>
      ) : null}

      <div className="profile-section">
        <h2>Lịch sử giao dịch ví</h2>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <th style={{ padding: "12px 16px", fontSize: "14px", color: "#374151" }}>Loại giao dịch</th>
                <th style={{ padding: "12px 16px", fontSize: "14px", color: "#374151" }}>Ngày tháng</th>
                <th style={{ padding: "12px 16px", fontSize: "14px", color: "#374151" }}>Số tiền</th>
                <th style={{ padding: "12px 16px", fontSize: "14px", color: "#374151" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>Chưa có giao dịch nào.</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.code} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 500 }}>{tx.description}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>Mã: {tx.code}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{new Date(tx.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: ["deposit", "earning"].includes(tx.type) ? "#10b981" : "#ef4444" }}>
                      {["deposit", "earning"].includes(tx.type) ? "+" : "-"}{formatCurrency(tx.amount)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "999px", fontSize: "12px" }}>Hoàn thành</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const renderPersonal = () => (
    <section className="profile-simple-page">
      <h1>Thông tin cá nhân</h1>
      
      <div className="profile-section">
        <h2>Chỉnh sửa hồ sơ</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px", padding: "20px", border: "1px solid #e5e7eb", borderRadius: "12px" }}>
          <div style={{ position: "relative" }}>
            <img src={user.avatar} alt={user.name} style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }} />
            <button style={{ position: "absolute", bottom: 0, right: 0, background: "white", border: "1px solid #ddd", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer" }}>✎</button>
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px", color: "#6b7280" }}>
              Họ và tên
              <input value={profile?.name ?? user.name} readOnly style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px", color: "#6b7280" }}>
              Số điện thoại
              <input value={profile?.phone ?? user.phone ?? ""} readOnly style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px", color: "#6b7280" }}>
              Email
              <input value={profile?.email ?? user.email ?? ""} readOnly style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
            </label>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="button primary" style={{ height: "38px" }} disabled>Chỉnh sửa sau</button>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2>Quản lý địa chỉ</h2>
          <button style={{ color: "#1e40af", fontWeight: "bold", background: "none", border: "none", cursor: "pointer" }} disabled>+ Thêm địa chỉ mới</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {(profile?.savedAddresses ?? user.savedAddresses ?? []).map((addr, i) => (
            <div key={i} style={{ padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <strong style={{ fontSize: "16px" }}>Địa chỉ {i + 1}</strong>
                {i === 0 && <span style={{ fontSize: "12px", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "999px" }}>Mặc định</span>}
              </div>
              <p style={{ fontSize: "14px", color: "#4b5563", margin: 0 }}>{addr}</p>
              <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
                <button style={{ fontSize: "13px", color: "#1e40af", background: "none", border: "none", cursor: "pointer", padding: 0 }} disabled>Chỉnh sửa</button>
                <button style={{ fontSize: "13px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }} disabled>Xóa</button>
              </div>
            </div>
          ))}
          {(profile?.savedAddresses ?? user.savedAddresses ?? []).length === 0 ? <p style={{ color: "#6b7280" }}>Chưa có địa chỉ đã lưu.</p> : null}
        </div>
      </div>

      <div className="profile-section">
        <h2>Dữ liệu tài khoản</h2>
        <div className="profile-info-list">
          <article>
            <span>Vai trò</span>
            <strong>{getRoleLabel(profile?.role ?? user.role)}</strong>
          </article>
          <article>
            <span>Trạng thái</span>
            <strong>{profile?.status ?? user.status ?? "Chưa có"}</strong>
          </article>
          <article>
            <span>Khu vực</span>
            <strong>{profile?.city ?? user.city ?? "Chưa có"}</strong>
          </article>
          <article>
            <span>Số dư ví</span>
            <strong>{formatCurrency(profile?.walletBalance ?? user.walletBalance ?? 0)}</strong>
          </article>
        </div>
      </div>
    </section>
  );

  const renderSupport = () => (
    <section className="profile-simple-page">
      <h1>Hỗ trợ & Trợ giúp</h1>
      
      <div style={{ marginBottom: "32px" }}>
        <div style={{ position: "relative", maxWidth: "500px" }}>
          <input placeholder="Tìm kiếm câu hỏi hoặc vấn đề của bạn..." style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: "999px", border: "1px solid #d1d5db" }} />
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔍</span>
        </div>
      </div>

      <div className="profile-section">
        <h2>Các danh mục FAQ phổ biến</h2>
        <p style={{ color: "#6b7280" }}>Chưa có dữ liệu FAQ từ hệ thống.</p>
      </div>

      <div className="profile-section">
        <h2>Khu vực liên hệ trực tiếp</h2>
        <p style={{ color: "#6b7280" }}>Chưa có dữ liệu kênh liên hệ từ hệ thống.</p>
      </div>

      <div className="profile-section">
        <h2>Gửi yêu cầu hỗ trợ / khiếu nại</h2>
        <div style={{ padding: "24px", border: "1px solid #e5e7eb", borderRadius: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px" }}>
              Chủ đề
              <select style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}>
                <option>Vấn đề về thanh toán</option>
                <option>Chất lượng dịch vụ</option>
                <option>Kỹ thuật viên</option>
                <option>Khác</option>
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px" }}>
              Mã đơn hàng (nếu có)
              <select style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}>
                <option value="">Không chọn đơn hàng</option>
                {orders.map((order) => (
                  <option key={order.code} value={order.code}>{order.code} - {viText(order.jobTitle) || order.jobCode}</option>
                ))}
              </select>
            </label>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px", marginBottom: "16px" }}>
            Mô tả chi tiết
            <textarea rows={4} placeholder="Vui lòng mô tả vấn đề bạn đang gặp phải..." style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }} />
          </label>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button style={{ background: "none", border: "1px dashed #d1d5db", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>📎 Tải tệp đính kèm</button>
            <button className="button primary">Gửi yêu cầu</button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderActiveSection = () => {
    if (activeSection === "orders") {
      return renderOrders();
    }

    if (activeSection === "wallet") {
      return renderWallet();
    }

    if (activeSection === "personal") {
      return renderPersonal();
    }

    if (activeSection === "support") {
      return renderSupport();
    }

    return renderOverview();
  };

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="profile-sidebar-brand">
          <span className="brand-icon" aria-hidden="true" />
          <strong>Home<span>Swift</span></strong>
        </div>
        <nav className="profile-menu" aria-label="Hồ sơ cá nhân">
          {profileMenu.map((item) => (
            <button
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              type="button"
              onClick={() => {
                setActiveSection(item.id);
                if (item.id !== "orders") {
                  setOrderView("list");
                }
              }}
            >
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
          {user.role === "admin" && (
            <button
              type="button"
              onClick={() => navigate("/admin")}
              style={{ marginTop: 10, borderTop: "1px solid #eee", paddingTop: 20, borderRadius: 0 }}
            >
              <span><ShieldCheck size={20} /></span>Quản trị hệ thống
            </button>
          )}
        </nav>
        <button className="profile-logout" type="button" onClick={logout}>
          Đăng xuất
        </button>
      </aside>

      <main className="profile-main">
        <header className="profile-top">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="notification-button" type="button" aria-label="Thông báo">
              <span />
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
              <strong style={{ fontSize: "14px", color: "#111827" }}>{user.name}</strong>
              <span style={{ fontSize: "12px", color: "#59636f" }}>{getRoleLabel(user.role)}</span>
            </div>
          </div>
          <img src={user.avatar} alt={user.name} />
        </header>

        <section className="profile-content">
          {renderActiveSection()}
        </section>
      </main>
    </div>
  );
}
