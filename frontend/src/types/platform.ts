export type MetricCard = {
  label: string;
  value: number;
};

export type QueueCard = {
  label: string;
  value: number;
  sla: string;
};

export type Job = {
  code: string;
  title: string;
  categoryCode: string;
  categoryName?: string;
  employerCode: string;
  companyName?: string;
  location: string;
  salaryLabel: string;
  budgetMin: number;
  budgetMax: number;
  employmentType: string;
  urgency: string;
  status: string;
  summary: string;
  requirements: string[];
  startDate: string;
  createdAt: string;
  applicantsCount: number;
  coverImage?: string;
  ratingLabel?: string;
  bookingCountLabel?: string;
  displayPriceLabel?: string;
};

export type Employer = {
  code: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  city: string;
  companyName: string;
  kycStatus: string;
  serviceAreas: string[];
  walletBalance: number;
  packageName: string;
  totalJobs: number;
};

export type Worker = {
  code: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  city: string;
  headline: string;
  skills: string[];
  rating: number;
  verified: boolean;
  completedJobs: number;
  availability: string;
  totalApplications: number;
  totalOrders: number;
};

export type OperationTask = {
  code: string;
  type: string;
  title: string;
  status: string;
  ownerTeam: string;
  priority: string;
  slaHours: number;
  relatedType: string;
  relatedCode: string;
  createdAt: string;
};

export type Complaint = {
  code: string;
  ownerCode: string;
  targetType: string;
  targetCode: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
};

export type Category = {
  code: string;
  name: string;
  slug: string;
  icon: string;
  serviceType: string;
  averageBudgetLabel: string;
  openJobs?: number;
};

export type Application = {
  code: string;
  jobCode: string;
  workerCode: string;
  status: string;
  note: string;
  appliedAt: string;
  jobTitle?: string;
  location?: string;
  salaryLabel?: string;
};

export type Order = {
  _id?: string;
  code: string;
  jobCode: string;
  employerCode: string;
  workerCode: string;
  status: string;
  scheduledAt: string;
  totalAmount: number;
  frozenBalance?: number;
  platformFee?: number;
  workerPayout?: number;
  technicianPayout?: number;
  technicianId?: string;
  paymentStatus: string;
  address: string;
  jobTitle?: string;
  materialTotal?: number;
  materialStatus?: string;
  isReviewed?: boolean;
  completedAt?: string;
  isReleased?: boolean;
  invoiceItems?: Array<{ name: string; price: number }>;
  materialRequests?: Array<{ name: string; quantity: number; price: number; isApprovedByCustomer: boolean }>;
  categoryName?: string;
};

export type WalletTransaction = {
  code: string;
  userCode: string;
  type: "deposit" | "withdraw" | "payment" | "earning" | "commission";
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
};

export type MaterialItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type MaterialList = {
  code: string;
  orderCode: string;
  workerCode: string;
  employerCode: string;
  items: MaterialItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "rejected";
  note: string;
  createdAt: string;
};

export type CheckoutInfo = {
  transferContent: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrUrl: string;
};

export type AdminOverview = {
  cards: MetricCard[];
  queues: QueueCard[];
  recentJobs: Job[];
};

export type UserHome = {
  hero: {
    totalOpenJobs: number;
    totalEmployers: number;
    totalWorkers: number;
    activeOrders: number;
  };
  categories: Category[];
  featuredJobs: Job[];
  testimonials: Array<{
    author: string;
    rating: number;
    comment: string;
    image: string;
    jobCode: string;
    serviceTitle: string;
  }>;
};

export type AuthUser = {
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
};

export type UserProfile = AuthUser & {
  address: string;
  savedAddresses: string[];
  walletBalance: number;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type OperationsResponse = {
  tasks: OperationTask[];
  alerts: {
    pendingJobs: Array<{ code: string; title: string; type: string }>;
    reviewEmployers: Array<{ code: string; title: string; type: string }>;
    escrowOrders: Array<{
      _id?: string;
      code: string;
      title: string;
      amount: number;
      transferContent: string;
      address: string;
      status: string;
    }>;
    withdrawals: Array<{ code: string; userCode: string; amount: number; method: string; status: string; createdAt: string }>;
    complaints: Complaint[];
  };
};

export type JobDetail = Job & {
  companyName: string;
  serviceAreas: string[];
  categoryName: string;
  applicationsCount: number;
  gallery: string[];
  unitLabel: string;
  benefits: string[];
  processSteps: string[];
  qualityCommitments: string[];
  reasons: string[];
  reviews: Array<{
    author: string;
    rating: number;
    comment: string;
    image: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  serviceVariants: Array<{
    code: string;
    name: string;
    price?: number;
    priceMin?: number;
    priceMax?: number;
    pricingType: "fixed" | "range";
  }>;
};
