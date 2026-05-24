import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { DEMO_EMPLOYER_CODE } from "../../config";
import { platformApi } from "../../api/platformApi";
import { PageIntro, Surface } from "../../components/ui";
import type { Category } from "../../types/platform";

const initialState = {
  title: "",
  categoryCode: "",
  location: "",
  salaryLabel: "",
  budgetMin: 0,
  budgetMax: 0,
  employmentType: "task",
  urgency: "medium",
  summary: "",
  requirements: "",
  startDate: ""
};

export default function EmployerPostJobPage() {
  const [form, setForm] = useState(initialState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    platformApi.getUserHome().then((data) => setCategories(data.categories));
  }, []);

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await platformApi.createUserJob({
        employerCode: DEMO_EMPLOYER_CODE,
        title: form.title,
        categoryCode: form.categoryCode,
        location: form.location,
        salaryLabel: form.salaryLabel,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        employmentType: form.employmentType,
        urgency: form.urgency,
        summary: form.summary,
        requirements: form.requirements
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        startDate: form.startDate
      });

      setFeedback("Đã gửi yêu cầu dịch vụ vào hàng chờ duyệt.");
      setForm(initialState);
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Đặt lịch"
        title="Tạo yêu cầu dịch vụ mới"
        description="Gửi yêu cầu dịch vụ tại nhà vào hàng chờ kiểm duyệt vận hành."
      />

      <Surface title="Thông tin đặt lịch" subtitle="Chọn loại dịch vụ, khu vực, thời gian và ngân sách">
        <form className="form-grid" onSubmit={submitForm}>
          <label>
            Tên dịch vụ
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>
          <label>
            Danh mục
            <select
              value={form.categoryCode}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryCode: event.target.value }))}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.code} value={category.code}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Khu vực
            <input
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              required
            />
          </label>
          <label>
            Nhãn giá
            <input
              value={form.salaryLabel}
              onChange={(event) => setForm((prev) => ({ ...prev, salaryLabel: event.target.value }))}
              required
            />
          </label>
          <label>
            Ngân sách tối thiểu
            <input
              type="number"
              value={form.budgetMin}
              onChange={(event) => setForm((prev) => ({ ...prev, budgetMin: Number(event.target.value) }))}
              required
            />
          </label>
          <label>
            Ngân sách tối đa
            <input
              type="number"
              value={form.budgetMax}
              onChange={(event) => setForm((prev) => ({ ...prev, budgetMax: Number(event.target.value) }))}
              required
            />
          </label>
          <label>
            Hình thức dịch vụ
            <select
              value={form.employmentType}
              onChange={(event) => setForm((prev) => ({ ...prev, employmentType: event.target.value }))}
            >
              <option value="task">Theo việc</option>
              <option value="shift">Theo ca</option>
              <option value="contract">Theo hợp đồng</option>
            </select>
          </label>
          <label>
            Mức độ gấp
            <select
              value={form.urgency}
              onChange={(event) => setForm((prev) => ({ ...prev, urgency: event.target.value }))}
            >
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
          </label>
          <label className="full-span">
            Mô tả tóm tắt
            <textarea
              value={form.summary}
              onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
              required
            />
          </label>
          <label className="full-span">
            Yêu cầu
            <textarea
              value={form.requirements}
              onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))}
              placeholder="Mỗi yêu cầu một dòng"
            />
          </label>
          <label>
            Thời gian bắt đầu
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              required
            />
          </label>
          <div className="full-span action-row">
            <button className="button primary" type="submit">
              Tiếp tục
            </button>
            {feedback ? <p className="feedback">{feedback}</p> : null}
          </div>
        </form>
      </Surface>
    </div>
  );
}
