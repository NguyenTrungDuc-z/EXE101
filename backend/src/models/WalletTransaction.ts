import { Schema, model } from "mongoose";

const walletTransactionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    userCode: { type: String, required: true },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "payment", "earning", "commission"],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    relatedOrderCode: { type: String, default: "" },
    balanceAfter: { type: Number, required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

export const WalletTransactionModel = model(
  "WalletTransaction",
  walletTransactionSchema
);