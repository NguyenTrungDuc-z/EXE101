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

export async function getOverview(_request: Request, response: Response) {
  const [
    totalUsers,
    totalEmployers,
    totalCandidates,
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
    UserModel.countDocuments({ role: "candidate" }),
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
      { label: "Ung vien", value: totalCandidates },
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

export async function listAdminJobs(_request: Request, response: Response) {
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

export async function listAdminEmployers(_request: Request, response: Response) {
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

export async function listAdminCandidates(_request: Request, response: Response) {
  const [users, profiles, applications, orders] = await Promise.all([
    UserModel.find({ role: "candidate" }).lean(),
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

export async function listAdminOperations(_request: Request, response: Response) {
  const [tasks, complaints, pendingJobs, reviewEmployers] = await Promise.all([
    OperationTaskModel.find().sort({ createdAt: -1 }).lean(),
    ComplaintModel.find().sort({ createdAt: -1 }).lean(),
    JobPostModel.find({ status: "pending" }).lean(),
    EmployerProfileModel.find({ kycStatus: "review" }).lean()
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
      complaints
    }
  });
}
