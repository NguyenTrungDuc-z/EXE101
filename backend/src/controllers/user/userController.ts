import type { Request, Response } from "express";
import { ApplicationModel } from "../../models/Application.js";
import { CategoryModel } from "../../models/Category.js";
import { EmployerProfileModel } from "../../models/EmployerProfile.js";
import { JobPostModel } from "../../models/JobPost.js";
import { OrderModel } from "../../models/Order.js";
import { UserModel } from "../../models/User.js";
import { generateCode } from "../../utils/generateCode.js";

const serviceCatalog = {
  default: {
    coverImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
    ],
    ratingLabel: "4.9",
    bookingCountLabel: "1,250+ đã đặt",
    displayPriceLabel: "250.000 VND",
    unitLabel: "máy",
    benefits: ["Tiết kiệm điện", "Không khí trong lành", "Tăng tuổi thọ"],
    processSteps: ["Kiểm tra", "Vệ sinh dàn lạnh", "Vệ sinh dàn nóng", "Kiểm tra gas", "Lắp đặt lại", "Nghiệm thu"],
    qualityCommitments: ["Bảo hành 30 ngày", "Hoàn tiền nếu không hài lòng"],
    reasons: ["Tiết kiệm điện", "Không khí trong lành", "Tăng tuổi thọ", "Bảo hành 30 ngày", "Hoàn tiền nếu không hài lòng"],
    reviews: [
      {
        author: "Minh Anh",
        rating: 5,
        comment: "Thợ đúng giờ, làm sạch kỹ và báo giá rõ ràng trước khi thực hiện.",
        image: "https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=600&q=80"
      },
      {
        author: "Hoàng Nam",
        rating: 5,
        comment: "Máy chạy êm hơn nhiều sau khi vệ sinh. Tôi sẽ đặt lại lần sau.",
        image: "https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=600&q=80"
      }
    ],
    faqs: [
      { question: "Khi nào nên vệ sinh điều hòa?", answer: "Nên vệ sinh định kỳ 3-6 tháng một lần tùy tần suất sử dụng." },
      { question: "Dịch vụ có bảo hành không?", answer: "Dịch vụ có cam kết hỗ trợ sau khi hoàn tất theo chính sách hiển thị trên đơn." },
      { question: "Tôi có thể đặt lịch trong ngày không?", answer: "Có, nếu còn thợ phù hợp trong khu vực của bạn." }
    ]
  },
  "CAT-CLEAN": {
    coverImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    displayPriceLabel: "220.000 VND",
    unitLabel: "ca",
    benefits: ["Nhà sạch nhanh", "Tiết kiệm thời gian", "Dụng cụ đầy đủ"],
    processSteps: ["Khảo sát khu vực", "Dọn rác", "Lau bề mặt", "Vệ sinh sàn", "Kiểm tra lại", "Bàn giao"],
    reasons: ["Nhà sạch nhanh", "Tiết kiệm thời gian", "Dụng cụ đầy đủ", "Đặt lịch linh hoạt"]
  },
  "CAT-PLUMB": {
    coverImage: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80",
    displayPriceLabel: "350.000 VND",
    unitLabel: "lần",
    benefits: ["Xử lý nhanh", "Hạn chế rò rỉ", "Báo giá trước"],
    processSteps: ["Kiểm tra lỗi", "Khóa nguồn nước", "Sửa chữa", "Chạy thử", "Vệ sinh khu vực", "Bàn giao"],
    reasons: ["Xử lý nhanh", "Hạn chế rò rỉ", "Báo giá trước", "Bảo hành sau sửa"]
  }
} as const;

