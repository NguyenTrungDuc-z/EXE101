import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page-stack">
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn này nằm ngoài luồng người dùng và quản trị hiện tại.</p>
      <Link className="button primary" to="/">
        Về trang chủ
      </Link>
    </div>
  );
}
