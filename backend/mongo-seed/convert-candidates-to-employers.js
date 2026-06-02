import mongoose from "mongoose";
import { UserModel } from "../src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function convertCandidatesToEmployers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/homeswift");
    console.log("Connected to MongoDB");
    
    console.log("Starting conversion of candidates to employers...");
    
    // Update all users with role "candidate" to "employer"
    const result = await UserModel.updateMany(
      { role: "candidate" },
      { $set: { role: "employer" } }
    );
    
    console.log(`Updated ${result.modifiedCount} users from candidate to employer`);
    console.log("Conversion completed successfully!");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error during conversion:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

convertCandidatesToEmployers();