function getServiceMeta(categoryCode: string, salaryLabel?: string) {
  const defaults = serviceCatalog.default;
  const categoryMeta = serviceCatalog[categoryCode as keyof typeof serviceCatalog] ?? {};
  return {
    ...defaults,
    ...categoryMeta,
    gallery: "gallery" in categoryMeta ? categoryMeta.gallery : defaults.gallery,
    qualityCommitments: "qualityCommitments" in categoryMeta ? categoryMeta.qualityCommitments : defaults.qualityCommitments,
    reviews: "reviews" in categoryMeta ? categoryMeta.reviews : defaults.reviews,
    faqs: "faqs" in categoryMeta ? categoryMeta.faqs : defaults.faqs,
    displayPriceLabel: salaryLabel ? salaryLabel.replace(" / task", " VND").replace(" / ca", " VND").replace(" / lan", " VND") : ("displayPriceLabel" in categoryMeta ? categoryMeta.displayPriceLabel : defaults.displayPriceLabel)
  };
}

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

  const testimonials = jobs
    .flatMap((job) =>
      getServiceMeta(job.categoryCode, job.salaryLabel).reviews.map((review) => ({
        ...review,
        jobCode: job.code,
        serviceTitle: job.title
      }))
    )
    .slice(0, 6);

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
    featuredJobs: jobs.slice(0, 6),
    testimonials
  });
}

export async function listUserJobs(request: Request, response: Response) {
  const { q, search: searchQuery, categoryCode, categoryName, minBudget, maxBudget, minRating } = request.query;
  const [jobs, employers, categories] = await Promise.all([
    JobPostModel.find({ status: { $in: ["approved", "in_progress"] } }).sort({ createdAt: -1 }).lean(),
    EmployerProfileModel.find().lean(),
    CategoryModel.find().lean()
  ]);

  const employerMap = new Map(employers.map((item) => [item.userCode, item]));
  const categoryMap = new Map(categories.map((item) => [item.code, item]));
  const search = String(q ?? searchQuery ?? "").trim().toLowerCase();
  const categoryFilter = String(categoryCode ?? "").trim();
  const categoryNameFilters = String(categoryName ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const minBudgetFilter = Number(minBudget ?? 0);
  const maxBudgetFilter = Number(maxBudget ?? Number.MAX_SAFE_INTEGER);
  const minRatingFilter = Number(minRating ?? 0);

  const items = jobs
    .map((job) => {
      const serviceMeta = getServiceMeta(job.categoryCode, job.salaryLabel);
      return {
        ...job,
        companyName: employerMap.get(job.employerCode)?.companyName ?? job.employerCode,
        categoryName: categoryMap.get(job.categoryCode)?.name ?? job.categoryCode,
        coverImage: serviceMeta.coverImage,
        ratingLabel: serviceMeta.ratingLabel,
        bookingCountLabel: serviceMeta.bookingCountLabel,
        displayPriceLabel: serviceMeta.displayPriceLabel
      };
    })
    .filter((job) => {
      const matchesCategory = categoryFilter ? job.categoryCode === categoryFilter : true;
      const matchesCategoryName = categoryNameFilters.length ? categoryNameFilters.includes(job.categoryName) : true;
      const matchesSearch = search
        ? [job.title, job.location, job.summary, job.companyName, job.categoryName].some((value) =>
            value.toLowerCase().includes(search)
          )
        : true;
      const matchesBudget = job.budgetMin >= minBudgetFilter && job.budgetMin <= maxBudgetFilter;
      const matchesRating = Number(job.ratingLabel) >= minRatingFilter;

      return matchesCategory && matchesCategoryName && matchesSearch && matchesBudget && matchesRating;
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
  const serviceMeta = getServiceMeta(job.categoryCode, job.salaryLabel);

  response.json({
    ...job,
    companyName: jobEmployer?.companyName ?? job.employerCode,
    serviceAreas: jobEmployer?.serviceAreas ?? [],
    categoryName: jobCategory?.name ?? job.categoryCode,
    applicationsCount: applications.length,
    coverImage: serviceMeta.coverImage,
    gallery: serviceMeta.gallery,
    ratingLabel: serviceMeta.ratingLabel,
    bookingCountLabel: serviceMeta.bookingCountLabel,
    displayPriceLabel: serviceMeta.displayPriceLabel,
    unitLabel: serviceMeta.unitLabel,
    benefits: serviceMeta.benefits,
    processSteps: serviceMeta.processSteps,
    qualityCommitments: serviceMeta.qualityCommitments,
    reasons: serviceMeta.reasons,
    reviews: serviceMeta.reviews,
    faqs: serviceMeta.faqs
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
