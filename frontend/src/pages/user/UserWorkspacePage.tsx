import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { platformApi } from "../../api/platformApi";
import { DEMO_CANDIDATE_CODE } from "../../config";
import type { Application, Order, UserHome, UserProfile } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

const AUTH_STORAGE_KEY = "homeswift_user";

type StoredUser = {
  code?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  savedAddresses?: string[];
  walletBalance?: number;
  avatar: string;
};

type ProfileSection = "overview" | "orders" | "wallet" | "personal" | "support";
type OrderTab = "active" | "completed" | "cancelled";
type OrderView = "list" | "tracking";

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

const profileMenu: Array<{ id: ProfileSection; label: string; icon: string }> = [
  { id: "overview", label: "Tổng quan", icon: "▦" },
  { id: "orders", label: "Đơn hàng của tôi", icon: "▤" },
  { id: "wallet", label: "Ví & Ưu đãi", icon: "▭" },
  { id: "personal", label: "Thông tin cá nhân", icon: "♙" },
  { id: "support", label: "Hỗ trợ", icon: "?" }
];

const orderTabs: Array<{ id: OrderTab; label: string }> = [
  { id: "active", label: "Đang diễn ra" },
  { id: "completed", label: "Đã hoàn thành" },
  { id: "cancelled", label: "Đã hủy" }
];

const backupOrders: ProfileOrder[] = [
  {
    code: "HS-10234",
    title: "Vệ sinh máy lạnh",
    service: "Vệ sinh máy lạnh",
    customer: "Nguyễn Văn A",
    technician: "Nguyễn Văn A",
    technicianAvatar: "https://i.pravatar.cc/120?u=nguyenvana",
    date: "20/10/2023",
    statusLabel: "Đang thực hiện",
    progress: 75,
    total: 350000,
    tab: "active",
    icon: "ac"
  },
  {
    code: "HS-10235",
    title: "Sửa điện lạnh",
    service: "Sửa điện lạnh",
    customer: "Trần Thị B",
    technician: "Trần Thị B",
    technicianAvatar: "https://i.pravatar.cc/120?u=tranthib",
    date: "21/10/2023",
    statusLabel: "Chờ thợ đến",
    progress: 75,
    total: 500000,
    tab: "active",
    icon: "fridge"
  },
  {
    code: "HS-10192",
    title: "Dọn dẹp nhà cửa",
    service: "Dọn dẹp nhà cửa",
    customer: "Nguyễn Văn A",
    technician: "Lê Minh Khang",
    technicianAvatar: "https://i.pravatar.cc/120?u=lekhang",
    date: "08/10/2023",
    statusLabel: "Hoàn thành",
    progress: 100,
    total: 280000,
    tab: "completed",
    icon: "cleaning"
  },
  {
    code: "HS-10184",
    title: "Giặt ủi tại nhà",
    service: "Giặt ủi",
    customer: "Nguyễn Văn A",
    technician: "Phạm Hoàng Nam",
    technicianAvatar: "https://i.pravatar.cc/120?u=phamnam",
    date: "05/10/2023",
    statusLabel: "Hoàn thành",
    progress: 100,
    total: 180000,
    tab: "completed",
    icon: "laundry"
  },
  {
    code: "HS-10170",
    title: "Sửa điện lạnh",
    service: "Sửa điện lạnh",
    customer: "Nguyễn Văn A",
    technician: "Chưa phân công",
    technicianAvatar: "https://i.pravatar.cc/120?u=homeswift",
    date: "02/10/2023",
    statusLabel: "Đã hủy",
    progress: 0,
    total: 420000,
    tab: "cancelled",
    icon: "fridge"
  },
  {
    code: "HS-10164",
    title: "Vệ sinh máy lạnh",
    service: "Vệ sinh máy lạnh",
    customer: "Nguyễn Văn A",
    technician: "Chưa phân công",
    technicianAvatar: "https://i.pravatar.cc/120?u=cancelled",
    date: "29/09/2023",
    statusLabel: "Đã hủy",
    progress: 0,
    total: 350000,
    tab: "cancelled",
    icon: "ac"
  }
];

