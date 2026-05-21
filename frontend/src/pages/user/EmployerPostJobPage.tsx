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

      setFeedback("Job submitted to pending review queue.");
      setForm(initialState);
    } catch (reason) {
      setFeedback((reason as Error).message);
    }
  };

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Employer action"
        title="Create a new job request"
        description="This form calls POST /api/user/jobs and pushes the item into admin review."
      />

      <Surface title="New job form" subtitle="Employer-facing API integration">
        <form className="form-grid" onSubmit={submitForm}>
          <label>
            Job title
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>
          <label>
            Category
            <select
              value={form.categoryCode}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryCode: event.target.value }))}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.code} value={category.code}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Location
            <input
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              required
            />
          </label>
          <label>
            Salary label
            <input
              value={form.salaryLabel}
              onChange={(event) => setForm((prev) => ({ ...prev, salaryLabel: event.target.value }))}
              required
            />
          </label>
          <label>
            Budget min
            <input
              type="number"
              value={form.budgetMin}
              onChange={(event) => setForm((prev) => ({ ...prev, budgetMin: Number(event.target.value) }))}
              required
            />
          </label>
          <label>
            Budget max
            <input
              type="number"
              value={form.budgetMax}
              onChange={(event) => setForm((prev) => ({ ...prev, budgetMax: Number(event.target.value) }))}
              required
            />
          </label>
          <label>
            Employment type
            <select
              value={form.employmentType}
              onChange={(event) => setForm((prev) => ({ ...prev, employmentType: event.target.value }))}
            >
              <option value="task">task</option>
              <option value="shift">shift</option>
              <option value="contract">contract</option>
            </select>
          </label>
          <label>
            Urgency
            <select
              value={form.urgency}
              onChange={(event) => setForm((prev) => ({ ...prev, urgency: event.target.value }))}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>
          <label className="full-span">
            Summary
            <textarea
              value={form.summary}
              onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
              required
            />
          </label>
          <label className="full-span">
            Requirements
            <textarea
              value={form.requirements}
              onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))}
              placeholder="One requirement per line"
            />
          </label>
          <label>
            Start date
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              required
            />
          </label>
          <div className="full-span action-row">
            <button className="button primary" type="submit">
              Submit
            </button>
            {feedback ? <p className="feedback">{feedback}</p> : null}
          </div>
        </form>
      </Surface>
    </div>
  );
}
