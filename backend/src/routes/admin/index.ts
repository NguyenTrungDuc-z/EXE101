import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import {
  approveEscrowPayment,
  approveWithdrawal,
  getOverview,
  listAdminCandidates,
  listAdminEmployers,
  listAdminJobs,
  listAdminOperations,
  listAdminUsers,
  updateUserRole,
  approveJob,
  rejectJob
} from "../../controllers/admin/adminController.js";

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(authorize("admin"));

adminRouter.get("/overview", asyncHandler(getOverview));
adminRouter.get("/jobs", asyncHandler(listAdminJobs));
adminRouter.get("/employers", asyncHandler(listAdminEmployers));
adminRouter.get("/candidates", asyncHandler(listAdminCandidates));
adminRouter.get("/operations", asyncHandler(listAdminOperations));
adminRouter.get("/users", asyncHandler(listAdminUsers));
adminRouter.patch("/users/:userCode/role", asyncHandler(updateUserRole));
adminRouter.post("/escrow/:orderCode/approve", asyncHandler(approveEscrowPayment));
adminRouter.post("/withdrawals/:paymentCode/approve", asyncHandler(approveWithdrawal));
adminRouter.post("/jobs/:jobCode/approve", asyncHandler(approveJob));
adminRouter.post("/jobs/:jobCode/reject", asyncHandler(rejectJob));
