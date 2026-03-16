import data from "../data/db.json";
import ScreenHeader from "../components/ScreenHeader";
import { statusClass, Status, statusLabel } from "../utils/helpers";

export default function PaymentsScreen() {
  return (
    <div className="screen">
      <ScreenHeader
        eyebrow="Thanh toán"
        title="Giao dịch gói đăng bài"
        subtitle="Theo dõi thanh toán, xác nhận và hoàn tiền."
      />

      <div className="card table-card">
        <div className="table">
          <div className="table-row table-head payments-grid">
            <span>Nhà tuyển dụng</span>
            <span>Gói</span>
            <span>Giá</span>
            <span>Phương thức</span>
            <span>Trạng thái</span>
            <span>Ngày</span>
            <span>Hành động</span>
          </div>
          {data.payments.map((payment) => (
            <div key={payment.id} className="table-row payments-grid">
              <span>
                <strong>{payment.employer}</strong>
                <small>{payment.id}</small>
              </span>
              <span>{payment.package}</span>
              <span>{payment.price}</span>
              <span>{payment.method}</span>
              <span className={statusClass(payment.status as Status)}>{statusLabel(payment.status as Status)}</span>
              <span>{payment.date}</span>
              <span className="table-actions">
                <button className="link">Xem</button>
                <button className="link">Xác nhận</button>
                <button className="link danger">Hoàn tiền</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
