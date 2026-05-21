import type { Request, Response } from "express";
import { ApplicationModel } from "../../models/Application.js";
import { CategoryModel } from "../../models/Category.js";
import { EmployerProfileModel } from "../../models/EmployerProfile.js";
import { JobPostModel } from "../../models/JobPost.js";
import { OrderModel } from "../../models/Order.js";
import { UserModel } from "../../models/User.js";
import { generateCode } from "../../utils/generateCode.js";

export async function getUserHome(_request: Request, response: Response) {
  const [jobs, categories, orders, employers, candidates] = await Promise.all([
    JobPostModel.find({ status: { $in: ["approved", "in_progress"] } }).sort({ createdAt: -1 }).lean(),
    CategoryModel.find().lean(),
    OrderModel.find().lean(),
    UserModel.countDocuments({ role: "employer" }),
    UserModel.countDocuments({ role: "candidate" })
  ]);

  const categoryCountMap = new Map<string, number>();
  jobs.forEach((job) => {
    categoryCountMap.set(job.categoryCode, (categoryCountMap.get(job.categoryCode) ?? 0) + 1);
  });

  response.json({
    hero: {
      totalOpenJobs: jobs.length,
      totalEmployers: employers,
      totalCandidates: candidates,
      activeOrders: orders.filter((order) => ["pending", "confirmed", "in_service"].includes(order.status)).length
    },
    categories: categories.map((category) => ({
      ...category,
      openJobs: categoryCountMap.get(category.code) ?? 0
    })),
    featuredJobs: jobs.slice(0, 6)
  });
}

export async function listUserJobs(request: Request, response: Response) {
  const { q, categoryCode } = request.query;
  const [jobs, employers, categories] = await Promise.all([
    JobPostModel.find({ status: { $in: ["approved", "in_progress"] } }).sort({ createdAt: -1 }).lean(),
    EmployerProfileModel.find().lean(),
    CategoryModel.find().lean()
  ]);

  const employerMap = new Map(employers.map((item) => [item.userCode, item]));
  const categoryMap = new Map(categories.map((item) => [item.code, item]));
  const search = String(q ?? "").trim().toLowerCase();
  const categoryFilter = String(categoryCode ?? "").trim();

  const items = jobs
    .map((job) => ({
      ...job,
      companyName: employerMap.get(job.employerCode)?.companyName ?? job.employerCode,
      categoryName: categoryMap.get(job.categoryCode)?.name ?? job.categoryCode
    }))
    .filter((job) => {
      const matchesCategory = categoryFilter ? job.categoryCode === categoryFilter : true;
      const matchesSearch = search
        ? [job.title, job.location, job.summary, job.companyName].some((value) =>
            value.toLowerCase().includes(search)
          )
        : true;

      return matchesCategory && matchesSearch;
    });

  response.json(items);
}

export async function getUserJobDetail(request: Request, response: Response) {
  const { jobCode } = request.params;
  const [job, applications] = await Promise.all([
    JobPostModel.findOne({ code: jobCode }).lean(),
    ApplicationModel.find({ jobCode }).lean()
  ]);

  if (!job) {
    response.status(404).json({ message: "Job not found" });
    return;
  }

  const jobEmployer = await EmployerProfileModel.findOne({ userCode: job.employerCode }).lean();
  const jobCategory = await CategoryModel.findOne({ code: job.categoryCode }).lean();

  response.json({
    ...job,
    companyName: jobEmployer?.companyName ?? job.employerCode,
    serviceAreas: jobEmployer?.serviceAreas ?? [],
    categoryName: jobCategory?.name ?? job.categoryCode,
    applicationsCount: applications.length
  });
}

export async function listUserApplications(request: Request, response: Response) {
  const candidateCode = String(request.query.candidateCode ?? "USR-CAN-001");
  const [applications, jobs] = await Promise.all([
    ApplicationModel.find({ candidateCode }).sort({ appliedAt: -1 }).lean(),
    JobPostModel.find().lean()
  ]);

  const jobMap = new Map(jobs.map((item) => [item.code, item]));

  response.json(
    applications.map((application) => ({
      ...application,
      jobTitle: jobMap.get(application.jobCode)?.title ?? application.jobCode,
      location: jobMap.get(application.jobCode)?.location ?? "",
      salaryLabel: jobMap.get(application.jobCode)?.salaryLabel ?? ""
    }))
  );
}

export async function listUserOrders(request: Request, response: Response) {
  const userCode = String(request.query.userCode ?? "USR-CAN-001");
  const [orders, jobs] = await Promise.all([
    OrderModel.find({
      $or: [{ employerCode: userCode }, { candidateCode: userCode }]
    })
      .sort({ scheduledAt: -1 })
      .lean(),
    JobPostModel.find().lean()
  ]);

  const jobMap = new Map(jobs.map((item) => [item.code, item]));

  response.json(
    orders.map((order) => ({
      ...order,
      jobTitle: jobMap.get(order.jobCode)?.title ?? order.jobCode
    }))
  );
}

export async function createUserJob(request: Request, response: Response) {
  const {
    employerCode,
    title,
    categoryCode,
    location,
    salaryLabel,
    budgetMin,
    budgetMax,
    employmentType,
    urgency,
    summary,
    requirements,
    startDate
  } = request.body;

  const job = await JobPostModel.create({
    code: generateCode("JOB"),
    employerCode,
    title,
    categoryCode,
    location,
    salaryLabel,
    budgetMin,
    budgetMax,
    employmentType,
    urgency,
    summary,
    requirements: Array.isArray(requirements) ? requirements : [],
    startDate: new Date(startDate),
    createdAt: new Date(),
    status: "pending",
    applicantsCount: 0
  });

  response.status(201).json(job);
}

export async function createUserApplication(request: Request, response: Response) {
  const { candidateCode, jobCode, note } = request.body;

  const existing = await ApplicationModel.findOne({ candidateCode, jobCode }).lean();
  if (existing) {
    response.status(409).json({ message: "Application already exists" });
    return;
  }

  const job = await JobPostModel.findOne({ code: jobCode });
  if (!job) {
    response.status(404).json({ message: "Job not found" });
    return;
  }

  const application = await ApplicationModel.create({
    code: generateCode("APP"),
    candidateCode,
    jobCode,
    note: note ?? "",
    status: "new",
    appliedAt: new Date()
  });

  job.applicantsCount += 1;
  await job.save();

  response.status(201).json(application);
}
