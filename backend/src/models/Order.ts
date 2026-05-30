import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    jobCode: { type: String, required: true },
    employerCode: { type: String, required: true },
    candidateCode: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "payment_pending",
        "payment_review",
        "finding_worker",
        "pending",
        "confirmed",
        "in_service",
        "completed",
        "cancelled"
      ],
      required: true
    },
    scheduledAt: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    frozenBalance: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    workerPayout: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], required: true },
    address: { type: String, required: true },
    // New fields for Material List tracking
    materialTotal: { type: Number, default: 0 },
    materialStatus: { type: String, enum: ["none", "pending", "confirmed", "rejected"], default: "none" },
    // New fields for Review
    isReviewed: { type: Boolean, default: false },
    // Commission fields
    commissionRate: { type: Number, default: 0.25 },
    commissionAmount: { type: Number, default: 0 },
    earningAmount: { type: Number, default: 0 },
    // Invoice items for additional materials/parts
    invoiceItems: {
      type: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true }
        }
      ],
      default: []
    }
  },
  { versionKey: false }
);

export const OrderModel = model("Order", orderSchema);