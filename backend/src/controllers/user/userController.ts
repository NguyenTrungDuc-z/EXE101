import type { Request, Response } from "express";
import { ApplicationModel } from "../../models/Application.js";
import { CategoryModel } from "../../models/Category.js";
import { EmployerProfileModel } from "../../models/EmployerProfile.js";
import { JobPostModel } from "../../models/JobPost.js";
import { OperationTaskModel } from "../../models/OperationTask.js";
import { OrderModel } from "../../models/Order.js";
import { PaymentModel } from "../../models/Payment.js";
import { UserModel } from "../../models/User.js";
import { WalletTransactionModel } from "../../models/WalletTransaction.js";
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
    unitLabel: "máy",
    serviceVariants: [
      { code: "wall", name: "Máy treo tường", price: 150000, pricingType: "fixed" },
      { code: "cassette", name: "Máy âm trần", price: 250000, pricingType: "fixed" },
      { code: "standing", name: "Máy tủ đứng", price: 300000, pricingType: "fixed" },
      { code: "other", name: "Loại máy khác", priceMin: 250000, priceMax: 500000, pricingType: "range" }
    ],
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
    unitLabel: "ca",
    serviceVariants: [
      { code: "basic", name: "Gói cơ bản", price: 250000, pricingType: "fixed" },
      { code: "deep", name: "Tổng vệ sinh", price: 450000, pricingType: "fixed" },
      { code: "other", name: "Khu vực khác", priceMin: 300000, priceMax: 800000, pricingType: "range" }
    ],
    benefits: ["Nhà sạch nhanh", "Tiết kiệm thời gian", "Dụng cụ đầy đủ"],
    processSteps: ["Khảo sát khu vực", "Dọn rác", "Lau bề mặt", "Vệ sinh sàn", "Kiểm tra lại", "Bàn giao"],
    reasons: ["Nhà sạch nhanh", "Tiết kiệm thời gian", "Dụng cụ đầy đủ", "Đặt lịch linh hoạt"]
  },
  "CAT-PLUMB": {
    coverImage: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80",
    unitLabel: "lần",
    serviceVariants: [
      { code: "leak", name: "Rò rỉ nhẹ", price: 180000, pricingType: "fixed" },
      { code: "pipe", name: "Thay đoạn ống", price: 350000, pricingType: "fixed" },
      { code: "other", name: "Sự cố khác", priceMin: 200000, priceMax: 700000, pricingType: "range" }
    ],
    benefits: ["Xử lý nhanh", "Hạn chế rò rỉ", "Báo giá trước"],
    processSteps: ["Kiểm tra lỗi", "Khóa nguồn nước", "Sửa chữa", "Chạy thử", "Vệ sinh khu vực", "Bàn giao"],
    reasons: ["Xử lý nhanh", "Hạn chế rò rỉ", "Báo giá trước", "Bảo hành sau sửa"]
  }
} as const;

type ServiceVariantInput = {
  code?: string;
  name?: string;
  price?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  pricingType?: string;
};

function formatPriceLabelFromSalary(salaryLabel?: string) {
  if (!salaryLabel) {
    return undefined;
  }

  return salaryLabel
    .replace(/\s*\/\s*task\b/gi, " VND")
    .replace(/\s*\/\s*ca\b/gi, " VND")
    .replace(/\s*\/\s*lan\b/gi, " VND")
    .trim();
}

function normalizeServiceVariants(
  variants: ReadonlyArray<ServiceVariantInput>,
  fallbackUnitPrice: number
) {
  const normalized = variants
    .map((item, index) => {
      const pricingType = item.pricingType === "range" ? "range" : "fixed";
      return {
        code: item.code || `variant-${index + 1}`,
        name: item.name || `Loại ${index + 1}`,
        price: pricingType === "fixed" ? Number(item.price ?? fallbackUnitPrice) : undefined,
        priceMin: pricingType === "range" ? Number(item.priceMin ?? fallbackUnitPrice) : undefined,
        priceMax: pricingType === "range" ? Number(item.priceMax ?? fallbackUnitPrice * 2) : undefined,
        pricingType
      };
    })
    .filter((item) => item.name);

  const hasOther = normalized.some((item) => item.code === "other" || item.pricingType === "range");
  return hasOther
    ? normalized
    : [
        ...normalized,
        {
          code: "other",
          name: "Loại máy khác",
          priceMin: fallbackUnitPrice,
          priceMax: fallbackUnitPrice * 2,
          pricingType: "range"
        }
      ];
}

