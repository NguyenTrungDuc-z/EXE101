import { Schema, model } from "mongoose";

const operationTaskSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["open", "in_progress", "done"], required: true },
    ownerTeam: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    slaHours: { type: Number, required: true },
    relatedType: { type: String, required: true },
    relatedCode: { type: String, required: true },
    createdAt: { type: Date, required: true }
  },
  { versionKey: false }
);

export const OperationTaskModel = model("OperationTask", operationTaskSchema);
