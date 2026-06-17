import type { Request, Response } from "express";
import { ApplicationModel } from "../../models/Application.js";
import { CandidateProfileModel } from "../../models/CandidateProfile.js";
import { CategoryModel } from "../../models/Category.js";
import { ComplaintModel } from "../../models/Complaint.js";
import { EmployerProfileModel } from "../../models/EmployerProfile.js";
import { JobPostModel } from "../../models/JobPost.js";
import { OperationTaskModel } from "../../models/OperationTask.js";
import { OrderModel } from "../../models/Order.js";
import { PaymentModel } from "../../models/Payment.js";
import { UserModel } from "../../models/User.js";

export async function getOverview(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  const [
    totalUsers,
    totalEmployers,
    totalWorkers,
    totalJobs,
    pendingJobs,
    pendingKyc,
    openComplaints,
    activeOrders,
    totalRevenue,
    recentJobs
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ role: "employer" }),
    UserModel.countDocuments({ role: "worker" }),
    JobPostModel.countDocuments(),
    JobPostModel.countDocuments({ status: "pending" }),
    EmployerProfileModel.countDocuments({ kycStatus: "review" }),
    ComplaintModel.countDocuments({ status: { $in: ["open", "review"] } }),
    OrderModel.countDocuments({ status: { $in: ["pending", "confirmed", "in_service"] } }),
    PaymentModel.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, amount: { $sum: "$amount" } } }
    ]),
    JobPostModel.find().sort({ createdAt: -1 }).limit(5).lean()
  ]);

  response.json({
    cards: [
      { label: "Nguoi dung", value: totalUsers },
      { label: "Nha tuyen dung", value: totalEmployers },
      { label: "Thợ dịch vụ", value: totalWorkers },
      { label: "Bai dang", value: totalJobs },
      { label: "Doanh thu da thanh toan", value: totalRevenue[0]?.amount ?? 0 }
    ],
    queues: [
      { label: "Pending jobs", value: pendingJobs, sla: "2h" },
      { label: "KYC review", value: pendingKyc, sla: "6h" },
      { label: "Open complaints", value: openComplaints, sla: "4h" },
      { label: "Active orders", value: activeOrders, sla: "same day" }
    ],
    recentJobs
  });
}

export async function listAdminJobs(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  const [jobs, employers, categories, applications] = await Promise.all([
    JobPostModel.find().sort({ createdAt: -1 }).lean(),
    EmployerProfileModel.find().lean(),
    CategoryModel.find().lean(),
    ApplicationModel.find().lean()
  ]);

  const employerMap = new Map(employers.map((item) => [item.userCode, item]));
  const categoryMap = new Map(categories.map((item) => [item.code, item]));
  const applicationCountMap = new Map<string, number>();

  applications.forEach((item) => {
    applicationCountMap.set(item.jobCode, (applicationCountMap.get(item.jobCode) ?? 0) + 1);
  });

  response.json(
    jobs.map((job) => ({
      ...job,
      companyName: employerMap.get(job.employerCode)?.companyName ?? job.employerCode,
      categoryName: categoryMap.get(job.categoryCode)?.name ?? job.categoryCode,
      applicantsCount: applicationCountMap.get(job.code) ?? job.applicantsCount
    }))
  );
}

export async function listAdminEmployers(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  const [users, profiles, jobs] = await Promise.all([
    UserModel.find({ role: "employer" }).lean(),
    EmployerProfileModel.find().lean(),
    JobPostModel.find().lean()
  ]);

  const profileMap = new Map(profiles.map((item) => [item.userCode, item]));
  const jobCountMap = new Map<string, number>();

  jobs.forEach((job) => {
    jobCountMap.set(job.employerCode, (jobCountMap.get(job.employerCode) ?? 0) + 1);
  });

  response.json(
    users.map((user) => ({
      ...user,
      companyName: profileMap.get(user.code)?.companyName ?? user.name,
      kycStatus: profileMap.get(user.code)?.kycStatus ?? "pending",
      serviceAreas: profileMap.get(user.code)?.serviceAreas ?? [],
      walletBalance: profileMap.get(user.code)?.walletBalance ?? 0,
      packageName: profileMap.get(user.code)?.packageName ?? "starter",
      totalJobs: jobCountMap.get(user.code) ?? 0
    }))
  );
}

