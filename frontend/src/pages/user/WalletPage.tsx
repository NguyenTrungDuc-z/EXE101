import { useEffect, useState, type ReactElement } from "react";
import { CreditCard, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle2, XCircle, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { platformApi } from "../../api/platformApi";
import type { WalletTransaction } from "../../types/platform";

const AUTH_STORAGE_KEY = "homeswift_user";

function readStoredUser() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

const typeLabels: Record<string, string> = {
  deposit: "Nạp tiền",
  withdraw: "Rút tiền",
  payment: "Thanh toán",
  earning: "Thu nhập",
  commission: "Hoa hồng sàn"
};

const typeIcons: Record<string, ReactElement> = {
  deposit: <ArrowDownCircle size={18} style={{ color: "#10b981" }} />,
  withdraw: <ArrowUpCircle size={18} style={{ color: "#ef4444" }} />,
  payment: <ArrowUpCircle size={18} style={{ color: "#ef4444" }} />,
  earning: <ArrowDownCircle size={18} style={{ color: "#10b981" }} />,
  commission: <ArrowUpCircle size={18} style={{ color: "#f59e0b" }} />
};

const statusIcons: Record<string, ReactElement> = {
  completed: <CheckCircle2 size={16} style={{ color: "#10b981" }} />,
  pending: <Clock size={16} style={{ color: "#f59e0b" }} />,
  failed: <XCircle size={16} style={{ color: "#ef4444" }} />
};

export default function WalletPage() {
  const [user] = useState<any>(readStoredUser());
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (user?.code) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profile, history] = await Promise.all([
        platformApi.getUserProfile(user.code),
        platformApi.getWalletHistory(user.code)
      ]);
      setBalance(profile.walletBalance || 0);
      setTransactions(history);
    } catch (error: any) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      setFeedback("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    setFeedback("");
    try {
      const result = await platformApi.createWalletTransaction({
        userCode: user.code,
        type: "deposit",
        amount
      });
      setBalance(result.walletBalance || balance + amount);
      setDepositAmount("");
      setFeedback("Nạp tiền thành công!");
      await loadData();
    } catch (error: any) {
      setFeedback(error.message);
    }
  };

  const isPositive = (type: string) => type === "deposit" || type === "earning";

  if (!user) {
    return <div style={{ padding: 40, textAlign: "center" }}>Vui lòng đăng nhập để xem ví tiền</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      {/* Virtual Card */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)",
        borderRadius: 20,
        padding: "32px 36px",
        color: "white",
        marginBottom: 32,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(37, 99, 235, 0.3)"
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, position: "relative" }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, letterSpacing: 1 }}>HOMESWIFT WALLET</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>{user.name || "User"}</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ width: 30, height: 20, borderRadius: 4, background: "rgba(255,255,255,0.3)" }} />
            <div style={{ width: 30, height: 20, borderRadius: 4, background: "rgba(255,255,255,0.2)", marginLeft: -10 }} />
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8, letterSpacing: 1 }}>SỐ DƯ HIỆN TẠI</div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 1 }}>
            {loading ? "..." : `${balance.toLocaleString()} VNĐ`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: 24, position: "relative" }}>
          <div style={{ fontSize: 12, opacity: 0.5 }}>
            **** **** **** {user.phone?.slice(-4) || "0000"}
          </div>
          <div style={{ fontSize: 12, opacity: 0.5 }}>
            VALID THRU ∞
          </div>
        </div>
      </div>

      {/* Quick Deposit */}
      <div style={{ 
        background: "white", 
        borderRadius: 16, 
        padding: 24, 
        marginBottom: 24, 
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <h2 style={{ marginBottom: 16, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <Wallet size={22} style={{ color: "#2563eb" }} />
          Nạp tiền vào ví
        </h2>
        
        {feedback && (
          <div style={{ 
            padding: 12, 
            borderRadius: 8, 
            background: feedback.includes("thành công") ? "#d1fae5" : "#fee2e2",
            color: feedback.includes("thành công") ? "#065f46" : "#991b1b",
            marginBottom: 16,
            fontSize: 14
          }}>
            {feedback}
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="number"
            placeholder="Nhập số tiền (VNĐ)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            style={{ 
              flex: 1, 
              padding: "12px 16px", 
              borderRadius: 10, 
              border: "1px solid #d1d5db",
              fontSize: 16
            }}
          />
          <button 
            className="button primary"
            onClick={handleDeposit}
            style={{ padding: "12px 28px", borderRadius: 10, fontSize: 15 }}
          >
            <ArrowDownCircle size={18} style={{ marginRight: 6 }} />
            Nạp tiền
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {[100000, 200000, 500000, 1000000].map((amount) => (
            <button
              key={amount}
              onClick={() => setDepositAmount(String(amount))}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: depositAmount === String(amount) ? "#2563eb" : "#f9fafb",
                color: depositAmount === String(amount) ? "white" : "#374151",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500
              }}
            >
              {amount.toLocaleString()}đ
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ 
        background: "white", 
        borderRadius: 16, 
        padding: 24, 
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <h2 style={{ marginBottom: 20, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={22} style={{ color: "#2563eb" }} />
          Lịch sử giao dịch
        </h2>

        {loading ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Đang tải...</p>
        ) : transactions.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Chưa có giao dịch nào</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "12px 8px", textAlign: "left", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Loại</th>
                <th style={{ padding: "12px 8px", textAlign: "left", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Mô tả</th>
                <th style={{ padding: "12px 8px", textAlign: "right", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Số tiền</th>
                <th style={{ padding: "12px 8px", textAlign: "center", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Trạng thái</th>
                <th style={{ padding: "12px 8px", textAlign: "right", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={tx.code || index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "14px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {typeIcons[tx.type] || <CreditCard size={18} />}
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{typeLabels[tx.type] || tx.type}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 8px", fontSize: 14, color: "#6b7280" }}>
                    {tx.description}
                  </td>
                  <td style={{ 
                    padding: "14px 8px", 
                    textAlign: "right", 
                    fontSize: 15, 
                    fontWeight: 600,
                    color: isPositive(tx.type) ? "#10b981" : "#ef4444"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                      {isPositive(tx.type) ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {isPositive(tx.type) ? "+" : "-"}{tx.amount.toLocaleString()}đ
                    </div>
                  </td>
                  <td style={{ padding: "14px 8px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                      {statusIcons[tx.type === "deposit" ? "completed" : "completed"]}
                      <span>Hoàn thành</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 8px", textAlign: "right", fontSize: 13, color: "#9ca3af" }}>
                    {new Date(tx.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}