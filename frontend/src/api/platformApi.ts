import type {
  AdminOverview,
  Application,
  Candidate,
  Employer,
  Job,
  JobDetail,
  OperationsResponse,
  Order,
  UserHome
} from "../types/platform";
import { apiFetch } from "./client";

export const platformApi = {
  getAdminOverview: () => apiFetch<AdminOverview>("/admin/overview"),
  getAdminJobs: () => apiFetch<Job[]>("/admin/jobs"),
  getAdminEmployers: () => apiFetch<Employer[]>("/admin/employers"),
  getAdminCandidates: () => apiFetch<Candidate[]>("/admin/candidates"),
  getAdminOperations: () => apiFetch<OperationsResponse>("/admin/operations"),
  getUserHome: () => apiFetch<UserHome>("/user/home"),
  getUserJobs: (query = "") => apiFetch<Job[]>(`/user/jobs${query}`),
  getUserJobDetail: (jobCode: string) => apiFetch<JobDetail>(`/user/jobs/${jobCode}`),
  getUserApplications: (candidateCode: string) =>
    apiFetch<Application[]>(`/user/applications?candidateCode=${candidateCode}`),
  getUserOrders: (userCode: string) => apiFetch<Order[]>(`/user/orders?userCode=${userCode}`),
  createUserJob: (payload: Record<string, unknown>) =>
    apiFetch<Job>("/user/jobs", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createUserApplication: (payload: Record<string, unknown>) =>
    apiFetch<Application>("/user/applications", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
