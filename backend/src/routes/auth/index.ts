import { Router } from "express";
import { loginWithPhone } from "../../controllers/auth/authController.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(loginWithPhone));