export async function listAdminWorkers(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  const [users, profiles, applications, orders] = await Promise.all([
    UserModel.find({ role: "worker" }).lean(),
    CandidateProfileModel.find().lean(),
    ApplicationModel.find().lean(),
    OrderModel.find().lean()
  ]);

  const profileMap = new Map(profiles.map((item) => [item.userCode, item]));
  const applicationCountMap = new Map<string, number>();
  const orderCountMap = new Map<string, number>();

  applications.forEach((item) => {
    applicationCountMap.set(item.candidateCode, (applicationCountMap.get(item.candidateCode) ?? 0) + 1);
  });

  orders.forEach((item) => {
    orderCountMap.set(item.candidateCode, (orderCountMap.get(item.candidateCode) ?? 0) + 1);
  });

  response.json(
    users.map((user) => ({
      ...user,
      headline: profileMap.get(user.code)?.headline ?? "",
      skills: profileMap.get(user.code)?.skills ?? [],
      rating: profileMap.get(user.code)?.rating ?? 0,
      verified: profileMap.get(user.code)?.verified ?? false,
      completedJobs: profileMap.get(user.code)?.completedJobs ?? 0,
      availability: profileMap.get(user.code)?.availability ?? "offline",
      totalApplications: applicationCountMap.get(user.code) ?? 0,
      totalOrders: orderCountMap.get(user.code) ?? 0
    }))
  );
}

export async function listAdminOperations(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  const [tasks, complaints, pendingJobs, reviewEmployers, escrowOrders, withdrawalPayments] = await Promise.all([
    OperationTaskModel.find().sort({ createdAt: -1 }).lean(),
    ComplaintModel.find().sort({ createdAt: -1 }).lean(),
    JobPostModel.find({ status: "pending" }).lean(),
    EmployerProfileModel.find({ kycStatus: "review" }).lean(),
    OrderModel.find({ status: "payment_review" }).sort({ scheduledAt: 1 }).lean(),
    PaymentModel.find({ type: "wallet_withdraw", status: "pending" }).sort({ createdAt: -1 }).lean()
  ]);

  response.json({
    tasks,
    alerts: {
      pendingJobs: pendingJobs.map((job) => ({
        code: job.code,
        title: job.title,
        type: "job_approval"
      })),
      reviewEmployers: reviewEmployers.map((profile) => ({
        code: profile.userCode,
        title: profile.companyName,
        type: "kyc_review"
      })),
      escrowOrders: escrowOrders.map((order) => ({
        code: order.code,
        title: `Duyệt tiền ${order.code}`,
        amount: order.totalAmount,
        transferContent: `HOMESWIFT ${order.code.replace(/^ORD-/, "BAN")}`,
        address: order.address,
        status: order.status
      })),
      withdrawals: withdrawalPayments.map((payment) => ({
        code: payment.code,
        userCode: payment.payerCode,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt
      })),
      complaints
    }
  });
}

export async function approveEscrowPayment(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  const { orderCode } = request.params;
  const order = await OrderModel.findOne({ code: orderCode });

  if (!order) {
    response.status(404).json({ message: "Không tìm thấy đơn hàng." });
    return;
  }

  if (order.status !== "payment_review") {
    response.status(400).json({ message: "Đơn hàng không ở trạng thái chờ duyệt tiền." });
    return;
  }

  order.status = "PENDING_ASSIGN";
  order.paymentStatus = "paid";
  order.frozenBalance = order.totalAmount;
  await order.save();

  await PaymentModel.updateMany(
    { orderCode: order.code, type: "service_booking" },
    { $set: { status: "paid" } }
  );

  await OperationTaskModel.updateMany(
    { relatedCode: order.code, type: "escrow_payment_review" },
    { $set: { status: "done" } }
  );

  response.json(order);
}

export async function approveWithdrawal(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  const { paymentCode } = request.params;
  const payment = await PaymentModel.findOne({ code: paymentCode, type: "wallet_withdraw" });

  if (!payment) {
    response.status(404).json({ message: "Không tìm thấy yêu cầu rút tiền." });
    return;
  }

  const user = await UserModel.findOne({ code: payment.payerCode });
  if (!user) {
    response.status(404).json({ message: "Không tìm thấy người dùng rút tiền." });
    return;
  }

  if ((user.walletBalance ?? 0) < payment.amount) {
    response.status(400).json({ message: "Số dư ví không đủ để duyệt rút tiền." });
    return;
  }

  user.walletBalance = (user.walletBalance ?? 0) - payment.amount;
  await user.save();

  payment.status = "paid";
  await payment.save();

  await OperationTaskModel.updateMany(
    { relatedCode: payment.code, type: "wallet_withdrawal" },
    { $set: { status: "done" } }
  );

  response.json(payment);
}

