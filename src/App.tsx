import { useState } from "react";
import AppHeader from "./components/AppHeader";
import Sidebar from "./components/Sidebar";
import ComplaintsScreen from "./screens/ComplaintsScreen";
import CreatePostScreen from "./screens/CreatePostScreen";
import DashboardScreen from "./screens/DashboardScreen";
import EmployersScreen from "./screens/EmployersScreen";
import JobPostsScreen from "./screens/JobPostsScreen";
import OrdersScreen from "./screens/OrdersScreen";
import PaymentsScreen from "./screens/PaymentsScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CandidatesScreen from "./screens/CandidatesScreen";

const navItems = [
  { id: "dashboard", label: "Bảng điều hành" },
  { id: "job-posts", label: "Bài đăng" },
  { id: "create-post", label: "Tạo bài đăng" },
  { id: "candidates", label: "Ứng viên" },
  { id: "employers", label: "Nhà tuyển dụng" },
  { id: "orders", label: "Đơn đặt việc" },
  { id: "payments", label: "Thanh toán" },
  { id: "reports", label: "Báo cáo" },
  { id: "complaints", label: "Khiếu nại" },
  { id: "settings", label: "Cài đặt" }
];

type ScreenId = (typeof navItems)[number]["id"];

export default function App() {
  const [active, setActive] = useState<ScreenId>("dashboard");

  return (
    <div className="app">
      <Sidebar items={navItems} active={active} onSelect={setActive} />
      <main className="main">
        <AppHeader />
        {active === "dashboard" && <DashboardScreen />}
        {active === "job-posts" && <JobPostsScreen />}
        {active === "create-post" && <CreatePostScreen />}
        {active === "candidates" && <CandidatesScreen />}
        {active === "employers" && <EmployersScreen />}
        {active === "orders" && <OrdersScreen />}
        {active === "payments" && <PaymentsScreen />}
        {active === "reports" && <ReportsScreen />}
        {active === "complaints" && <ComplaintsScreen />}
        {active === "settings" && <SettingsScreen />}
      </main>
    </div>
  );
}
