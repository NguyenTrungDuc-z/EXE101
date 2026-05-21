import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    jobCode: { type: String, required: true },
    employerCode: { type: String, required: true },
    candidateCode: { type: String, required: true },
    status: { type: String, enum: ["pending", "confirmed", "in_service", "completed", "cancelled"], required: true },
    scheduledAt: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], required: true },
    address: { type: String, required: true }
  },
  { versionKey: false }
);

export const OrderModel = model("Order", orderSchema);
