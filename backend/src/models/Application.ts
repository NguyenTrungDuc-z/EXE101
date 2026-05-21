import { Schema, model } from "mongoose";

const applicationSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    jobCode: { type: String, required: true },
    candidateCode: { type: String, required: true },
    status: { type: String, enum: ["new", "review", "shortlisted", "rejected", "accepted"], required: true },
    note: { type: String, default: "" },
    appliedAt: { type: Date, required: true }
  },
  { versionKey: false }
);

export const ApplicationModel = model("Application", applicationSchema);