function getServiceMeta(
  categoryCode: string,
  salaryLabel?: string,
  budgetMin = 150000,
  budgetMax = 500000,
  jobVariants: ReadonlyArray<ServiceVariantInput> = []
) {
  const defaults = serviceCatalog.default;
  const categoryMeta = serviceCatalog[categoryCode as keyof typeof serviceCatalog] ?? {};
  const configuredVariants = jobVariants.length
    ? jobVariants
    : "serviceVariants" in categoryMeta
      ? categoryMeta.serviceVariants
      : defaults.serviceVariants;

  return {
    ...defaults,
    ...categoryMeta,
    gallery: "gallery" in categoryMeta ? categoryMeta.gallery : defaults.gallery,
    qualityCommitments: "qualityCommitments" in categoryMeta ? categoryMeta.qualityCommitments : defaults.qualityCommitments,
    reviews: "reviews" in categoryMeta ? categoryMeta.reviews : defaults.reviews,
    faqs: "faqs" in categoryMeta ? categoryMeta.faqs : defaults.faqs,
    serviceVariants: normalizeServiceVariants(configuredVariants, budgetMin || budgetMax || 150000),
    displayPriceLabel: formatPriceLabelFromSalary(salaryLabel)
  };
}

function normalizeSavedAddresses(addresses: unknown[]) {
  return Array.from(
    new Set(
      addresses
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
    )
  ).slice(0, 8);
}

function toUserProfile(user: {
  code: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  city: string;
  avatar: string;
  address?: string;
  savedAddresses?: string[];
  walletBalance?: number;
}) {
  const savedAddresses = normalizeSavedAddresses([user.address, ...(user.savedAddresses ?? [])]);

  return {
    code: user.code,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    city: user.city,
    avatar: user.avatar,
    address: user.address ?? "",
    savedAddresses,
    walletBalance: user.walletBalance ?? 0
  };
}

function buildTransferContent(orderCode: string) {
  return `HOMESWIFT ${orderCode.replace(/^ORD-/, "BAN")}`.replace(/\s+/g, " ").trim();
}

function buildCheckoutPayload(order: {
  code: string;
  totalAmount: number;
}) {
  const transferContent = buildTransferContent(order.code);
  const qrParams = new URLSearchParams({
    amount: String(order.totalAmount),
    addInfo: transferContent,
    accountName: "HOMESWIFT"
  });

  return {
    transferContent,
    bankName: "VCB",
    accountNumber: "0123456789",
    accountName: "HOMESWIFT",
    qrUrl: `https://img.vietqr.io/image/970436-0123456789-compact2.png?${qrParams.toString()}`
  };
}

