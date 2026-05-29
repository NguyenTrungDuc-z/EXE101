import type {
  AdminOverview,
  Application,
  Candidate,
  CheckoutInfo,
  Employer,
  Job,
  JobDetail,
  LoginResponse,
  OperationsResponse,
  Order,
  UserProfile,
  UserHome
} from "../types/platform";
import { apiFetch } from "./client";

export const platformApi = {
  login: (payload: { phone: string }) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  register: (payload: { name: string; phone: string; email: string; city: string }) =>
    apiFetch<{ message: string; phone: string; expiresInSeconds: number; devOtp?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  verifyRegisterOtp: (payload: { phone: string; otp: string }) =>
    apiFetch<LoginResponse>("/auth/register/verify", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getAdminOverview: () => apiFetch<AdminOverview>("/admin/overview"),
  getAdminJobs: () => apiFetch<Job[]>("/admin/jobs"),
  getAdminEmployers: () => apiFetch<Employer[]>("/admin/employers"),
  getAdminCandidates: () => apiFetch<Candidate[]>("/admin/candidates"),
  getAdminOperations: () => apiFetch<OperationsResponse>("/admin/operations"),
  getUserHome: () => apiFetch<UserHome>("/user/home"),
  getUserJobs: (query = "") => apiFetch<Job[]>(`/user/jobs${query}`),
  getUserJobDetail: (jobCode: string) => apiFetch<JobDetail>(`/user/jobs/${jobCode}`),
  getUserProfile: (userCode: string) => apiFetch<UserProfile>(`/user/profile?userCode=${userCode}`),
  updateUserProfile: (payload: { userCode: string; address: string; savedAddresses: string[] }) =>
    apiFetch<UserProfile>("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  getUserApplications: (candidateCode: string) =>
    apiFetch<Application[]>(`/user/applications?candidateCode=${candidateCode}`),
  getUserOrders: (userCode: string) => apiFetch<Order[]>(`/user/orders?userCode=${userCode}`),
  createUserOrder: (payload: Record<string, unknown>) =>
    apiFetch<{ order: Order; checkout: CheckoutInfo | null }>("/user/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  markOrderTransferred: (orderCode: string) =>
    apiFetch<Order & { checkout: CheckoutInfo }>(`/user/orders/${orderCode}/transferred`, {
      method: "POST"
    }),
  acceptUserOrder: (orderCode: string, workerCode: string) =>
    apiFetch<Order>(`/user/orders/${orderCode}/accept`, {
      method: "POST",
      body: JSON.stringify({ workerCode })
    }),
  requestOrderCompletion: (orderCode: string) =>
    apiFetch<Order>(`/user/orders/${orderCode}/request-completion`, {
      method: "POST"
    }),
  completeUserOrder: (orderCode: string) =>
    apiFetch<Order>(`/user/orders/${orderCode}/complete`, {
      method: "POST"
    }),
  createWalletTransaction: (payload: {
    userCode: string;
    type: "deposit" | "withdraw";
    amount: number;
    bankName?: string;
    bankAccount?: string;
    accountHolder?: string;
  }) =>
    apiFetch<UserProfile & { pendingWithdrawalCode?: string }>("/user/wallet/transactions", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  approveEscrowPayment: (orderCode: string) =>
    apiFetch<Order>(`/admin/orders/${orderCode}/approve-escrow`, {
      method: "POST"
    }),
  approveWithdrawal: (paymentCode: string) =>
    apiFetch<unknown>(`/admin/withdrawals/${paymentCode}/approve`, {
      method: "POST"
    }),
  createUserJob: (payload: Record<string, unknown>) =>
    apiFetch<Job>("/user/jobs", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createUserApplication: (payload: Record<string, unknown>) =>
    apiFetch<Application>("/user/applications", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  chatWithGemini: (payload: { message: string }) =>
    apiFetch<{ reply: string }>("/chat", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
