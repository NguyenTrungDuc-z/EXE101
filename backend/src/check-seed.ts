import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "./models/User.js";
import { OrderModel } from "./models/Order.js";

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homeswift";

async function check() {
  await mongoose.connect(MONGODB_URI);
  const userCount = await UserModel.countDocuments();
  const orderCount = await OrderModel.countDocuments();
  const workers = await UserModel.find({ role: 'worker' });
  console.log(`Users: ${userCount}`);
  console.log(`Orders: ${orderCount}`);
  console.log(`Workers: ${workers.length}`);
  workers.forEach(w => console.log(`- ${w.code}: ${w.status}`));
  process.exit(0);
}
check();