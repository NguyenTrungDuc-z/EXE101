import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import {
  approveEscrowPayment,
  approveWithdrawal,
  getOverview,
  listAdminWorkers,
  listAdminEmployers,
  listAdminJobs,
  listAdminOperations,
  listAdminOrders,
  listAdminUsers,
  updateUserRole,
  approveJob,
  rejectJob,
  assignTechnician,
  getAvailableTechnicians
} from "../../controllers/admin/adminController.js";

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(authorize("admin"));

adminRouter.get("/overview", asyncHandler(getOverview));
adminRouter.get("/jobs", asyncHandler(listAdminJobs));
adminRouter.get("/orders", asyncHandler(listAdminOrders));
adminRouter.get("/employers", asyncHandler(listAdminEmployers));
adminRouter.get("/candidates", asyncHandler(listAdminWorkers));
adminRouter.get("/operations", asyncHandler(listAdminOperations));
adminRouter.get("/users", asyncHandler(listAdminUsers));
adminRouter.patch("/users/:userCode/role", asyncHandler(updateUserRole));
adminRouter.post("/escrow/:orderCode/approve", asyncHandler(approveEscrowPayment));
adminRouter.post("/withdrawals/:paymentCode/approve", asyncHandler(approveWithdrawal));
adminRouter.post("/jobs/:jobCode/approve", asyncHandler(approveJob));
adminRouter.post("/jobs/:jobCode/reject", asyncHandler(rejectJob));
adminRouter.get("/technicians/available", asyncHandler(getAvailableTechnicians));
adminRouter.put("/orders/:orderCode/assign", asyncHandler(assignTechnician));
