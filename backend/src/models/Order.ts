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
        "PENDING_ASSIGN",
        "PENDING_ACCEPT",
        "IN_PROGRESS",
        "COMPLETED_BY_TECHNICIAN",
        "COMPLETED_PENDING_REVIEW",
        "SUCCESS",
        "COMPLETED",
        "cancelled"
      ],
      required: true
    },
    scheduledAt: { type: Date, required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: "User" },
    technicianPayout: { type: Number, default: 0 },
    materialRequests: {
      type: [
        {
          name: { type: String, required: true },
          quantity: { type: Number, required: true },
          price: { type: Number, required: true },
          isApprovedByCustomer: { type: Boolean, default: false }
        }
      ],
      default: []
    },
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
    completedAt: { type: Date },
    isReleased: { type: Boolean, default: false },
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