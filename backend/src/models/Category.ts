import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    serviceType: { type: String, required: true },
    averageBudgetLabel: { type: String, required: true }
  },
  { versionKey: false }
);

export const CategoryModel = model("Category", categorySchema);
