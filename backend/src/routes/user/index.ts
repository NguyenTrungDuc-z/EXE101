import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import {
  createUserApplication,
  createUserJob,
  getUserHome,
  getUserJobDetail,
  listUserApplications,
  listUserJobs,
  listUserOrders
} from "../../controllers/user/userController.js";

export const userRouter = Router();

userRouter.get("/home", asyncHandler(getUserHome));
userRouter.get("/jobs", asyncHandler(listUserJobs));
userRouter.get("/jobs/:jobCode", asyncHandler(getUserJobDetail));
userRouter.get("/applications", asyncHandler(listUserApplications));
userRouter.get("/orders", asyncHandler(listUserOrders));
userRouter.post("/jobs", asyncHandler(createUserJob));
userRouter.post("/applications", asyncHandler(createUserApplication));
