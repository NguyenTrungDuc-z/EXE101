import { useEffect, useState } from "react";
import { DEMO_CANDIDATE_CODE } from "../../config";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { Application, Order } from "../../types/platform";

export default function UserWorkspacePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    platformApi.getUserApplications(DEMO_CANDIDATE_CODE).then(setApplications);
    platformApi.getUserOrders(DEMO_CANDIDATE_CODE).then(setOrders);
  }, []);

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Lịch sử"
        title="Lịch sử đặt dịch vụ và đơn đang xử lý"
        description="Theo dõi yêu cầu đã nhận, lịch hẹn dịch vụ và trạng thái thanh toán tại một nơi."
      />

      <Surface title="Yêu cầu dịch vụ" subtitle="Các yêu cầu bạn đã tương tác">
        <div className="table-like">
          {applications.map((item) => (
            <div key={item.code} className="table-row">
              <span>
                <strong>{item.jobTitle}</strong>
                <small>{item.location}</small>
              </span>
              <span>{item.salaryLabel}</span>
              <StatusBadge value={item.status} />
            </div>
          ))}
        </div>
      </Surface>

      <Surface title="Đơn dịch vụ" subtitle="Các đơn đã lên lịch hoặc đã hoàn thành">
        <div className="table-like">
          {orders.map((order) => (
            <div key={order.code} className="table-row">
              <span>
                <strong>{order.jobTitle}</strong>
                <small>{order.address}</small>
              </span>
              <span>{order.totalAmount.toLocaleString()} VND</span>
              <div className="stack-inline">
                <StatusBadge value={order.status} />
                <StatusBadge value={order.paymentStatus} />
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
