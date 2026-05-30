import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import {
  createUserApplication,
  createUserJob,
  createUserOrder,
  createWalletTransaction,
  acceptUserOrder,
  completeUserOrder,
  getUserHome,
  getUserJobDetail,
  getUserProfile,
  listUserApplications,
  listUserJobs,
  markOrderTransferred,
  requestOrderCompletion,
  listUserOrders,
  updateUserProfile
} from "../../controllers/user/userController.js";
import { featureController } from "../../controllers/user/featureController.js";
import {
  acceptOrder,
  createInvoice,
  approveInvoice,
  completeAndPayOrder,
  getPendingOrders,
  getOrderDetail
} from "../../controllers/user/orderController.js";

export const userRouter = Router();

userRouter.get("/home", asyncHandler(getUserHome));
userRouter.get("/jobs", asyncHandler(listUserJobs));
userRouter.get("/jobs/:jobCode", asyncHandler(getUserJobDetail));

userRouter.use(authenticate);
userRouter.get("/profile", asyncHandler(getUserProfile));
userRouter.get("/applications", asyncHandler(listUserApplications));
userRouter.get("/orders", asyncHandler(listUserOrders));
userRouter.patch("/profile", asyncHandler(updateUserProfile));

userRouter.post("/jobs", authorize("employer"), asyncHandler(createUserJob));
userRouter.post("/applications", authorize("candidate"), asyncHandler(createUserApplication));
userRouter.post("/orders", authorize("employer"), asyncHandler(createUserOrder));
userRouter.post("/orders/:orderCode/transferred", authorize("employer"), asyncHandler(markOrderTransferred));
userRouter.post("/orders/:orderCode/accept", authorize("candidate"), asyncHandler(acceptUserOrder));
userRouter.post("/orders/:orderCode/request-completion", authorize("candidate"), asyncHandler(requestOrderCompletion));
userRouter.post("/orders/:orderCode/complete", authorize("employer"), asyncHandler(completeUserOrder));
userRouter.post("/wallet/transactions", asyncHandler(createWalletTransaction));

// Feature routes
userRouter.post("/reviews", authorize("employer"), asyncHandler(featureController.createReview));
userRouter.post("/material-lists", authorize("candidate"), asyncHandler(featureController.createMaterialList));
userRouter.get("/material-lists/:orderCode", asyncHandler(featureController.getMaterialList));
userRouter.post("/material-lists/confirm", authorize("employer"), asyncHandler(featureController.confirmMaterialList));
userRouter.get("/wallet/history", asyncHandler(featureController.getWalletTransactions));

// Order management routes
userRouter.post("/orders/accept", authorize("candidate"), asyncHandler(acceptOrder));
userRouter.post("/orders/invoice", authorize("candidate"), asyncHandler(createInvoice));
userRouter.post("/orders/approve-invoice", authorize("employer"), asyncHandler(approveInvoice));
userRouter.post("/orders/complete-and-pay", authorize("employer"), asyncHandler(completeAndPayOrder));
userRouter.get("/orders/pending", authorize("candidate"), asyncHandler(getPendingOrders));
userRouter.get("/orders/detail/:orderCode", asyncHandler(getOrderDetail));
