import { Schema, model } from "mongoose";

const complaintSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    ownerCode: { type: String, required: true },
    targetType: { type: String, enum: ["job", "order", "payment", "account"], required: true },
    targetCode: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["open", "review", "resolved", "closed"], required: true },
    createdAt: { type: Date, required: true },
    resolutionNote: { type: String, default: "" }
  },
  { versionKey: false }
);

export const ComplaintModel = model("Complaint", complaintSchema);
