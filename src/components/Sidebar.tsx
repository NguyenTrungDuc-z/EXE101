type NavItem = {
  id: string;
  label: string;
};

type SidebarProps = {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
};

export default function Sidebar({ items, active, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">VN</div>
        <div>
          <p className="brand-title">ViecNhanh</p>
        </div>
      </div>
      <nav className="nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-card">
        <p className="sidebar-title">Kích hoạt nhanh</p>
        <p className="sidebar-text">Duyệt 23 tin đăng chờ và cập nhật KYC.</p>
        <button className="btn btn-solid">Mở hàng đợi</button>
      </div>
    </aside>
  );
}
