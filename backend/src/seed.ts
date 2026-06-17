import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserModel } from "./models/User.js";
import WalletModel from "./models/Wallet.js";
import { CandidateProfileModel } from "./models/CandidateProfile.js";
import { EmployerProfileModel } from "./models/EmployerProfile.js";
import { OrderModel } from "./models/Order.js";
import { JobPostModel } from "./models/JobPost.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homeswift";

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    // 1. Clear existing data
    console.log("Clearing existing data...");
    await Promise.all([
      UserModel.deleteMany({}),
      WalletModel.deleteMany({}),
      CandidateProfileModel.deleteMany({}),
      EmployerProfileModel.deleteMany({}),
      OrderModel.deleteMany({}),
      JobPostModel.deleteMany({})
    ]);
    console.log("Data cleared.");

    // 2. Create Admin
    console.log("Seeding Admin...");
    const adminCode = "USR-ADM-001";
    const adminUser = await UserModel.create({
      code: adminCode,
      name: "Operations Admin",
      email: "admin@viecnhanh.vn",
      phone: "0900000001",
      role: "admin",
      status: "active",
      city: "TP. Hồ Chí Minh",
      avatar: `https://i.pravatar.cc/150?u=${adminCode}`,
      createdAt: new Date()
    });
    await WalletModel.create({ user: adminUser._id, balance: 0 });

    // 3. Create 5 Customers (Employers)
    console.log("Seeding Customers...");
    for (let i = 1; i <= 5; i++) {
      const code = `USR-EMP-00${i}`;
      const user = await UserModel.create({
        code,
        name: `Khách hàng ${i}`,
        email: `customer${i}@example.com`,
        phone: `091000000${i}`,
        role: "employer",
        status: "active",
        city: "TP. Hồ Chí Minh",
        avatar: `https://i.pravatar.cc/150?u=${code}`,
        createdAt: new Date()
      });
      await WalletModel.create({ user: user._id, balance: 2000000 });
      await EmployerProfileModel.create({
        userCode: code,
        companyName: `Cá nhân ${i}`,
        kycStatus: "verified",
        packageName: "starter",
        walletBalance: 2000000
      });
    }

    // 4. Create 5 Workers
    console.log("Seeding Workers...");
    for (let i = 1; i <= 5; i++) {
      const code = `USR-WRK-00${i}`;
      const availability = i === 5 ? "busy" : "available";
      
      const user = await UserModel.create({
        code,
        name: `Thợ dịch vụ ${i}`,
        email: `worker${i}@example.com`,
        phone: `092000000${i}`,
        role: "worker",
        status: "active",
        city: "TP. Hồ Chí Minh",
        avatar: `https://i.pravatar.cc/150?u=${code}`,
        createdAt: new Date()
      });
      await WalletModel.create({ user: user._id, balance: 0 });
      await CandidateProfileModel.create({
        userCode: code,
        headline: "Thợ dịch vụ chuyên nghiệp",
        skills: ["Điện nước", "Sửa điều hòa", "Dọn dẹp"],
        rating: 4.8,
        verified: true,
        completedJobs: i * 2,
        availability: availability
      });
    }

    // 5. Create Sample Orders
    console.log("Seeding Orders...");
    
    const jobCode = "JOB-001";
    await JobPostModel.create({
      code: jobCode,
      employerCode: "USR-EMP-001",
      categoryCode: "CAT-001",
      title: "Sửa máy lạnh",
      summary: "Máy lạnh không lạnh",
      location: "123 Lê Lợi, Quận 1",
      salaryLabel: "500.000đ",
      budgetMin: 500000,
      budgetMax: 500000,
      employmentType: "task",
      urgency: "high",
      status: "approved",
      startDate: new Date(),
      createdAt: new Date()
    });

    // Order 1: payment_review
    await OrderModel.create({
      code: "ORD-001",
      jobCode,
      employerCode: "USR-EMP-001",
      candidateCode: "USR-WRK-001",
      status: "payment_review",
      paymentStatus: "pending",
      totalAmount: 500000,
      address: "123 Lê Lợi, Quận 1",
      scheduledAt: new Date(Date.now() + 86400000)
    });

    // Order 2: PENDING_ASSIGN
    await OrderModel.create({
      code: "ORD-002",
      jobCode,
      employerCode: "USR-EMP-002",
      candidateCode: "UNASSIGNED",
      status: "PENDING_ASSIGN",
      paymentStatus: "paid",
      totalAmount: 750000,
      frozenBalance: 750000,
      address: "456 Nguyễn Huệ, Quận 1",
      scheduledAt: new Date(Date.now() + 172800000)
    });

    // Order 3: COMPLETED_BY_TECHNICIAN (older than 24h)
    const oldDate = new Date();
    oldDate.setHours(oldDate.getHours() - 26);

    await OrderModel.create({
      code: "ORD-003",
      jobCode,
      employerCode: "USR-EMP-003",
      candidateCode: "USR-WRK-002",
      status: "COMPLETED_BY_TECHNICIAN",
      paymentStatus: "paid",
      totalAmount: 1000000,
      workerPayout: 750000,
      platformFee: 250000,
      commissionRate: 0.25,
      frozenBalance: 1000000,
      address: "789 Cách Mạng Tháng 8, Quận 3",
      scheduledAt: new Date(oldDate.getTime() - 86400000),
      completedAt: oldDate
    });

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();