import { Schema, model } from "mongoose";

const jobPostSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    categoryCode: { type: String, required: true },
    employerCode: { type: String, required: true },
    location: { type: String, required: true },
    salaryLabel: { type: String, required: true },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    employmentType: { type: String, enum: ["task", "shift", "contract"], required: true },
    urgency: { type: String, enum: ["low", "medium", "high"], required: true },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "in_progress", "completed"],
      required: true
    },
    summary: { type: String, required: true },
    requirements: { type: [String], default: [] },
    serviceVariants: {
      type: [
        {
          code: { type: String, required: true },
          name: { type: String, required: true },
          price: { type: Number },
          priceMin: { type: Number },
          priceMax: { type: Number },
          pricingType: { type: String, enum: ["fixed", "range"], default: "fixed" }
        }
      ],
      default: []
    },
    startDate: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    applicantsCount: { type: Number, required: true, default: 0 }
  },
  { versionKey: false }
);

export const JobPostModel = model("JobPost", jobPostSchema);