function readStoredUser() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return {
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/120?u=nguyenvana"
    };
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return {
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/120?u=nguyenvana"
    };
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function formatDate(value?: string) {
  if (!value) {
    return "20/10/2023";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
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

function buildOrders(orders: Order[], user: StoredUser): ProfileOrder[] {
  const apiOrders = orders.map((order, index) => {
    const tab = getOrderTab(order.status);

    return {
      code: order.code.replace("ORD-", "HS-"),
      title: viText(order.jobTitle) || (index % 2 ? "Sửa điện lạnh" : "Vệ sinh máy lạnh"),
      service: viText(order.jobTitle) || (index % 2 ? "Sửa điện lạnh" : "Vệ sinh máy lạnh"),
      customer: user.name,
      technician: index % 2 ? "Trần Thị B" : "Nguyễn Văn A",
      technicianAvatar: index % 2 ? "https://i.pravatar.cc/120?u=tranthib" : user.avatar,
      date: formatDate(order.scheduledAt),
      statusLabel: getOrderStatusLabel(order.status),
      progress: tab === "completed" ? 100 : tab === "cancelled" ? 0 : 75,
      total: order.totalAmount,
      tab,
      icon: index % 2 ? "fridge" : "ac"
    } satisfies ProfileOrder;
  });

  const merged: ProfileOrder[] = [...apiOrders];
  orderTabs.forEach((tab) => {
    const tabCount = merged.filter((order) => order.tab === tab.id).length;
    if (tabCount >= 2) {
      return;
    }

    merged.push(...backupOrders.filter((order) => order.tab === tab.id).slice(0, 2 - tabCount));
  });

  return merged;
}

export default function UserWorkspacePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [home, setHome] = useState<UserHome | null>(null);
  const [user, setUser] = useState<StoredUser>(() => readStoredUser());
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
  const navigate = useNavigate();
  const userCode = user.code ?? DEMO_CANDIDATE_CODE;

  useEffect(() => {
    platformApi.getUserApplications(userCode).then(setApplications);
    platformApi.getUserOrders(userCode).then(setOrders);
    platformApi.getUserHome().then(setHome);
    platformApi.getUserProfile(userCode).then((data) => {
      setProfile(data);
      setUser((current) => ({ ...current, ...data }));
    });
  }, [userCode]);

  useEffect(() => {
    const syncUser = () => setUser(readStoredUser());
    window.addEventListener("homeswift-auth", syncUser);
    return () => window.removeEventListener("homeswift-auth", syncUser);
  }, []);

  const profileOrders = useMemo(() => buildOrders(orders, user), [orders, user]);
  const activeOrder = profileOrders.find((order) => order.tab === "active") ?? profileOrders[0];
  const visibleOrders = profileOrders.filter((order) => order.tab === activeOrderTab);
  const selectedOrder = profileOrders.find((order) => order.code === selectedOrderCode) ?? activeOrder;
  const recentApplications = applications.slice(0, 2);
  const suggested = home?.categories.slice(0, 4) ?? [];

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
    const amount = Number(walletAmount);
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
      setUser((current) => ({ ...current, ...nextProfile }));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...readStoredUser(), ...nextProfile }));
      window.dispatchEvent(new Event("homeswift-auth"));
      setWalletAmount("");
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

  const renderOverview = () => (
    <>
      <h1>Chào buổi sáng, {user.name}!</h1>

      <section className="current-order-card">
        <div>
          <span>Đơn hàng đang diễn ra</span>
          <h2>{activeOrder.title} - {activeOrder.statusLabel}</h2>
          <div className="progress-row">
            <span style={{ "--progress": `${activeOrder.progress}%` } as CSSProperties} />
            <strong>{activeOrder.progress}%</strong>
          </div>
          <p>Thông tin: {activeOrder.customer}</p>
          <p>Thời gian: 09:00 - 20:00 - Địa điểm: dịch vụ tại nhà</p>
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
          <button className="button primary" type="button">Đặt lại</button>
        </article>
      </section>

      <section className="profile-section">
        <h2>Lịch sử dịch vụ gần đây</h2>
        <div className="history-list">
          {(recentApplications.length ? recentApplications : applications).slice(0, 2).map((item, index) => (
            <article key={item.code || index} className="history-card">
              <span className={`profile-service-icon service-icon service-icon-${index % 2 ? "garden" : "fridge"}`} aria-hidden="true" />
              <div>
                <h3>{viText(item.jobTitle) || "Sửa điện lạnh"} - 15/10/2023</h3>
                <p>Thông tin: dịch vụ</p>
                <div className="profile-worker">
                  <img src={user.avatar} alt={user.name} />
                  <span>{user.name}</span>
                </div>
              </div>
              <div>
                <strong>Hoàn thành</strong>
                <p>Thời gian: 09/10/2023</p>
                <p>Giá đã qua: <b>{viText(item.salaryLabel) || "350.000đ"}</b></p>
              </div>
              <button className="button primary" type="button">Đặt lại</button>
            </article>
          ))}
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
            <p>Chuyển hạng thành viên HomeSwift:</p>
            <strong>5,000 điểm</strong>
            <p>Thưởng cho khách hàng thân thiết</p>
          </div>
          <span>★</span>
        </article>
      </section>
    </>
  );

  const renderTracking = () => {
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
            <img src={selectedOrder.technicianAvatar} alt={selectedOrder.technician} />
            <strong>{selectedOrder.technician}</strong>
            <p><span>★</span> 4.8 (124 đánh giá)</p>
            <div>
              <button className="button call-button" type="button">☎ [Gọi]</button>
              <button className="button message-button" type="button">● [Nhắn tin]</button>
            </div>
          </article>

          <article className="tracking-info-card">
            <p><b>▣</b> Hôm nay, 14:30 - 16:30</p>
            <p><b>●</b> 123 Maple Ave, Apt 4B, Springfield, IL</p>
            <button type="button">[Hủy lịch đặt]</button>
          </article>

          <article className="tracking-summary-card">
            <h2>{selectedOrder.title}</h2>
            <p>Order #{selectedOrder.code}</p>
            <p>Trạng thái: <b>{selectedOrder.statusLabel}</b></p>
            <p>Tổng thanh toán: <b>{formatCurrency(selectedOrder.total)}</b></p>
          </article>
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

      <div className="profile-order-list">
        {visibleOrders.map((order) => (
          <article key={order.code} className={`profile-order-card order-${order.tab}`}>
            <div className="order-card-main">
              <span className={`profile-service-icon service-icon service-icon-${order.icon}`} aria-hidden="true" />
              <div>
                <h2>{order.title}</h2>
                <p>Order #{order.code}</p>
              </div>
            </div>

            <p className="order-card-time">Thời gian: <b>{order.date}</b></p>

            <div className="order-card-detail">
              <p>Loại dịch vụ: <b>{order.service}</b></p>
              <p>Thông tin: <b>{order.customer}</b></p>
            </div>

            <div className="order-card-worker">
              <p>Kỹ thuật viên:</p>
              <div className="profile-worker">
                <img src={order.technicianAvatar} alt={order.technician} />
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
                {order.tab === "active" ? (
                  <button className="button order-outline" type="button" onClick={() => confirmOrderCompleted(order)}>
                    Xác nhận hoàn thành
                  </button>
                ) : null}
                <button className="button primary" type="button">Đặt lại</button>
              </div>
            </div>
          </article>
        ))}
      </div>
        </>
      )}
    </section>
  );

  const renderWallet = () => (
    <section className="profile-simple-page">
      <h1>Ví & Ưu đãi</h1>
      <div className="wallet-grid">
        <article className="wallet-balance-card">
          <span>Số dư khả dụng</span>
          <strong>{formatCurrency(profile?.walletBalance ?? user.walletBalance ?? 0)}</strong>
          <div className="wallet-actions">
            <input
              value={walletAmount}
              onChange={(event) => setWalletAmount(event.target.value.replace(/\D/g, ""))}
              placeholder="Nhập số tiền"
              inputMode="numeric"
            />
            <input
              value={withdrawBankName}
              onChange={(event) => setWithdrawBankName(event.target.value)}
              placeholder="Ngân hàng rút"
            />
            <input
              value={withdrawBankAccount}
              onChange={(event) => setWithdrawBankAccount(event.target.value.replace(/\D/g, ""))}
              placeholder="Số tài khoản"
              inputMode="numeric"
            />
            <input
              value={withdrawAccountHolder}
              onChange={(event) => setWithdrawAccountHolder(event.target.value)}
              placeholder="Tên chủ tài khoản"
            />
            <button className="button primary" type="button" onClick={() => submitWalletTransaction("deposit")}>Nạp tiền</button>
            <button className="button secondary" type="button" onClick={() => submitWalletTransaction("withdraw")}>Rút tiền</button>
          </div>
          {walletFeedback ? <p className="booking-feedback">{walletFeedback}</p> : null}
        </article>
        <article className="coupon-card">
          <span>Ưu đãi đang có</span>
          <strong>3 mã</strong>
          <p>Giảm 15% vệ sinh máy lạnh, miễn phí kiểm tra điện lạnh, hoàn 30.000đ cho đơn tiếp theo.</p>
        </article>
      </div>
      <div className="profile-info-list">
        <article><b>HSNEW15</b><span>Giảm 15% cho dịch vụ đầu tiên trong tháng.</span></article>
        <article><b>FRECHECK</b><span>Miễn phí kiểm tra khi đặt lịch sửa điện lạnh.</span></article>
        <article><b>CASH30</b><span>Hoàn 30.000đ vào ví sau khi hoàn tất đơn.</span></article>
      </div>
    </section>
  );

  const renderPersonal = () => (
    <section className="profile-simple-page">
      <h1>Thông tin cá nhân</h1>
      <div className="personal-panel">
        <img src={user.avatar} alt={user.name} />
        <div>
          <h2>{user.name}</h2>
          <p>Khách hàng thân thiết</p>
        </div>
      </div>
      <div className="profile-form-grid">
        <label>Họ và tên<input value={user.name} readOnly /></label>
        <label>Số điện thoại<input value={profile?.phone ?? user.phone ?? "Chưa cập nhật"} readOnly /></label>
        <label>Email<input value={profile?.email ?? user.email ?? "Chưa cập nhật"} readOnly /></label>
        <label>Địa chỉ mặc định<input value={profile?.address || user.address || "Chưa có địa chỉ mặc định"} readOnly /></label>
      </div>
      {(profile?.savedAddresses?.length ?? 0) > 0 ? (
        <div className="profile-info-list">
          {profile?.savedAddresses.map((address) => (
            <article key={address}><b>Địa chỉ đã lưu</b><span>{address}</span></article>
          ))}
        </div>
      ) : null}
    </section>
  );

  const renderSupport = () => (
    <section className="profile-simple-page">
      <h1>Hỗ trợ</h1>
      <div className="support-grid">
        <article>
          <span>1900 888 666</span>
          <h2>Hotline HomeSwift</h2>
          <p>Tiếp nhận yêu cầu khẩn cấp, thay đổi lịch và hỗ trợ thanh toán.</p>
        </article>
        <article>
          <span>support@homeswift.vn</span>
          <h2>Gửi yêu cầu hỗ trợ</h2>
          <p>Phản hồi trong giờ hành chính, ưu tiên các đơn đang diễn ra.</p>
        </article>
      </div>
      <div className="profile-info-list">
        <article><b>Làm sao để đổi lịch?</b><span>Vào chi tiết đơn hàng và chọn thời gian phù hợp trước giờ hẹn.</span></article>
        <article><b>Khi nào được hoàn tiền?</b><span>HomeSwift hoàn tiền khi đơn bị hủy hợp lệ hoặc dịch vụ không được thực hiện.</span></article>
        <article><b>Cần thay kỹ thuật viên?</b><span>Liên hệ hotline để được điều phối lại người phục vụ gần nhất.</span></article>
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
        </nav>
        <button className="profile-logout" type="button" onClick={logout}>
          Đăng xuất
        </button>
      </aside>

      <main className="profile-main">
        <header className="profile-top">
          <button className="notification-button" type="button" aria-label="Thông báo">
            <span />
          </button>
          <img src={user.avatar} alt={user.name} />
        </header>

        <section className="profile-content">
          {renderActiveSection()}
        </section>
      </main>
    </div>
  );
}
