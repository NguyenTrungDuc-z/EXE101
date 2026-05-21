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
        eyebrow="Workspace"
        title="Candidate applications and assigned orders"
        description="This page shows how the user side consumes two separate API resources."
      />

      <Surface title="Applications" subtitle="Pulled from /api/user/applications">
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

      <Surface title="Orders" subtitle="Pulled from /api/user/orders">
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
