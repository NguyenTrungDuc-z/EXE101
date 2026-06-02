import { useEffect, useState } from "react";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { OperationsResponse, Worker } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

export default function AdminOperationsPage() {
  const [data, setData] = useState<OperationsResponse | null>(null);
  const [candidates, setCandidates] = useState<Worker[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");

  const loadOperations = () => {
    platformApi.getAdminOperations().then(setData);
    platformApi.getAdminWorkers().then(setCandidates);
  };

  useEffect(() => {
    loadOperations();
  }, []);

  const approveEscrow = async (orderCode: string) => {
    setFeedback("");
    try {
      await platformApi.approveEscrowPayment(orderCode);
      setFeedback(`Đã duyệt tiền cho đơn ${orderCode}.`);
      loadOperations();
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

  const approveWithdrawal = async (paymentCode: string) => {
    setFeedback("");
    try {
      await platformApi.approveWithdrawal(paymentCode);
      setFeedback(`Đã duyệt rút tiền ${paymentCode}.`);
      loadOperations();
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

  const assignTechnician = async (orderId: string) => {
    const technicianId = selectedTechnicians[orderId];
    if (!technicianId) {
      alert("Vui lòng chọn thợ");
      return;
    }

    setFeedback("");
    try {
      await platformApi.assignTechnician(orderId, technicianId);
      setFeedback(`Đã gán thợ cho đơn hàng.`);
      loadOperations();
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Quản trị vận hành"
        title="Tác vụ vận hành và cảnh báo"
        description="Theo dõi duyệt tiền escrow, yêu cầu rút tiền, khiếu nại và các hồ sơ đang chờ xử lý."
      />

      {feedback ? <p className="feedback">{feedback}</p> : null}

      <div className="card-grid">
        <Surface title="Duyệt tiền Escrow" subtitle="Khách đã bấm Tôi đã chuyển khoản">
          <div className="list-stack compact">
            {data?.alerts.escrowOrders.map((item) => (
              <article key={item.code} className="mini-card">
                <h3>{item.code}</h3>
                <small>{item.transferContent}</small>
                <strong>{item.amount.toLocaleString("vi-VN")}đ</strong>
                <small>{viText(item.address)}</small>
                {item.status === "payment_review" ? (
                  <button className="button primary" type="button" onClick={() => approveEscrow(item.code)}>
                    Duyệt tiền
                  </button>
                ) : item.status === "finding_worker" ? (
                  <div className="stack-inline" style={{ marginTop: "8px" }}>
                    <select
                      className="input"
                      value={selectedTechnicians[item._id || ""] || ""}
                      onChange={(e) =>
                        setSelectedTechnicians({ ...selectedTechnicians, [item._id || ""]: e.target.value })
                      }
                    >
                      <option value="">Chọn thợ...</option>
                      {candidates
                        .filter((c) => c.availability === "online" || true) // Fake active for now
                        .map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.rating}⭐)
                          </option>
                        ))}
                    </select>
                    <button
                      className="button primary"
                      type="button"
                      onClick={() => assignTechnician(item._id || "")}
                    >
                      Gán thợ
                    </button>
                  </div>
                ) : (
                  <StatusBadge value={item.status} />
                )}
              </article>
            ))}
            {!data?.alerts.escrowOrders.length ? <p>Không có đơn chờ duyệt tiền.</p> : null}
          </div>
        </Surface>

        <Surface title="Duyệt rút tiền" subtitle="Thợ đã gửi yêu cầu rút ví">
          <div className="list-stack compact">
            {data?.alerts.withdrawals.map((item) => (
              <article key={item.code} className="mini-card">
                <h3>{item.code}</h3>
                <small>{item.userCode}</small>
                <strong>{item.amount.toLocaleString("vi-VN")}đ</strong>
                <small>{item.method}</small>
                <button className="button primary" type="button" onClick={() => approveWithdrawal(item.code)}>
                  Duyệt rút tiền
                </button>
              </article>
            ))}
            {!data?.alerts.withdrawals.length ? <p>Không có yêu cầu rút tiền.</p> : null}
          </div>
        </Surface>
      </div>

      <Surface title="Tác vụ vận hành" subtitle="Dữ liệu từ hệ thống quản trị">
        <div className="table-like">
          {data?.tasks.map((task) => (
            <div key={task.code} className="table-row">
              <span>
                <strong>{viText(task.title)}</strong>
                <small>
                  {viText(task.ownerTeam)} · {task.relatedCode}
                </small>
              </span>
              <span>{task.slaHours} giờ SLA</span>
              <div className="stack-inline">
                <StatusBadge value={task.status} />
                <StatusBadge value={task.priority} />
              </div>
            </div>
          ))}
        </div>
      </Surface>

      <div className="card-grid">
        <Surface title="Yêu cầu chờ duyệt" subtitle="Các mục đang đợi kiểm duyệt">
          <div className="list-stack compact">
            {data?.alerts.pendingJobs.map((item) => (
              <article key={item.code} className="mini-card">
                <h3>{viText(item.title)}</h3>
                <small>{item.code}</small>
              </article>
            ))}
          </div>
        </Surface>

        <Surface title="Duyệt KYC" subtitle="Tài khoản khách hàng đang chờ kiểm tra">
          <div className="list-stack compact">
            {data?.alerts.reviewEmployers.map((item) => (
              <article key={item.code} className="mini-card">
                <h3>{viText(item.title)}</h3>
                <small>{item.code}</small>
              </article>
            ))}
          </div>
        </Surface>
      </div>

      <Surface title="Khiếu nại" subtitle="Phiếu người dùng được tách khỏi tác vụ vận hành nội bộ">
        <div className="table-like">
          {data?.alerts.complaints.map((complaint) => (
            <div key={complaint.code} className="table-row">
              <span>
                <strong>{viText(complaint.type)}</strong>
                <small>{viText(complaint.message)}</small>
              </span>
              <span>{complaint.targetCode}</span>
              <StatusBadge value={complaint.status} />
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
