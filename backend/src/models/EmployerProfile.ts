import { Schema, model } from "mongoose";

const employerProfileSchema = new Schema(
  {
    userCode: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    kycStatus: { type: String, enum: ["pending", "review", "verified", "rejected"], required: true },
    serviceAreas: { type: [String], default: [] },
    packageName: { type: String, required: true },
    walletBalance: { type: Number, required: true }
  },
  { versionKey: false }
);

export const EmployerProfileModel = model("EmployerProfile", employerProfileSchema);
