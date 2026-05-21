import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import AdminCandidatesPage from "./pages/admin/AdminCandidatesPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEmployersPage from "./pages/admin/AdminEmployersPage";
import AdminJobsPage from "./pages/admin/AdminJobsPage";
import AdminOperationsPage from "./pages/admin/AdminOperationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import EmployerPostJobPage from "./pages/user/EmployerPostJobPage";
import UserHomePage from "./pages/user/UserHomePage";
import UserJobsPage from "./pages/user/UserJobsPage";
import UserWorkspacePage from "./pages/user/UserWorkspacePage";

export default function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<UserHomePage />} />
        <Route path="/user/jobs" element={<UserJobsPage />} />
        <Route path="/user/workspace" element={<UserWorkspacePage />} />
        <Route path="/user/post-job" element={<EmployerPostJobPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="jobs" element={<AdminJobsPage />} />
        <Route path="employers" element={<AdminEmployersPage />} />
        <Route path="candidates" element={<AdminCandidatesPage />} />
        <Route path="operations" element={<AdminOperationsPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
