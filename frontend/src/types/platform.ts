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

export type Candidate = {
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
  candidateCode: string;
  status: string;
  note: string;
  appliedAt: string;
  jobTitle?: string;
  location?: string;
  salaryLabel?: string;
};

export type Order = {
  code: string;
  jobCode: string;
  employerCode: string;
  candidateCode: string;
  status: string;
  scheduledAt: string;
  totalAmount: number;
  paymentStatus: string;
  address: string;
  jobTitle?: string;
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
    totalCandidates: number;
    activeOrders: number;
  };
  categories: Category[];
  featuredJobs: Job[];
};

export type OperationsResponse = {
  tasks: OperationTask[];
  alerts: {
    pendingJobs: Array<{ code: string; title: string; type: string }>;
    reviewEmployers: Array<{ code: string; title: string; type: string }>;
    complaints: Complaint[];
  };
};

export type JobDetail = Job & {
  companyName: string;
  serviceAreas: string[];
  categoryName: string;
  applicationsCount: number;
};