export async function getUserHome(_request: Request, response: Response) {
  const [jobs, categories, orders, employers, candidates] = await Promise.all([
    JobPostModel.find({ status: { $in: ["approved", "in_progress"] } }).sort({ createdAt: -1 }).lean(),
    CategoryModel.find().lean(),
    OrderModel.find().lean(),
    UserModel.countDocuments({ role: "employer" }),
    UserModel.countDocuments({ role: "worker" })
  ]);

  const categoryCountMap = new Map<string, number>();
  jobs.forEach((job) => {
    categoryCountMap.set(job.categoryCode, (categoryCountMap.get(job.categoryCode) ?? 0) + 1);
  });

  const testimonials = jobs
    .flatMap((job) =>
      getServiceMeta(job.categoryCode, job.salaryLabel, job.budgetMin, job.budgetMax, job.serviceVariants).reviews.map((review) => ({
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
      activeOrders: orders.filter((order) => ["payment_pending", "PENDING_ASSIGN", "PENDING_ACCEPT", "IN_PROGRESS", "COMPLETED_BY_TECHNICIAN"].includes(order.status)).length
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
      const serviceMeta = getServiceMeta(job.categoryCode, job.salaryLabel, job.budgetMin, job.budgetMax, job.serviceVariants);
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
  const serviceMeta = getServiceMeta(job.categoryCode, job.salaryLabel, job.budgetMin, job.budgetMax, job.serviceVariants);

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
    faqs: serviceMeta.faqs,
    serviceVariants: serviceMeta.serviceVariants
  });
}

export async function listUserApplications(request: any, response: Response) {
  const candidateCode = request.user.code;
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

export async function listUserOrders(request: any, response: Response) {
  const userCode = request.user.code;
  const [orders, jobs, users] = await Promise.all([
    OrderModel.find({
      $or: [{ employerCode: userCode }, { candidateCode: userCode }]
    })
      .sort({ scheduledAt: -1 })
      .lean(),
    JobPostModel.find().lean(),
    UserModel.find().lean()
  ]);

  const jobMap = new Map(jobs.map((item) => [item.code, item]));
  const userMap = new Map(users.map((item) => [item.code, item]));

  response.json(
    orders.map((order) => {
      const employer = userMap.get(order.employerCode);
      const candidate = userMap.get(order.candidateCode);
      
      return {
        ...order,
        jobTitle: jobMap.get(order.jobCode)?.title ?? order.jobCode,
        employerName: employer?.name ?? order.employerCode,
        employerAvatar: employer?.avatar ?? "",
        candidateName: candidate?.name ?? "Chưa có thợ nhận",
        candidateAvatar: candidate?.avatar ?? "https://i.pravatar.cc/150?u=unassigned"
      };
    })
  );
}

export async function getUserProfile(request: any, response: Response) {
  const userCode = request.user.code;
  const user = await UserModel.findOne({ code: userCode }).lean();

  if (!user) {
    response.status(404).json({ message: "Không tìm thấy người dùng." });
    return;
  }

  response.json(toUserProfile(user));
}

export async function updateUserProfile(request: any, response: Response) {
  const userCode = request.user.code;
  const address = String(request.body.address ?? "").trim();
  const savedAddresses = Array.isArray(request.body.savedAddresses) ? request.body.savedAddresses : [];

  const user = await UserModel.findOne({ code: userCode });
  if (!user) {
    response.status(404).json({ message: "Không tìm thấy người dùng." });
    return;
  }

  user.set({
    address,
    savedAddresses: normalizeSavedAddresses([address, ...savedAddresses])
  });
  await user.save();

  response.json(toUserProfile(user.toObject()));
}

export async function createUserOrder(request: any, response: Response) {
  const userCode = request.user.code;
  const {
    jobCode,
    scheduledAt,
    totalAmount,
    paymentMethod,
    address,
    quantity,
    machineType
  } = request.body;

  const normalizedAddress = String(address ?? "").trim();
  const scheduledDate = new Date(String(scheduledAt ?? ""));
  const amount = Number(totalAmount ?? 0);

  if (!userCode || !jobCode) {
    response.status(400).json({ message: "Thiếu thông tin người dùng hoặc dịch vụ." });
    return;
  }

  if (!normalizedAddress) {
    response.status(400).json({ message: "Vui lòng nhập địa chỉ dịch vụ." });
    return;
  }

  if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() < Date.now()) {
    response.status(400).json({ message: "Không thể đặt lịch trong quá khứ." });
    return;
  }

  if (!amount || amount <= 0) {
    response.status(400).json({ message: "Số tiền thanh toán không hợp lệ." });
    return;
  }

  const [user, job] = await Promise.all([
    UserModel.findOne({ code: userCode }),
    JobPostModel.findOne({ code: jobCode }).lean()
  ]);

  if (!user) {
    response.status(404).json({ message: "Không tìm thấy người dùng." });
    return;
  }

  if (!job) {
    response.status(404).json({ message: "Không tìm thấy dịch vụ." });
    return;
  }

  // Chặn Thợ tự đặt dịch vụ của chính mình
  // if (user.code === job.employerCode) {
  //   response.status(400).json({ message: "Bạn không thể tự đặt dịch vụ của chính mình." });
  //   return;
  // }

  if (paymentMethod === "wallet" && (user.walletBalance ?? 0) < amount) {
    response.status(400).json({ message: "Số dư ví không đủ để thanh toán." });
    return;
  }

  if (paymentMethod === "wallet") {
    user.walletBalance = (user.walletBalance ?? 0) - amount;
  }

  user.savedAddresses = normalizeSavedAddresses([normalizedAddress, user.address, ...(user.savedAddresses ?? [])]);
  if (!user.address) {
    user.address = normalizedAddress;
  }
  await user.save();

  const order = await OrderModel.create({
    code: generateCode("ORD"),
    jobCode: job.code,
    employerCode: user.code,
    candidateCode: job.employerCode,
    status: paymentMethod === "wallet" ? "PENDING_ASSIGN" : "payment_pending",
    scheduledAt: scheduledDate,
    totalAmount: amount,
    frozenBalance: paymentMethod === "wallet" ? amount : 0,
    platformFee: 0,
    workerPayout: 0,
    paymentStatus: paymentMethod === "wallet" ? "paid" : "pending",
    address: normalizedAddress
  });

  await PaymentModel.create({
    code: generateCode("PAY"),
    orderCode: order.code,
    payerCode: user.code,
    payeeCode: job.employerCode,
    type: "service_booking",
    status: paymentMethod === "wallet" ? "paid" : "pending",
    amount,
    method: String(paymentMethod ?? "card"),
    createdAt: new Date()
  });

  const orderPayload = {
    ...order.toObject(),
    jobTitle: `${job.title} (${quantity ?? 1} ${getServiceMeta(job.categoryCode, job.salaryLabel).unitLabel}${machineType ? ` - ${machineType}` : ""})`
  };

  response.status(201).json({
    order: orderPayload,
    checkout: paymentMethod === "wallet" ? null : buildCheckoutPayload(order)
  });
}

export async function markOrderTransferred(request: Request, response: Response) {
  const { orderCode } = request.params;
  const order = await OrderModel.findOne({ code: orderCode });

  if (!order) {
    response.status(404).json({ message: "Không tìm thấy đơn hàng." });
    return;
  }

  if (order.status !== "payment_pending") {
    response.status(400).json({ message: "Đơn hàng không ở trạng thái chờ chuyển khoản." });
    return;
  }

  order.status = "payment_review";
  order.paymentStatus = "pending";
  await order.save();

  await OperationTaskModel.create({
    code: generateCode("OPS"),
    type: "escrow_payment_review",
    title: `Duyệt tiền chuyển khoản ${order.code}`,
    status: "open",
    ownerTeam: "finance",
    priority: "high",
    slaHours: 2,
    relatedType: "order",
    relatedCode: order.code,
    createdAt: new Date()
  });

  response.json({
    ...order.toObject(),
    checkout: buildCheckoutPayload(order)
  });
}

export async function acceptUserOrder(request: Request, response: Response) {
  const { orderCode } = request.params;
  const workerCode = String(request.body.workerCode ?? "");
  const order = await OrderModel.findOne({ code: orderCode });

  if (!order) {
    response.status(404).json({ message: "Không tìm thấy đơn hàng." });
    return;
  }

  if (order.status !== "PENDING_ASSIGN") {
    response.status(400).json({ message: "Đơn hàng chưa sẵn sàng để thợ nhận." });
    return;
  }

  if (workerCode) {
    order.candidateCode = workerCode;
  }
  order.status = "IN_PROGRESS";
  await order.save();

  response.json(order);
}

export async function requestOrderCompletion(request: Request, response: Response) {
  const { orderCode } = request.params;
  const order = await OrderModel.findOne({ code: orderCode });

  if (!order) {
    response.status(404).json({ message: "Không tìm thấy đơn hàng." });
    return;
  }

  if (!["COMPLETED_BY_TECHNICIAN", "IN_PROGRESS"].includes(order.status)) {
    response.status(400).json({ message: "Đơn hàng chưa ở trạng thái thực hiện." });
    return;
  }

  order.status = "COMPLETED_BY_TECHNICIAN";
  await order.save();

  response.json(order);
}

export async function completeUserOrder(request: Request, response: Response) {
  const { orderCode } = request.params;
  const order = await OrderModel.findOne({ code: orderCode });

  if (!order) {
    response.status(404).json({ message: "Không tìm thấy đơn hàng." });
    return;
  }

  if (!["COMPLETED_BY_TECHNICIAN", "IN_PROGRESS"].includes(order.status)) {
    response.status(400).json({ message: "Đơn hàng chưa thể nghiệm thu." });
    return;
  }

  const frozenAmount = order.frozenBalance || order.totalAmount;
  
  // Random commission rate between 20% and 30%
  const commissionRate = Math.floor(Math.random() * (30 - 20 + 1) + 20) / 100; // e.g. 0.20 to 0.30
  
  const platformFee = Math.round(frozenAmount * commissionRate);
  const workerPayout = frozenAmount - platformFee;
  const worker = await UserModel.findOne({ code: order.candidateCode });

  if (worker) {
    worker.walletBalance = (worker.walletBalance ?? 0) + workerPayout;
    await worker.save();
    
    // Create wallet transaction for worker earning
    await WalletTransactionModel.create({
      code: generateCode("WTR"),
      userCode: worker.code,
      type: "earning",
      amount: workerPayout,
      description: `Nhận tiền từ đơn hàng ${order.code} (đã trừ ${commissionRate * 100}% chiết khấu)`,
      relatedOrderCode: order.code,
      balanceAfter: worker.walletBalance,
      createdAt: new Date()
    });
  }

  order.status = "SUCCESS";
  order.paymentStatus = "paid";
  order.frozenBalance = 0;
  order.workerPayout = workerPayout;
  order.platformFee = platformFee;
  order.commissionRate = commissionRate;
  order.commissionAmount = platformFee;
  order.earningAmount = workerPayout;
  await order.save();

  await PaymentModel.create({
    code: generateCode("SET"),
    orderCode: order.code,
    payerCode: order.employerCode,
    payeeCode: order.candidateCode,
    type: "escrow_release",
    status: "paid",
    amount: workerPayout,
    method: "wallet",
    createdAt: new Date()
  });

  await PaymentModel.create({
    code: generateCode("REV"),
    orderCode: order.code,
    payerCode: order.employerCode,
    payeeCode: "HOMESWIFT",
    type: "platform_fee",
    status: "paid",
    amount: platformFee,
    method: "escrow",
    createdAt: new Date()
  });

  response.json(order);
}

export async function createWalletTransaction(request: any, response: Response) {
  const userCode = request.user.code;
  const type = String(request.body.type ?? "");
  const amount = Number(request.body.amount ?? 0);
  const bankName = String(request.body.bankName ?? "").trim();
  const bankAccount = String(request.body.bankAccount ?? "").trim();
  const accountHolder = String(request.body.accountHolder ?? "").trim();

  if (!userCode) {
    response.status(400).json({ message: "Thiếu mã người dùng." });
    return;
  }

  if (!["deposit", "withdraw"].includes(type)) {
    response.status(400).json({ message: "Loại giao dịch ví không hợp lệ." });
    return;
  }

  if (!amount || amount < 10000) {
    response.status(400).json({ message: "Số tiền tối thiểu là 10.000đ." });
    return;
  }

  const user = await UserModel.findOne({ code: userCode });
  if (!user) {
    response.status(404).json({ message: "Không tìm thấy người dùng." });
    return;
  }

  if (type === "withdraw" && (user.walletBalance ?? 0) < amount) {
    response.status(400).json({ message: "Số dư ví không đủ để rút tiền." });
    return;
  }

  if (type === "withdraw" && (!bankName || !bankAccount || !accountHolder)) {
    response.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng." });
    return;
  }

  if (type === "deposit") {
    user.walletBalance = (user.walletBalance ?? 0) + amount;
    await user.save();
    
    await WalletTransactionModel.create({
      code: generateCode("WTR"),
      userCode: user.code,
      type: "deposit",
      amount,
      description: "Nạp tiền vào ví",
      balanceAfter: user.walletBalance,
      createdAt: new Date()
    });
  } else if (type === "withdraw") {
    user.walletBalance = (user.walletBalance ?? 0) - amount;
    await user.save();
    
    await WalletTransactionModel.create({
      code: generateCode("WTR"),
      userCode: user.code,
      type: "withdraw",
      amount,
      description: `Rút tiền về ${bankName} - ${bankAccount}`,
      balanceAfter: user.walletBalance,
      createdAt: new Date()
    });
  }

  const payment = await PaymentModel.create({
    code: generateCode("WAL"),
    orderCode: "WALLET",
    payerCode: user.code,
    payeeCode: user.code,
    type: `wallet_${type}`,
    status: type === "deposit" ? "paid" : "pending",
    amount,
    method: type === "deposit" ? "wallet" : `${bankName} | ${bankAccount} | ${accountHolder}`,
    createdAt: new Date()
  });

  if (type === "withdraw") {
    await OperationTaskModel.create({
      code: generateCode("OPS"),
      type: "wallet_withdrawal",
      title: `Duyệt rút tiền ${payment.code}`,
      status: "open",
      ownerTeam: "finance",
      priority: "medium",
      slaHours: 24,
      relatedType: "payment",
      relatedCode: payment.code,
      createdAt: new Date()
    });
  }

  response.status(201).json({
    ...toUserProfile(user.toObject()),
    pendingWithdrawalCode: type === "withdraw" ? payment.code : undefined
  });
}

export async function createUserJob(request: any, response: Response) {
  const employerCode = request.user.code;
  const {
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
    serviceVariants,
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
    serviceVariants: Array.isArray(serviceVariants) ? serviceVariants : [],
    startDate: new Date(startDate),
    createdAt: new Date(),
    status: "pending",
    applicantsCount: 0
  });

  response.status(201).json(job);
}

export async function createUserApplication(request: any, response: Response) {
  const candidateCode = request.user.code;
  const { jobCode, note } = request.body;

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
