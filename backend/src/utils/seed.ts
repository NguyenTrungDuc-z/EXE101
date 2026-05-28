import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { UserModel } from "../models/User.js";
import { EmployerProfileModel } from "../models/EmployerProfile.js";
import { CandidateProfileModel } from "../models/CandidateProfile.js";
import { CategoryModel } from "../models/Category.js";
import { JobPostModel } from "../models/JobPost.js";
import { ApplicationModel } from "../models/Application.js";
import { OrderModel } from "../models/Order.js";
import { PaymentModel } from "../models/Payment.js";
import { ComplaintModel } from "../models/Complaint.js";
import { OperationTaskModel } from "../models/OperationTask.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.resolve(__dirname, "../../mongo-seed");

const seeds: { model: mongoose.Model<any>; filename: string }[] = [
  { model: UserModel, filename: "users.json" },
  { model: EmployerProfileModel, filename: "employerProfiles.json" },
  { model: CandidateProfileModel, filename: "candidateProfiles.json" },
  { model: CategoryModel, filename: "categories.json" },
  { model: JobPostModel, filename: "jobPosts.json" },
  { model: ApplicationModel, filename: "applications.json" },
  { model: OrderModel, filename: "orders.json" },
  { model: PaymentModel, filename: "payments.json" },
  { model: ComplaintModel, filename: "complaints.json" },
  { model: OperationTaskModel, filename: "operationTasks.json" },
];

async function seed() {
  try {
    console.log("Connecting to database...");
    await connectDatabase();
    console.log("Connected. Seeding data...");

    for (const s of seeds) {
      const filePath = path.join(seedDir, s.filename);
      if (!fs.existsSync(filePath)) {
        console.warn(`File ${s.filename} not found, skipping.`);
        continue;
      }
      const rawData = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(rawData);

      // Clean existing
      await s.model.deleteMany({});
      // Insert
      await s.model.insertMany(data);
      console.log(`Seeded ${s.filename} -> ${s.model.modelName} (${data.length} items)`);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

seed();
