import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
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

export const userRouter = Router();

userRouter.get("/home", asyncHandler(getUserHome));
userRouter.get("/jobs", asyncHandler(listUserJobs));
userRouter.get("/jobs/:jobCode", asyncHandler(getUserJobDetail));
userRouter.get("/profile", asyncHandler(getUserProfile));
userRouter.get("/applications", asyncHandler(listUserApplications));
userRouter.get("/orders", asyncHandler(listUserOrders));
userRouter.patch("/profile", asyncHandler(updateUserProfile));
userRouter.post("/jobs", asyncHandler(createUserJob));
userRouter.post("/applications", asyncHandler(createUserApplication));
userRouter.post("/orders", asyncHandler(createUserOrder));
userRouter.post("/orders/:orderCode/transferred", asyncHandler(markOrderTransferred));
userRouter.post("/orders/:orderCode/accept", asyncHandler(acceptUserOrder));
userRouter.post("/orders/:orderCode/request-completion", asyncHandler(requestOrderCompletion));
userRouter.post("/orders/:orderCode/complete", asyncHandler(completeUserOrder));
userRouter.post("/wallet/transactions", asyncHandler(createWalletTransaction));
