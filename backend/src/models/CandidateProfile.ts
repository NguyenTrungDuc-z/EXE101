import { Schema, model } from "mongoose";

const candidateProfileSchema = new Schema(
  {
    userCode: { type: String, required: true, unique: true },
    headline: { type: String, required: true },
    skills: { type: [String], default: [] },
    rating: { type: Number, required: true },
    verified: { type: Boolean, required: true },
    completedJobs: { type: Number, required: true },
    availability: { type: String, enum: ["available", "busy", "offline"], required: true }
  },
  { versionKey: false }
);

export const CandidateProfileModel = model("CandidateProfile", candidateProfileSchema);
