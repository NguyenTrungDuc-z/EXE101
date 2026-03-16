import { IconBell } from "./icons";

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="header-left">
      </div>
      <div className="header-actions">
        <span className="header-date"></span>
        <button className="icon-btn" aria-label="Thông báo">
          <IconBell />
        </button>
        <button className="btn btn-solid">Đăng xuất</button>
      </div>
    </header>
  );
}
