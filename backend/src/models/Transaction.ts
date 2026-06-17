import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  wallet: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: "deposit" | "withdraw" | "payment" | "earning" | "commission";
  amount: number;
  description: string;
  relatedBooking?: mongoose.Types.ObjectId;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "payment", "earning", "commission"],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    relatedBooking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);