import { Schema, model } from "mongoose";

const materialItemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const materialListSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    orderCode: { type: String, required: true },
    candidateCode: { type: String, required: true },
    employerCode: { type: String, required: true },
    items: { type: [materialItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
    note: { type: String, default: "" },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

export const MaterialListModel = model("MaterialList", materialListSchema);