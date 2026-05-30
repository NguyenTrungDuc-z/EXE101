import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { platformApi } from "../../api/platformApi";
import { PageIntro, StatusBadge, Surface } from "../../components/ui";
import type { Job } from "../../types/platform";
import { viText } from "../../utils/vietnameseText";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  const fetchJobs = () => {
    platformApi.getAdminJobs().then(setJobs).catch((err: any) => {
      setFeedback(err.message || "Lỗi khi tải danh sách yêu cầu");
    });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApprove = async (jobCode: string) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt yêu cầu này?")) return;
    try {
      await platformApi.approveJob(jobCode);
      setFeedback("Đã duyệt yêu cầu thành công!");
      fetchJobs();
    } catch (err: any) {
      setFeedback(err.message || "Lỗi khi duyệt yêu cầu");
    }
  };

  const handleReject = async (jobCode: string) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) return;
    try {
      await platformApi.rejectJob(jobCode);
      setFeedback("Đã từ chối yêu cầu!");
      fetchJobs();
    } catch (err: any) {
      setFeedback(err.message || "Lỗi khi từ chối yêu cầu");
    }
  };

  return (
    <div className="page-stack">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <PageIntro
          eyebrow="Quản trị yêu cầu"
          title="Hàng chờ kiểm duyệt và danh sách đang mở"
          description="Quản trị viên theo dõi đầy đủ trạng thái, gồm chờ duyệt và bị từ chối."
        />
        <button 
          className="button secondary" 
          onClick={() => navigate("/")}
          style={{ height: "fit-content" }}
        >
          ← Về trang chủ
        </button>
      </div>

      {feedback && (
        <div style={{
          padding: "16px",
          marginBottom: "16px",
          backgroundColor: feedback.includes("thành công") ? "#d1fae5" : "#fee2e2",
          border: `1px solid ${feedback.includes("thành công") ? "#10b981" : "#ef4444"}`,
          borderRadius: "8px",
          color: feedback.includes("thành công") ? "#065f46" : "#991b1b"
        }}>
          {feedback}
        </div>
      )}

      <Surface title="Danh sách yêu cầu" subtitle="Dữ liệu từ hệ thống quản trị">
        <div className="table-like">
          {jobs.map((job) => (
            <div key={job.code} className="table-row">
              <span>
                <strong>{viText(job.title)}</strong>
                <small>
                  {viText(job.companyName)} · {viText(job.categoryName)}
                </small>
              </span>
              <span>{job.applicantsCount} lượt nhận</span>
              <div className="stack-inline">
                <StatusBadge value={job.status} />
                <StatusBadge value={job.urgency} />
              </div>
              {job.status === "pending" && (
                <div className="stack-inline" style={{ gap: "8px" }}>
                  <button 
                    className="button primary" 
                    onClick={() => handleApprove(job.code)}
                    style={{ padding: "6px 12px", fontSize: "14px" }}
                  >
                    Duyệt
                  </button>
                  <button 
                    className="button" 
                    onClick={() => handleReject(job.code)}
                    style={{ 
                      padding: "6px 12px", 
                      fontSize: "14px",
                      background: "#fee2e2",
                      color: "#991b1b",
                      border: "1px solid #fca5a5"
                    }}
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
