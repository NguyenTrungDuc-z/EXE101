import ScreenHeader from "../components/ScreenHeader";

export default function SettingsScreen() {
  return (
    <div className="screen">
      <ScreenHeader
        eyebrow="Cài đặt"
        title="Cài đặt hệ thống"
        subtitle="Quản lý thông tin chung, cấu hình bài đăng và thanh toán."
      />

      <div className="grid two">
        <article className="card">
          <h3>Chung</h3>
          <div className="form-grid">
            <label>
              Tên website
              <input placeholder="ViecNhanh" />
            </label>
            <label>
              Logo
              <input placeholder="Tải logo" />
            </label>
            <label className="full">
              Email liên hệ
              <input placeholder="contact@viecnhanh.vn" />
            </label>
          </div>
        </article>
        <article className="card">
          <h3>Cài đặt bài đăng</h3>
          <div className="form-grid">
            <label>
              Duyệt bài đăng
              <select>
                <option>Tự động</option>
                <option>Thủ công</option>
              </select>
            </label>
            <label>
              Số ngày hết hạn
              <input placeholder="30" />
            </label>
            <label className="full">
              Phương thức thanh toán
              <input placeholder="Chuyển khoản, Ví điện tử" />
            </label>
          </div>
        </article>
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost">Đặt lại</button>
        <button className="btn btn-solid">Lưu cài đặt</button>
      </div>
    </div>
  );
}
