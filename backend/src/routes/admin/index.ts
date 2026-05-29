import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import {
  approveEscrowPayment,
  approveWithdrawal,
  getOverview,
  listAdminCandidates,
  listAdminEmployers,
  listAdminJobs,
  listAdminOperations
} from "../../controllers/admin/adminController.js";

export const adminRouter = Router();

adminRouter.get("/overview", asyncHandler(getOverview));
adminRouter.get("/jobs", asyncHandler(listAdminJobs));
adminRouter.get("/employers", asyncHandler(listAdminEmployers));
adminRouter.get("/candidates", asyncHandler(listAdminCandidates));
adminRouter.get("/operations", asyncHandler(listAdminOperations));
adminRouter.post("/orders/:orderCode/approve-escrow", asyncHandler(approveEscrowPayment));
adminRouter.post("/withdrawals/:paymentCode/approve", asyncHandler(approveWithdrawal));
