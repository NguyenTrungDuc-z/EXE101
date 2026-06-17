import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["admin", "employer", "worker"], required: true },
    status: { type: String, enum: ["active", "pending", "locked", "AVAILABLE"], required: true },
    city: { type: String, required: true },
    address: { type: String, default: "" },
    savedAddresses: { type: [String], default: [] },
    walletBalance: { type: Number, default: 0 },
    avatar: { type: String, required: true },
    createdAt: { type: Date, required: true }
  },
  { versionKey: false }
);

export const UserModel = model("User", userSchema);
