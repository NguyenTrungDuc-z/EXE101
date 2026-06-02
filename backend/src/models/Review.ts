import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    technicianId: { type: Schema.Types.ObjectId, ref: "User" },
    orderCode: { type: String, required: true, unique: true },
    employerCode: { type: String, required: true },
    candidateCode: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

export const ReviewModel = model("Review", reviewSchema);