export async function listAdminOrders(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  // Get all orders
  const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();

  // Get all job codes from orders
  const jobCodes = orders.map((order) => order.jobCode);
  // Get all jobs in one query
  const jobs = await JobPostModel.find({ code: { $in: jobCodes } }).lean();
  const jobMap = new Map(jobs.map((job) => [job.code, job.title]));

  // Get all users to map employer and worker names
  const users = await UserModel.find().lean();
  const userMap = new Map(users.map((u) => [u.code, u.name]));

  // Attach jobTitle, employerName, and workerName to each order
  const ordersWithDetails = orders.map((order) => ({
    ...order,
    jobTitle: jobMap.get(order.jobCode) || "",
    employerName: userMap.get(order.employerCode) || order.employerCode,
    workerName: userMap.get(order.candidateCode) || ""
  }));

  response.json(ordersWithDetails);
}

export async function listAdminUsers(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  const users = await UserModel.find().sort({ createdAt: -1 }).lean();
  response.json(users);
}

export async function updateUserRole(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  const { userCode } = request.params;
  const { role } = request.body;

  const validRoles = ["admin", "employer", "worker"];
  if (!validRoles.includes(role)) {
    return response.status(400).json({ message: "Vai trò không hợp lệ." });
  }

  try {
    const updateData: any = { role };
    
    // If changing to worker, set status to AVAILABLE immediately
    if (role === "worker") {
      updateData.status = "AVAILABLE";
    } else {
      updateData.status = "active";
    }

    const user = await UserModel.findOneAndUpdate(
      { code: userCode },
      { $set: updateData },
      { new: true, runValidators: false }
    );

    if (!user) {
      return response.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Auto-setup profile and status for Workers
    if (role === "worker") {
      await CandidateProfileModel.findOneAndUpdate(
        { userCode: user.code },
        { 
          $set: { 
            verified: true,
            availability: "available",
            // Ensure required fields for CandidateProfile are present
            headline: "Thợ dịch vụ chuyên nghiệp",
            rating: 5,
            completedJobs: 0
          } 
        },
        { upsert: true, runValidators: false }
      );
    }

    // Auto-setup profile for Employers
    if (role === "employer") {
      await EmployerProfileModel.findOneAndUpdate(
        { userCode: user.code },
        { 
          $set: { 
            kycStatus: "verified",
            // Ensure required fields for EmployerProfile are present
            companyName: user.name,
            packageName: "starter",
            walletBalance: 0
          } 
        },
        { upsert: true, runValidators: false }
      );
    }

    response.json(user);
  } catch (error) {
    response.status(500).json({ message: (error as Error).message });
  }
}

export async function approveJob(request: Request, response: Response) {
  const { jobCode } = request.params;

  const job = await JobPostModel.findOne({ code: jobCode });
  if (!job) {
    response.status(404).json({ message: "Không tìm thấy yêu cầu." });
    return;
  }

  if (job.status !== "pending") {
    response.status(400).json({ message: "Yêu cầu đã được xử lý trước đó." });
    return;
  }

  job.status = "approved";
  await job.save();

  response.json(job);
}

export async function getAvailableTechnicians(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  // Get all users with role "worker" and status "active" or "AVAILABLE"
  const technicians = await UserModel.find({
    role: "worker",
    status: { $in: ["active", "AVAILABLE"] }
  }).lean();

  // Trả về đầy đủ danh sách thợ (gồm _id, code, name, phone, email, city) để Frontend render
  const availableTechnicians = technicians.map(t => ({
    _id: t._id,
    code: t.code,
    name: t.name,
    phone: t.phone,
    email: t.email,
    city: t.city
  }));

  response.json(availableTechnicians);
}

export async function assignTechnician(request: any, response: Response) {
  if (request.user.role !== "admin") {
    return response.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }

  const { orderCode } = request.params;
  const { technicianCode } = request.body;

  const order = await OrderModel.findOne({ code: orderCode });
  if (!order) {
    return response.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  const technician = await UserModel.findOne({ code: technicianCode });
  if (!technician || technician.role !== "worker") {
    return response.status(400).json({ message: "Thợ không hợp lệ" });
  }

  // Tính toán technicianPayout (ví dụ: 80% totalAmount)
  const commissionRate = order.commissionRate || 0.2;
  const technicianPayout = order.totalAmount * (1 - commissionRate);

  order.technicianId = technician._id as any;
  order.candidateCode = technician.code;
  order.technicianPayout = technicianPayout;
  order.status = "PENDING_ACCEPT";
  await order.save();

  response.json({
    message: "Gán thợ thành công",
    order
  });
}

export async function rejectJob(request: Request, response: Response) {
  const { jobCode } = request.params;

  const job = await JobPostModel.findOne({ code: jobCode });
  if (!job) {
    response.status(404).json({ message: "Không tìm thấy yêu cầu." });
    return;
  }

  if (job.status !== "pending") {
    response.status(400).json({ message: "Yêu cầu đã được xử lý trước đó." });
    return;
  }

  job.status = "rejected";
  await job.save();

  response.json(job);
}
