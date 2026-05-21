import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    orderCode: { type: String, required: true },
    payerCode: { type: String, required: true },
    payeeCode: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded"], required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    createdAt: { type: Date, required: true }
  },
  { versionKey: false }
);

export const PaymentModel = model("Payment", paymentSchema);
